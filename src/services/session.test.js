import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import * as api from './api'
import * as auth from './auth'
import { createSession } from './session'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
  api.configureApi({
    tokenGetter: () => null,
    unauthorizedHandler: () => {},
    refreshHandler: async () => {},
    sessionGetter: () => null,
  })
})

afterEach(() => { vi.unstubAllGlobals() })

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'content-type': 'application/json' },
  })
}

function deferred() {
  let resolve
  const promise = new Promise((done) => { resolve = done })
  return { promise, resolve }
}

test('an authenticated 401 renews and retries the original request once', async () => {
  let token = 'expired'
  let refreshes = 0
  const sent = []
  api.configureApi({
    tokenGetter: () => token,
    refreshHandler: async () => { refreshes++; token = 'renewed' },
    unauthorizedHandler: () => { throw new Error('A renewed session must stay signed in') },
  })
  globalThis.fetch = async (_url, options) => {
    sent.push(options.headers.Authorization)
    return options.headers.Authorization === 'Bearer renewed'
      ? json(200, { id: 7 }) : json(401, { detail: 'Expired' })
  }
  expect(await api.apiRequest('/users/me')).toEqual({ id: 7 })
  expect(refreshes).toBe(1)
  expect(sent).toEqual(['Bearer expired', 'Bearer renewed'])
})

test('a second 401 ends the session without a refresh loop', async () => {
  let token = 'expired'
  let refreshes = 0
  let logouts = 0
  let requests = 0
  api.configureApi({
    tokenGetter: () => token,
    refreshHandler: async () => { refreshes++; token = 'renewed' },
    unauthorizedHandler: () => { logouts++ },
  })
  globalThis.fetch = async () => { requests++; return json(401, { detail: 'Rejected' }) }
  await expect(api.apiRequest('/users/me')).rejects.toMatchObject({ status: 401 })
  expect(refreshes).toBe(1)
  expect(requests).toBe(2)
  expect(logouts).toBe(1)
})

test('a failed renewal does not retry the protected request', async () => {
  let requests = 0
  let logouts = 0
  api.configureApi({
    tokenGetter: () => 'expired',
    refreshHandler: async () => { throw new api.ApiError(401, 'Expired', 'unauthorized') },
    unauthorizedHandler: () => { logouts++ },
  })
  globalThis.fetch = async () => { requests++; return json(401, { detail: 'Expired' }) }
  await expect(api.apiRequest('/users/me')).rejects.toMatchObject({ status: 401 })
  expect(requests).toBe(1)
  expect(logouts).toBe(1)
})

test('public login failures do not attempt renewal', async () => {
  api.configureApi({
    tokenGetter: () => 'existing',
    refreshHandler: () => { throw new Error('Login must not renew') },
    unauthorizedHandler: () => { throw new Error('Login must not clear another session') },
  })
  globalThis.fetch = async () => json(401, { detail: 'Wrong password' })
  await expect(api.apiRequest('/auth/login', { auth: false })).rejects.toMatchObject({ status: 401 })
})

test('downloads renew and return the file after retry', async () => {
  let token = 'expired'
  api.configureApi({
    tokenGetter: () => token,
    refreshHandler: async () => { token = 'renewed' },
    unauthorizedHandler: () => { throw new Error('Download must renew') },
  })
  globalThis.fetch = async (_url, options) => options.headers.Authorization === 'Bearer renewed'
    ? new Response('amount\n100', { headers: { 'content-disposition': 'attachment; filename="payments.csv"' } })
    : json(401, { detail: 'Expired' })
  const result = await api.apiDownload('/payments/export')
  expect(await result.blob.text()).toBe('amount\n100')
  expect(result.filename).toBe('payments.csv')
})

test('aborted requests do not renew or log out', async () => {
  api.configureApi({
    tokenGetter: () => 'existing',
    refreshHandler: () => { throw new Error('An abort must not renew') },
    unauthorizedHandler: () => { throw new Error('An abort must not log out') },
  })
  globalThis.fetch = async () => { throw new DOMException('Aborted', 'AbortError') }
  await expect(api.apiRequest('/users/me')).rejects.toMatchObject({ name: 'AbortError' })
})

test('login and refresh send cookies; refresh sends its CSRF header', async () => {
  const sent = []
  globalThis.fetch = async (url, options) => {
    sent.push({ url, ...options })
    return json(200, { access_token: 'new', token_type: 'bearer' })
  }
  await auth.login('demo@example.com', 'example-password')
  await auth.refresh()
  expect(sent[0].credentials).toBe('include')
  expect(sent[1].credentials).toBe('include')
  expect(sent[1].headers['X-Brava-CSRF']).toBe('1')
  expect(sent[1].headers.Authorization).toBe(undefined)
})

test('page initialization shares one refresh and exposes loading until it finishes', async () => {
  const pending = deferred()
  let calls = 0
  const session = createSession({ refresh: () => { calls++; return pending.promise } })
  const first = session.initialize()
  const second = session.initialize()
  expect(session.getSnapshot().isLoading).toBe(true)
  pending.resolve({ access_token: 'restored' })
  await Promise.all([first, second])
  expect(calls).toBe(1)
  expect(session.getSnapshot().token).toBe('restored')
  expect(session.getSnapshot().isLoading).toBe(false)
})

test('simultaneous requests share one renewal', async () => {
  const pending = deferred()
  let calls = 0
  const session = createSession({ refresh: () => { calls++; return pending.promise } })
  const first = session.refresh()
  const second = session.refresh()
  pending.resolve({ access_token: 'renewed' })
  await Promise.all([first, second])
  expect(calls).toBe(1)
  expect(session.getSnapshot().token).toBe('renewed')
})

test('logout waits for a running refresh and revokes the replacement without restoring state', async () => {
  const pending = deferred()
  const revoked = []
  const session = createSession({
    login: async () => ({ access_token: 'old' }),
    refresh: () => pending.promise,
    logout: async (token) => { revoked.push(token) },
  })
  await session.login('demo@example.com', 'password')
  const renewal = session.refresh()
  const logout = session.logout()
  expect(session.getSnapshot().token).toBe(null)
  pending.resolve({ access_token: 'replacement' })
  await Promise.all([renewal, logout])
  expect(revoked).toEqual(['replacement'])
  expect(session.getSnapshot().token).toBe(null)
})

test('a failed refresh clears the session', async () => {
  const session = createSession({
    login: async () => ({ access_token: 'old' }),
    refresh: async () => { throw new Error('Expired refresh') },
  })
  await session.login('demo@example.com', 'password')
  await expect(session.refresh()).rejects.toThrow()
  expect(session.getSnapshot().token).toBe(null)
})

test('a network failure on logout is visible and does not claim server revocation', async () => {
  const session = createSession({
    login: async () => ({ access_token: 'old' }),
    logout: async () => { throw new Error('Offline') },
  })
  await session.login('demo@example.com', 'password')
  expect(await session.logout()).toBe(false)
  expect(session.getSnapshot().token).toBe(null)
  expect(session.getSnapshot().error).toBeTruthy()
})

test('retrying a failed logout still revokes the original session', async () => {
  let offline = true
  const revoked = []
  const session = createSession({
    login: async () => ({ access_token: 'old' }),
    logout: async (token) => {
      if (offline) throw new Error('Offline')
      revoked.push(token)
    },
  })
  await session.login('demo@example.com', 'password')
  expect(await session.logout()).toBe(false)
  offline = false
  expect(await session.logout()).toBe(true)
  expect(revoked).toEqual(['old'])
  expect(session.getSnapshot().error).toBe(null)
})

test('a late 401 cannot replay a mutation under a different login', async () => {
  const pending = deferred()
  const sent = []
  const session = createSession({
    login: async (email) => ({ access_token: email }),
    logout: async () => {},
  })
  api.configureApi({
    tokenGetter: () => session.getSnapshot().token,
    sessionGetter: () => session.getSnapshot().version,
    refreshHandler: session.refresh,
    unauthorizedHandler: session.clear,
  })
  await session.login('first-account', 'password')
  globalThis.fetch = async (_url, options) => {
    sent.push(options.headers.Authorization)
    return sent.length === 1 ? pending.promise : json(200, { created: true })
  }
  const oldRequest = api.apiRequest('/orders', { method: 'POST', body: { items: [] } })
  await session.logout()
  await session.login('second-account', 'password')
  pending.resolve(json(401, { detail: 'Old session' }))
  await expect(oldRequest).rejects.toMatchObject({ status: 401 })
  expect(sent).toEqual(['Bearer first-account'])
  expect(session.getSnapshot().token).toBe('second-account')
})

test('a rejected logout does not claim that the access token was revoked', async () => {
  const session = createSession({
    login: async () => ({ access_token: 'old' }),
    logout: async () => { throw new api.ApiError(401, 'Invalid refresh', 'unauthorized') },
  })
  await session.login('demo@example.com', 'password')
  expect(await session.logout()).toBe(false)
  expect(session.getSnapshot().error).toBeTruthy()
})

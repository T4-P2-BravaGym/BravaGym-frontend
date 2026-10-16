import assert from 'node:assert/strict'
import { after, afterEach, before, test } from 'node:test'
import { createServer } from 'vite'

let server
let api
const originalFetch = globalThis.fetch

before(async () => {
  globalThis.window = { location: { origin: 'http://localhost:5173' } }
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  api = await server.ssrLoadModule('/src/services/api.js')
})

afterEach(() => { globalThis.fetch = originalFetch })
after(async () => { await server?.close(); delete globalThis.window })

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
    unauthorizedHandler: () => assert.fail('A renewed session must stay signed in'),
  })
  globalThis.fetch = async (_url, options) => {
    sent.push(options.headers.Authorization)
    return options.headers.Authorization === 'Bearer renewed'
      ? json(200, { id: 7 }) : json(401, { detail: 'Expired' })
  }
  assert.deepEqual(await api.apiRequest('/users/me'), { id: 7 })
  assert.equal(refreshes, 1)
  assert.deepEqual(sent, ['Bearer expired', 'Bearer renewed'])
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
  await assert.rejects(api.apiRequest('/users/me'), { status: 401 })
  assert.equal(refreshes, 1)
  assert.equal(requests, 2)
  assert.equal(logouts, 1)
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
  await assert.rejects(api.apiRequest('/users/me'), { status: 401 })
  assert.equal(requests, 1)
  assert.equal(logouts, 1)
})

test('public login failures do not attempt renewal', async () => {
  api.configureApi({
    tokenGetter: () => 'existing',
    refreshHandler: () => assert.fail('Login must not renew'),
    unauthorizedHandler: () => assert.fail('Login must not clear another session'),
  })
  globalThis.fetch = async () => json(401, { detail: 'Wrong password' })
  await assert.rejects(api.apiRequest('/auth/login', { auth: false }), { status: 401 })
})

test('downloads renew and return the file after retry', async () => {
  let token = 'expired'
  api.configureApi({
    tokenGetter: () => token,
    refreshHandler: async () => { token = 'renewed' },
    unauthorizedHandler: () => assert.fail('Download must renew'),
  })
  globalThis.fetch = async (_url, options) => options.headers.Authorization === 'Bearer renewed'
    ? new Response('amount\n100', { headers: { 'content-disposition': 'attachment; filename="payments.csv"' } })
    : json(401, { detail: 'Expired' })
  const result = await api.apiDownload('/payments/export')
  assert.equal(await result.blob.text(), 'amount\n100')
  assert.equal(result.filename, 'payments.csv')
})

test('aborted requests do not renew or log out', async () => {
  api.configureApi({
    tokenGetter: () => 'existing',
    refreshHandler: () => assert.fail('An abort must not renew'),
    unauthorizedHandler: () => assert.fail('An abort must not log out'),
  })
  globalThis.fetch = async () => { throw new DOMException('Aborted', 'AbortError') }
  await assert.rejects(api.apiRequest('/users/me'), { name: 'AbortError' })
})

test('login and refresh send cookies; refresh sends its CSRF header', async () => {
  const auth = await server.ssrLoadModule('/src/services/auth.js')
  const sent = []
  globalThis.fetch = async (url, options) => {
    sent.push({ url, ...options })
    return json(200, { access_token: 'new', token_type: 'bearer' })
  }
  await auth.login('demo@example.com', 'example-password')
  await auth.refresh()
  assert.equal(sent[0].credentials, 'include')
  assert.equal(sent[1].credentials, 'include')
  assert.equal(sent[1].headers['X-Brava-CSRF'], '1')
  assert.equal(sent[1].headers.Authorization, undefined)
})

async function sessionWith(auth) {
  const { createSession } = await server.ssrLoadModule('/src/services/session.js')
  return createSession(auth)
}

test('page initialization shares one refresh and exposes loading until it finishes', async () => {
  const pending = deferred()
  let calls = 0
  const session = await sessionWith({ refresh: () => { calls++; return pending.promise } })
  const first = session.initialize()
  const second = session.initialize()
  assert.equal(session.getSnapshot().isLoading, true)
  pending.resolve({ access_token: 'restored' })
  await Promise.all([first, second])
  assert.equal(calls, 1)
  assert.equal(session.getSnapshot().token, 'restored')
  assert.equal(session.getSnapshot().isLoading, false)
})

test('simultaneous requests share one renewal', async () => {
  const pending = deferred()
  let calls = 0
  const session = await sessionWith({ refresh: () => { calls++; return pending.promise } })
  const first = session.refresh()
  const second = session.refresh()
  pending.resolve({ access_token: 'renewed' })
  await Promise.all([first, second])
  assert.equal(calls, 1)
  assert.equal(session.getSnapshot().token, 'renewed')
})

test('logout waits for a running refresh and revokes the replacement without restoring state', async () => {
  const pending = deferred()
  const revoked = []
  const session = await sessionWith({
    login: async () => ({ access_token: 'old' }),
    refresh: () => pending.promise,
    logout: async (token) => { revoked.push(token) },
  })
  await session.login('demo@example.com', 'password')
  const renewal = session.refresh()
  const logout = session.logout()
  assert.equal(session.getSnapshot().token, null)
  pending.resolve({ access_token: 'replacement' })
  await Promise.all([renewal, logout])
  assert.deepEqual(revoked, ['replacement'])
  assert.equal(session.getSnapshot().token, null)
})

test('a failed refresh clears the session', async () => {
  const session = await sessionWith({
    login: async () => ({ access_token: 'old' }),
    refresh: async () => { throw new Error('Expired refresh') },
  })
  await session.login('demo@example.com', 'password')
  await assert.rejects(session.refresh())
  assert.equal(session.getSnapshot().token, null)
})

test('a network failure on logout is visible and does not claim server revocation', async () => {
  const session = await sessionWith({
    login: async () => ({ access_token: 'old' }),
    logout: async () => { throw new Error('Offline') },
  })
  await session.login('demo@example.com', 'password')
  assert.equal(await session.logout(), false)
  assert.equal(session.getSnapshot().token, null)
  assert.ok(session.getSnapshot().error)
})

test('retrying a failed logout still revokes the original session', async () => {
  let offline = true
  const revoked = []
  const session = await sessionWith({
    login: async () => ({ access_token: 'old' }),
    logout: async (token) => {
      if (offline) throw new Error('Offline')
      revoked.push(token)
    },
  })
  await session.login('demo@example.com', 'password')
  assert.equal(await session.logout(), false)
  offline = false
  assert.equal(await session.logout(), true)
  assert.deepEqual(revoked, ['old'])
  assert.equal(session.getSnapshot().error, null)
})

test('a late 401 cannot replay a mutation under a different login', async () => {
  const pending = deferred()
  const sent = []
  const session = await sessionWith({
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
  await assert.rejects(oldRequest, { status: 401 })
  assert.deepEqual(sent, ['Bearer first-account'])
  assert.equal(session.getSnapshot().token, 'second-account')
})

test('a rejected logout does not claim that the access token was revoked', async () => {
  const session = await sessionWith({
    login: async () => ({ access_token: 'old' }),
    logout: async () => { throw new api.ApiError(401, 'Invalid refresh', 'unauthorized') },
  })
  await session.login('demo@example.com', 'password')
  assert.equal(await session.logout(), false)
  assert.ok(session.getSnapshot().error)
})

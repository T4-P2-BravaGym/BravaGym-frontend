import { afterEach, expect, test, vi } from 'vitest'
import { configureApi } from './api'
import * as auth from './auth'

afterEach(() => { vi.unstubAllGlobals() })

test('recovery calls send JSON publicly and never renew a rejected recovery token', async () => {
  const fetch = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'Accepted' }), { status: 202, headers: { 'content-type': 'application/json' } }))
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'Invalid link' }), { status: 400, headers: { 'content-type': 'application/json' } }))
  vi.stubGlobal('fetch', fetch)
  configureApi({ tokenGetter: () => 'existing-session', refreshHandler: () => { throw new Error('Recovery must not refresh') } })
  await auth.requestPasswordReset('demo@example.com')
  await auth.confirmPasswordReset('demo-token', 'NewPassword2026!')
  await expect(auth.confirmPasswordReset('used-token', 'NewPassword2026!')).rejects.toMatchObject({ status: 400 })
  expect(fetch.mock.calls[0][0]).toMatch(/\/auth\/password-reset$/)
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ email: 'demo@example.com' })
  expect(fetch.mock.calls[1][0]).toMatch(/\/auth\/password-reset\/confirm$/)
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ token: 'demo-token', new_password: 'NewPassword2026!' })
  expect(fetch.mock.calls.every(([url, options]) => !url.includes('token=') && !options.headers.Authorization)).toBe(true)
})

import { apiRequest } from './api'

/**
 * Auth calls (HU-02, HU-03).
 * Login sends a form (username + password) because the API uses OAuth2PasswordBearer,
 * the same format Swagger's Authorize button uses.
 */
export function login(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST', form: { username: email, password }, auth: false, credentials: 'include',
  })
}

export function refresh() {
  return apiRequest('/auth/refresh', {
    method: 'POST', auth: false, credentials: 'include', headers: { 'X-Brava-CSRF': '1' },
  })
}

export function logout(accessToken) {
  return apiRequest('/auth/logout', {
    method: 'POST', auth: false, credentials: 'include',
    headers: { 'X-Brava-CSRF': '1', Authorization: `Bearer ${accessToken}` },
  })
}

export function register(data) {
  return apiRequest('/auth/register', { method: 'POST', body: data, auth: false })
}

export function getMe() {
  return apiRequest('/users/me')
}

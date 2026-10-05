import { apiRequest } from './api'

/**
 * Auth calls (HU-02, HU-03).
 * Login sends a form (username + password) because the API uses OAuth2PasswordBearer,
 * the same format Swagger's Authorize button uses.
 */
export function login(email, password) {
  return apiRequest('/auth/login', { method: 'POST', form: { username: email, password }, auth: false })
}

export function register(data) {
  return apiRequest('/auth/register', { method: 'POST', body: data, auth: false })
}

export function getMe() {
  return apiRequest('/users/me')
}

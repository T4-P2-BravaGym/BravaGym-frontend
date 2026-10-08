/**
 * API calls. Pages call these functions; components never call the API.
 * TODO(HU-05, HU-06): listUsers, changeRole
 */
import { apiRequest, buildQuery } from './api'

// PATCH /users/me: change my name, phone or email. Returns the updated profile.
export function updateMe(changes) {
  return apiRequest('/users/me', { method: 'PATCH', body: changes })
}

export function listUsers({ role, is_active, q, page = 1, size = 20, signal } = {}) {
  return apiRequest(`/users${buildQuery({ role, is_active, q, page, size })}`, { signal })
}
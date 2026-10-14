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

// HU-31: an admin views, edits and deactivates another user
export function getUser(userId, { signal } = {}) {
  return apiRequest(`/users/${userId}`, { signal })
}

export function updateUser(userId, changes) {
  return apiRequest(`/users/${userId}`, { method: 'PATCH', body: changes })
}

// DELETE does not remove her: the API deactivates her (soft delete) and returns 204
export function deactivateUser(userId) {
  return apiRequest(`/users/${userId}`, { method: 'DELETE' })
}

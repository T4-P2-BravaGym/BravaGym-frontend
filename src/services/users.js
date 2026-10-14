/**
 * API calls for users (HU-04, HU-05, HU-06, HU-31): my profile, the admin list, roles,
 * and viewing, editing and deactivating a user.
 * Pages call these functions; components never call the API.
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

// HU-05: PATCH /users/{id}/role. The API applies RN-18 and RN-19 (403 / 409)
export function changeRole(userId, role) {
  return apiRequest(`/users/${userId}/role`, { method: 'PATCH', body: { role } })
}

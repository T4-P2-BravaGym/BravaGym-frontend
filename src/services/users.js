/**
 * API calls for users (HU-04, HU-05, HU-06, HU-31, HU-32): my profile and password, the admin
 * list, roles, and viewing, editing and deactivating a user.
 * Pages call these functions; components never call the API.
 */
import { apiRequest, buildQuery } from './api'

// PATCH /users/me: change my name, phone or email. Returns the updated profile.
export function updateMe(changes) {
  return apiRequest('/users/me', { method: 'PATCH', body: changes })
}

// HU-32: POST /users/me/password. 204 = changed; a wrong current password is a 400, not a 401,
// so apiRequest does not log her out
export function changeMyPassword(currentPassword, newPassword) {
  return apiRequest('/users/me/password', {
    method: 'POST',
    body: { current_password: currentPassword, new_password: newPassword },
  })
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

// HU-17: GET /users/members. Active members for the trainer's picker,
// only id, first_name and last_name (no contact data)
export function listMembers({ signal } = {}) {
  return apiRequest('/users/members', { signal })
}

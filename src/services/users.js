/**
 * API calls. Pages call these functions; components never call the API.
 * TODO(HU-04, HU-05, HU-06): updateMe, listUsers, changeRole
 */
import { apiRequest } from './api'

// PATCH /users/me: change my name, phone or email. Returns the updated profile.
export function updateMe(changes) {
  return apiRequest('/users/me', { method: 'PATCH', body: changes })
}

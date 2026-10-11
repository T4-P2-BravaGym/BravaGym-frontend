/**
 * API calls. Pages call these functions; components never call the API.
 */
import { apiRequest } from './api'

// GET /trainers: public list of active trainers (no login needed)
export function listTrainers({ signal } = {}) {
  return apiRequest('/trainers', { auth: false, signal })
}

// PATCH /trainers/me/profile: the logged-in trainer changes her specialty and bio
export function updateMyTrainerProfile(changes) {
  return apiRequest('/trainers/me/profile', { method: 'PATCH', body: changes })
}
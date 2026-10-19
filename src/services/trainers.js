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

// T-291: the logged-in trainer uploads (or replaces) and removes her photo
export function uploadMyTrainerPhoto(file) {
  const formData = new FormData()
  formData.append('file', file)
  return apiRequest('/trainers/me/photo', { method: 'PUT', formData })
}

export function deleteMyTrainerPhoto() {
  return apiRequest('/trainers/me/photo', { method: 'DELETE' })
}
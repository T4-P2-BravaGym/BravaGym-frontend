/**
 * API calls. Pages call these functions; components never call the API.
 */
import { apiRequest } from './api'

// GET /trainers: public list of active trainers (no login needed)
export function listTrainers({ signal } = {}) {
  return apiRequest('/trainers', { auth: false, signal })
}
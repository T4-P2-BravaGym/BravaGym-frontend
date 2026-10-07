/**
 * API calls. Pages call these functions; components never call the API.
 * TODO(HU-17): listExercises, saveRoutine
 */
import { apiRequest } from './api'

// GET /routines/me: the member's active routine with its exercises
export function myRoutine() {
  return apiRequest('/routines/me')
}
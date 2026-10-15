
import { apiRequest } from './api'

// GET /routines/me: the member's active routine with its exercises
export function myRoutine() {
  return apiRequest('/routines/me')
}

// GET /exercises: the exercise catalog for the routine editor
export function listExercises({ signal } = {}) {
  return apiRequest('/exercises', { signal })
}

// POST /routines: a trainer creates a routine for a member.
// The API deactivates the member's previous routine (409 if day + position repeat)
export function createRoutine(payload) {
  return apiRequest('/routines', { method: 'POST', body: payload })
  
}
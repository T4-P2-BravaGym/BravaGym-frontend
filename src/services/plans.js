import { apiRequest } from './api'

export function listPlans() {
  return apiRequest('/plans', { auth: false })
}

export function createPlan(data) {
  return apiRequest('/plans', {
    method: 'POST',
    body: data,
  })
}

export function updatePlan(planId, data) {
  return apiRequest(`/plans/${planId}`, {
    method: 'PATCH',
    body: data,
  })
}

export function deactivatePlan(planId) {
  return apiRequest(`/plans/${planId}`, {
    method: 'DELETE',
  })
}

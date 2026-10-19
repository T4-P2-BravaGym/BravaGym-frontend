import { apiRequest, buildQuery } from './api'

export function listPlans() {
  return apiRequest('/plans', { auth: false })
}

export function createPlan(data) {
  return apiRequest('/plans', {
    method: 'POST',
    body: data,
  })
}

export function listAdminPlans({ page = 1, size = 20 } = {}) {
  return apiRequest(`/plans/admin${buildQuery({ page, size })}`)
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

import { apiRequest } from './api'

export function listPlans() {
  return apiRequest('/plans', { auth: false })
}

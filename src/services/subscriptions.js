import { apiRequest } from './api'

export function subscribe(planId) {
    return apiRequest('/subscriptions', { method: 'POST', body: { plan_id: planId } })
}

export function getMySubscriptions({ signal } = {}) {
    return apiRequest('/subscriptions/me', { signal })
}
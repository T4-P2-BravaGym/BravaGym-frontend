/**
 * API calls for discount codes (HU-25). Pages call these functions; components never call the API.
 */
import { apiRequest, buildQuery } from './api'

export function listCodes({ page = 1, size = 20, signal } = {}) {
  return apiRequest(`/discount-codes${buildQuery({ page, size })}`, { signal })
}

export function createCode(body) {
  return apiRequest('/discount-codes', { method: 'POST', body })
}

export function updateCode(codeId, changes) {
  return apiRequest(`/discount-codes/${codeId}`, { method: 'PATCH', body: changes })
}

// DELETE does not remove the code: the API deactivates it (paid payments still point to it)
export function deactivateCode(codeId) {
  return apiRequest(`/discount-codes/${codeId}`, { method: 'DELETE' })
}

// For HU-24: the member checks her code before paying (RN-14). 422 if it is not valid.
export function validateCode(code) {
  return apiRequest(`/discount-codes/${encodeURIComponent(code.trim())}/validate`)
}
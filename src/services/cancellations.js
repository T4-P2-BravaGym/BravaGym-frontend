import { apiRequest } from './api'

/**
 * Cancellation requests (HU-19, RN-12).
 * Pages call these; components never call the API.
 *
 * POST /cancellation-requests — member creates a pending request with a reason.
 * GET /cancellation-requests/me — member's latest request (404 when none).
 * Admin list / approve / reject belong to HU-20.
 */

/**
 * requestCancellation({ reason, signal })
 * Body: { reason }. The server keeps the subscription active and returns status "pending".
 * A second pending request for the same subscription → 409 (RN-12).
 */
export function requestCancellation({ reason, signal } = {}) {
  return apiRequest('/cancellation-requests', {
    method: 'POST',
    body: { reason },
    signal,
  })
}

/**
 * getMyCancellationRequest({ signal })
 * Returns the request object, or null when the member has none (404).
 */
export async function getMyCancellationRequest({ signal } = {}) {
  try {
    return await apiRequest('/cancellation-requests/me', { signal })
  } catch (error) {
    if (error?.status === 404) return null
    throw error
  }
}

import { apiRequest, buildQuery } from './api'

/**
 * Cancellation requests (HU-19 / HU-20, RN-12 / RN-13).
 * Pages call these; components never call the API.
 *
 * Member (HU-19):
 *   POST /cancellation-requests — create a pending request with a reason.
 *   GET  /cancellation-requests/me — latest request (404 when none).
 *
 * Admin (HU-20 / RN-13):
 *   GET  /cancellation-requests?status=&page=&size= — inbox, paginated.
 *   POST /cancellation-requests/{id}/approve — optional body { admin_notes }.
 *        Effects: subscription cancelled, user deactivated, future bookings cancelled.
 *   POST /cancellation-requests/{id}/reject — body { admin_notes } required (422 without).
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

/**
 * listCancellationRequests({ status, page, size, signal })
 * Admin inbox. Response: { items, total, page, size }.
 * BE HU-20 returns flat member_name / member_email / plan_name; we also accept
 * nested user/plan shapes and normalise them for CancellationRequestCard.
 */
export async function listCancellationRequests({ status, page = 1, size = 20, signal } = {}) {
  const data = await apiRequest(
    `/cancellation-requests${buildQuery({ status, page, size })}`,
    { signal },
  )
  return {
    ...data,
    items: (data?.items ?? []).map(normalizeCancellationRequest),
  }
}

/**
 * approveCancellationRequest(id, { admin_notes, signal })
 * Approving is irreversible for the member (RN-13). Notes are optional.
 */
export function approveCancellationRequest(id, { admin_notes, signal } = {}) {
  const body = admin_notes ? { admin_notes } : {}
  return apiRequest(`/cancellation-requests/${id}/approve`, {
    method: 'POST',
    body,
    signal,
  })
}

/**
 * rejectCancellationRequest(id, { admin_notes, signal })
 * admin_notes is required by the API (422 without) — RN-13.
 */
export function rejectCancellationRequest(id, { admin_notes, signal } = {}) {
  return apiRequest(`/cancellation-requests/${id}/reject`, {
    method: 'POST',
    body: { admin_notes },
    signal,
  })
}

/**
 * Flatten nested user/plan from the API into the fields the card expects.
 * Supports both a flat admin DTO and a nested subscription/user shape.
 */
export function normalizeCancellationRequest(item) {
  if (!item || typeof item !== 'object') return item

  const user = item.user ?? item.member ?? null
  const plan = item.plan ?? item.subscription?.plan ?? null

  const nestedName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
    : ''

  return {
    ...item,
    member_name:
      item.member_name ||
      nestedName ||
      user?.email ||
      (item.user_id != null ? `Usuaria #${item.user_id}` : `Solicitud #${item.id}`),
    member_email: item.member_email ?? user?.email ?? null,
    plan_name: item.plan_name ?? plan?.name ?? null,
  }
}

/**
 * API calls for payments (HU-24 member + HU-26 admin).
 * Pages call these; components never call the API.
 *
 * Member (HU-24):
 *   GET /payments/me — socia's payments, optional status filter (paginated).
 *   POST /payments/{id}/pay — simulated pay; optional body `{ discount_code }` (RN-14 to RN-16).
 *
 * Admin (HU-26 / BE #108):
 *   GET /payments — filters status, from, to, user_id, concept; paginated.
 *   GET /payments/export — CSV with the same filters (StreamingResponse).
 *   POST /payments/{id}/refund — paid → refunded (RN-16); admin / superadmin.
 */
import { apiDownload, apiRequest, buildQuery } from './api'

/**
 * listMyPayments({ status, page, size, signal })
 * Returns a page `{ items, total, page, size }`. Omit `status` to list all.
 */
export function listMyPayments({ status, page = 1, size = 20, signal } = {}) {
  return apiRequest(`/payments/me${buildQuery({ status, page, size })}`, { signal })
}

/**
 * payPayment(paymentId, { discountCode, signal })
 * Marks a pending payment as paid (RN-16). When `discountCode` is set, the server
 * validates it (RN-14) and sets `final_amount_cents` with RN-15.
 * Errors: 404 not found / not yours; 409 already paid; 422 invalid or exhausted code.
 */
export function payPayment(paymentId, { discountCode, signal } = {}) {
  const body = {}
  if (discountCode) body.discount_code = discountCode
  return apiRequest(`/payments/${paymentId}/pay`, { method: 'POST', body, signal })
}

/**
 * listPayments({ status, from, to, userId, concept, page, size, signal })
 * Admin list (GET /payments). `from` / `to` are ISO dates (YYYY-MM-DD).
 */
export function listPayments({
  status,
  from,
  to,
  userId,
  concept,
  page = 1,
  size = 20,
  signal,
} = {}) {
  return apiRequest(
    `/payments${buildQuery({
      status,
      from,
      to,
      user_id: userId,
      concept,
      page,
      size,
    })}`,
    { signal },
  )
}

/**
 * exportPaymentsCsv({ status, from, to, userId, concept, signal })
 * Downloads the admin CSV (GET /payments/export) with the same filters as the list.
 * Triggers a browser download and resolves with the filename used.
 */
export async function exportPaymentsCsv({ status, from, to, userId, concept, signal } = {}) {
  const query = buildQuery({
    status,
    from,
    to,
    user_id: userId,
    concept,
  })
  const { blob, filename } = await apiDownload(`/payments/export${query}`, {
    signal,
    fallbackFilename: defaultCsvFilename(),
  })
  triggerBlobDownload(blob, filename || defaultCsvFilename())
  return filename || defaultCsvFilename()
}

/**
 * refundPayment(paymentId, { signal })
 * Admin marks a paid payment as refunded (RN-16). Errors: 404, 409 (not paid), 403.
 */
export function refundPayment(paymentId, { signal } = {}) {
  return apiRequest(`/payments/${paymentId}/refund`, { method: 'POST', signal })
}

/**
 * Preview of RN-15 on the client (server amount wins after pay).
 * final_amount_cents = round(base × (100 − percent_off) / 100)
 */
export function previewFinalAmountCents(baseAmountCents, percentOff = 0) {
  const base = Number(baseAmountCents) || 0
  const percent = Math.min(100, Math.max(0, Number(percentOff) || 0))
  return Math.round((base * (100 - percent)) / 100)
}

/**
 * Human-readable concept for a PaymentOut row.
 * Accepts a display string, an enum (`subscription` | `booking` | `order`),
 * or derives from the foreign keys when the API only sends ids.
 */
export function paymentConceptLabel(payment) {
  if (!payment) return 'Pago'
  if (payment.concept_label) return payment.concept_label

  const raw = payment.concept
  if (typeof raw === 'string' && raw && !CONCEPT_KINDS.has(raw)) return raw

  const kind =
    (CONCEPT_KINDS.has(raw) ? raw : null) ??
    (payment.subscription_id != null
      ? 'subscription'
      : payment.booking_id != null
        ? 'booking'
        : payment.order_id != null
          ? 'order'
          : null)

  if (kind === 'subscription') {
    return payment.plan_name ? `Cuota · ${payment.plan_name}` : 'Cuota'
  }
  if (kind === 'booking') {
    return payment.class_type_name || 'Clase extra'
  }
  if (kind === 'order') {
    return payment.order_id != null ? `Pedido tienda #${payment.order_id}` : 'Pedido tienda'
  }
  return 'Pago'
}

/**
 * Display name for the member on an admin PaymentOut row.
 * Tolerant of BE #109 enrichments: member_name, user_name, nested user, or user_id.
 */
export function paymentMemberLabel(payment) {
  if (!payment) return '—'
  if (payment.member_name) return payment.member_name
  if (payment.user_name) return payment.user_name
  if (payment.member) return payment.member
  const user = payment.user
  if (user) {
    const full = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
    if (full) return full
    if (user.email) return user.email
  }
  if (payment.user_id != null) return `Socia #${payment.user_id}`
  return '—'
}

const CONCEPT_KINDS = new Set(['subscription', 'booking', 'order'])

function defaultCsvFilename() {
  const stamp = new Date().toISOString().slice(0, 10)
  return `brava-pagos-${stamp}.csv`
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

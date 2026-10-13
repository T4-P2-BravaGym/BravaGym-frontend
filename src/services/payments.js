/**
 * API calls for member payments (HU-24). Pages call these; components never call the API.
 *
 * GET /payments/me — socia's payments, optional status filter (paginated).
 * POST /payments/{id}/pay — simulated pay; optional body `{ discount_code }` (RN-14 to RN-16).
 *
 * TODO(HU-26): listPayments, exportCsv, refundPayment for the admin panel.
 */
import { apiRequest, buildQuery } from './api'

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

const CONCEPT_KINDS = new Set(['subscription', 'booking', 'order'])

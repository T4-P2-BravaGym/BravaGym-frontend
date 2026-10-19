import DiscountCodeInput from '@/components/domain/DiscountCodeInput'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { paymentConceptLabel, previewFinalAmountCents } from '@/services/payments'
import { formatDateTime, formatEuros } from '@/utils/format'
import styles from './PaymentCard.module.scss'

/**
 * PaymentCard
 * One of the socia's payments (HU-24 / RN-14–16). Pending rows show the discount
 * field and a pay button; paid / failed / refunded rows are read-only.
 *
 * Props: payment { id, concept?, concept_label?, base_amount_cents, final_amount_cents,
 *                  status, created_at, paid_at?, discount_code?, plan_name?, … },
 *        discount ({ code, percent_off } | null) — only for pending,
 *        busy, onApplyDiscount(code), onRemoveDiscount(), onPay(), onCheckout()
 */
export default function PaymentCard({
  payment,
  discount = null,
  busy = false,
  onApplyDiscount,
  onRemoveDiscount,
  onPay,
  onCheckout,
}) {
  const isPending = payment.status === 'pending'
  const concept = paymentConceptLabel(payment)
  const baseCents = payment.base_amount_cents ?? payment.final_amount_cents
  const previewCents = isPending
    ? previewFinalAmountCents(baseCents, discount?.percent_off ?? 0)
    : payment.final_amount_cents
  const hasDiscountPreview = isPending && discount?.percent_off > 0 && previewCents !== baseCents
  const usedCode = payment.discount_code?.code ?? payment.discount_code

  return (
    <article className={styles.root}>
      <div className={styles.head}>
        <div className={styles.main}>
          <h3 className={styles.concept}>{concept}</h3>
          <p className={styles.meta}>
            {formatDateTime(payment.created_at)}
            {payment.paid_at ? ` · Pagado el ${formatDateTime(payment.paid_at)}` : ''}
          </p>
          {!isPending && usedCode && <p className={styles.meta}>Código {usedCode}</p>}
        </div>
        <Badge status={payment.status}>{payment.status === 'cancelled' ? 'Anulado' : undefined}</Badge>
      </div>

      <div className={styles.amounts}>
        {hasDiscountPreview ? (
          <>
            <span className={styles.struck}>{formatEuros(baseCents)}</span>
            <span className={styles.amount}>{formatEuros(previewCents)}</span>
            <span className={styles.save}>−{discount.percent_off} %</span>
          </>
        ) : (
          <>
            {!isPending &&
              payment.base_amount_cents != null &&
              payment.base_amount_cents !== payment.final_amount_cents && (
                <span className={styles.struck}>{formatEuros(payment.base_amount_cents)}</span>
              )}
            <span className={styles.amount}>{formatEuros(isPending ? baseCents : payment.final_amount_cents)}</span>
          </>
        )}
      </div>

      {isPending && (
        <div className={styles.payBlock}>
          <DiscountCodeInput
            applied={discount}
            onApply={onApplyDiscount}
            onRemove={onRemoveDiscount}
          />
          {onCheckout && (
            <Button disabled={busy} onClick={onCheckout} className={styles.payButton}>
              {busy ? 'Procesando…' : 'Pagar con tarjeta'}
            </Button>
          )}
          <Button variant="secondary" disabled={busy} onClick={onPay} className={styles.payButton}>
            {busy ? 'Pagando…' : `Pagar ${formatEuros(previewCents)} (simulado)`}
          </Button>
        </div>
      )}
    </article>
  )
}

import { useCallback, useEffect, useState } from 'react'
import PaymentCard from '@/components/domain/PaymentCard'
import Alert from '@/components/ui/Alert'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import Spinner from '@/components/ui/Spinner'
import Tabs from '@/components/ui/Tabs'
import { ApiError } from '@/services/api'
import { validateCode } from '@/services/discountCodes'
import {
  listMyPayments,
  payPayment,
  paymentConceptLabel,
  previewFinalAmountCents,
} from '@/services/payments'
import { formatEuros } from '@/utils/format'
import styles from './MyPayments.module.scss';

const PAGE_SIZE = 20
const LOAD_ERROR = 'No se han podido cargar tus pagos. Inténtalo de nuevo.'
const GENERIC_PAY_ERROR = 'No se ha podido completar el pago. Inténtalo de nuevo.'
const ALREADY_PAID = 'Este pago ya está abonado.'
const INVALID_CODE = 'Este código no es válido, ha caducado o se ha agotado.'

const STATUS_TABS = [
  { id: 'pending', label: 'Pendientes' },
  { id: 'paid', label: 'Pagados' },
  { id: 'all', label: 'Todos' },
]

export default function MyPayments() {
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [discounts, setDiscounts] = useState({})
  const [busyId, setBusyId] = useState(null)
  const [payTarget, setPayTarget] = useState(null)

  const loadList = useCallback(
    (signal) => {
      setLoading(true)
      setError(null)
      return listMyPayments({
        status: status === 'all' ? undefined : status,
        page,
        size: PAGE_SIZE,
        signal,
      })
        .then((data) => {
          setResult(normalizePage(data))
          setError(null)
        })
        .catch((apiError) => {
          if (apiError.name === 'AbortError') return
          setResult(null)
          setError(apiError.detail ?? LOAD_ERROR)
        })
        .finally(() => {
          if (!signal?.aborted) setLoading(false)
        })
    },
    [status, page],
  )

  useEffect(() => {
    const controller = new AbortController()
    loadList(controller.signal)
    return () => controller.abort()
  }, [loadList])

  function changeStatus(next) {
    setStatus(next)
    setPage(1)
    setFlash(null)
    setActionError(null)
  }

  async function handleApplyDiscount(paymentId, code) {
    const validated = await validateCode(code)
    setDiscounts((current) => ({
      ...current,
      [paymentId]: {
        code: validated.code ?? code,
        percent_off: validated.percent_off,
      },
    }))
  }

  function handleRemoveDiscount(paymentId) {
    setDiscounts((current) => {
      const next = { ...current }
      delete next[paymentId]
      return next
    })
  }

  function handleAskPay(payment) {
    setActionError(null)
    setFlash(null)
    setPayTarget({
      payment,
      discount: discounts[payment.id] ?? null,
    })
  }

  async function handleConfirmPay() {
    if (!payTarget?.payment?.id) return
    const { payment, discount } = payTarget
    setBusyId(payment.id)
    setActionError(null)
    setFlash(null)
    try {
      const paid = await payPayment(payment.id, {
        discountCode: discount?.code,
      })
      const amount = formatEuros(paid?.final_amount_cents ?? payment.final_amount_cents)
      setFlash(
        discount?.code
          ? `Pago de ${amount} completado con el código ${discount.code}.`
          : `Pago de ${amount} completado.`,
      )
      setPayTarget(null)
      handleRemoveDiscount(payment.id)
      await loadList()
    } catch (err) {
      setPayTarget(null)
      setActionError(payErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const items = result?.items ?? []
  const emptyCopy = emptyMessage(status)

  return (
    <div className={styles.root}>
      <PageHeader
          eyebrow="Mi área"
          title="Mis pagos"
          lead="Revisa lo pendiente y paga con un código de descuento si tienes uno."
      />

      {flash && (
        <Alert tone="success" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      )}
      {actionError && (
        <Alert tone="error" title={actionError.title} onClose={() => setActionError(null)}>
          {actionError.text}
        </Alert>
      )}
      {error && <Alert tone="error">{error}</Alert>}

      <Tabs tabs={STATUS_TABS} active={status} onChange={changeStatus} label="Estado del pago">
        {loading && <Spinner label="Cargando tus pagos…" />}

        {!loading && !error && items.length === 0 && (
          <EmptyState title={emptyCopy.title} text={emptyCopy.text} />
        )}

        {!loading && items.length > 0 && (
          <ul className={styles.list}>
            {items.map((payment) => (
              <li key={payment.id}>
                <PaymentCard
                  payment={payment}
                  discount={discounts[payment.id] ?? null}
                  busy={busyId === payment.id}
                  onApplyDiscount={(code) => handleApplyDiscount(payment.id, code)}
                  onRemoveDiscount={() => handleRemoveDiscount(payment.id)}
                  onPay={() => handleAskPay(payment)}
                />
              </li>
            ))}
          </ul>
        )}

        {result && result.total > PAGE_SIZE && (
          <div className={styles.footer}>
            <Pagination
              page={result.page}
              size={result.size}
              total={result.total}
              onChange={setPage}
            />
          </div>
        )}
      </Tabs>

      <Modal
        open={Boolean(payTarget)}
        title="Confirmar pago"
        description={payConfirmDescription(payTarget)}
        confirmLabel="Sí, pagar"
        cancelLabel="Volver"
        busy={busyId != null}
        onConfirm={handleConfirmPay}
        onClose={() => {
          if (busyId == null) setPayTarget(null)
        }}
      />
    </div>
  )
}

function payConfirmDescription(target) {
  if (!target?.payment) return undefined
  const { payment, discount } = target
  const baseCents = payment.base_amount_cents ?? payment.final_amount_cents
  const finalCents = previewFinalAmountCents(baseCents, discount?.percent_off ?? 0)
  const concept = paymentConceptLabel(payment)
  if (discount?.code) {
    return `Vas a pagar ${formatEuros(finalCents)} por «${concept}» con el código ${discount.code} (−${discount.percent_off} %).`
  }
  return `Vas a pagar ${formatEuros(finalCents)} por «${concept}». El pago es simulado.`
}

function normalizePage(data) {
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, size: data.length || PAGE_SIZE }
  }
  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    size: data?.size ?? PAGE_SIZE,
  }
}

function emptyMessage(status) {
  if (status === 'pending') {
    return {
      title: 'No tienes pagos pendientes',
      text: 'Cuando haya una cuota, una clase extra o un pedido por abonar, aparecerá aquí.',
    }
  }
  if (status === 'paid') {
    return {
      title: 'Aún no hay pagos completados',
      text: 'Los pagos que marques como pagados aparecerán en esta pestaña.',
    }
  }
  return {
    title: 'Aún no tienes pagos',
    text: 'Cuando te suscribas, reserves una clase de pago o hagas un pedido, verás el historial aquí.',
  }
}

function payErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return { title: 'Error', text: GENERIC_PAY_ERROR }
  }
  if (error.status === 409) {
    return { title: 'Pago ya realizado', text: error.detail || ALREADY_PAID }
  }
  if (error.status === 422) {
    return { title: 'Código no válido', text: error.detail || INVALID_CODE }
  }
  if (error.status === 404) {
    return { title: 'Pago no encontrado', text: error.detail || 'Este pago no está disponible.' }
  }
  return { title: 'No se ha podido pagar', text: error.detail || GENERIC_PAY_ERROR }
}

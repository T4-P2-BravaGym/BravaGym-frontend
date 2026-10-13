import { useCallback, useEffect, useMemo, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import { adminErrorMessage } from '@/pages/admin/AdminProducts/errors'
import { ApiError } from '@/services/api'
import {
  exportPaymentsCsv,
  listPayments,
  paymentConceptLabel,
  paymentMemberLabel,
  refundPayment,
} from '@/services/payments'
import { formatDateTime, formatEuros } from '@/utils/format'
import styles from './AdminPayments.module.scss'

/**
 * Pagos (HU-26.4)
 * Admin reviews payments (GET /payments), exports CSV with the same filters
 * (GET /payments/export) and refunds paid ones (POST /payments/{id}/refund, RN-16).
 * Contract: BE #108 / docs/api.md — filters status, from, to, user_id, concept.
 */

const PAGE_SIZE = 20
const LOAD_ERROR = 'No se han podido cargar los pagos. Inténtalo de nuevo.'
const EXPORT_ERROR = 'No se ha podido exportar el CSV. Inténtalo de nuevo.'
const REFUND_SUCCESS = 'Pago marcado como reembolsado.'
const REFUND_FALLBACK = 'No se ha podido reembolsar este pago. Inténtalo de nuevo.'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'paid', label: 'Pagados' },
  { value: 'refunded', label: 'Reembolsados' },
  { value: 'failed', label: 'Fallidos' },
]

const CONCEPT_OPTIONS = [
  { value: '', label: 'Todos los conceptos' },
  { value: 'subscription', label: 'Cuota' },
  { value: 'booking', label: 'Clase extra' },
  { value: 'order', label: 'Pedido tienda' },
]

export default function AdminPayments() {
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [concept, setConcept] = useState('')
  const [userId, setUserId] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [refundTarget, setRefundTarget] = useState(null)

  const filters = useMemo(
    () => ({
      status: status || undefined,
      from: from || undefined,
      to: to || undefined,
      concept: concept || undefined,
      userId: parseUserId(userId),
    }),
    [status, from, to, concept, userId],
  )

  const datesInvalid = Boolean(from && to && from > to)

  const loadList = useCallback(
    (signal) => {
      if (datesInvalid) {
        setLoading(false)
        setResult({ items: [], total: 0, page: 1, size: PAGE_SIZE })
        setError(null)
        return Promise.resolve()
      }
      setLoading(true)
      setError(null)
      return listPayments({
        ...filters,
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
    [filters, page, datesInvalid],
  )

  useEffect(() => {
    const controller = new AbortController()
    loadList(controller.signal)
    return () => controller.abort()
  }, [loadList])

  function changeFilter(setter) {
    return (event) => {
      setter(event.target.value)
      setPage(1)
      setFlash(null)
      setActionError(null)
    }
  }

  async function handleExport() {
    setExporting(true)
    setActionError(null)
    setFlash(null)
    try {
      const filename = await exportPaymentsCsv(filters)
      setFlash(`CSV descargado: ${filename}.`)
    } catch (apiError) {
      if (apiError.name === 'AbortError') return
      setActionError(adminErrorMessage(apiError, { fallback: EXPORT_ERROR }))
    } finally {
      setExporting(false)
    }
  }

  function handleAskRefund(payment) {
    setActionError(null)
    setFlash(null)
    setRefundTarget(payment)
  }

  async function handleConfirmRefund() {
    if (!refundTarget?.id) return
    setBusyId(refundTarget.id)
    setActionError(null)
    setFlash(null)
    try {
      await refundPayment(refundTarget.id)
      setFlash(REFUND_SUCCESS)
      setRefundTarget(null)
      await loadList()
    } catch (apiError) {
      setRefundTarget(null)
      setActionError(refundErrorMessage(apiError))
    } finally {
      setBusyId(null)
    }
  }

  const columns = [
    {
      key: 'member',
      header: 'Socia',
      render: (payment) => (
        <span className={styles.member}>
          {paymentMemberLabel(payment)}
          {payment.member_email || payment.user?.email ? (
            <span className={styles.memberMeta}>{payment.member_email || payment.user.email}</span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'concept',
      header: 'Concepto',
      render: (payment) => paymentConceptLabel(payment),
    },
    {
      key: 'created_at',
      header: 'Fecha',
      render: (payment) => (payment.created_at ? formatDateTime(payment.created_at) : '—'),
    },
    {
      key: 'amount',
      header: 'Importe',
      align: 'right',
      render: (payment) => formatEuros(payment.final_amount_cents),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (payment) => <Badge status={payment.status} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (payment) =>
        payment.status === 'paid' ? (
          <Button
            variant="danger"
            size="sm"
            disabled={busyId != null}
            onClick={() => handleAskRefund(payment)}
          >
            Reembolsar
          </Button>
        ) : (
          '—'
        ),
    },
  ]

  const items = result?.items ?? []
  const dateOrderError = datesInvalid ? 'La fecha de fin no puede ser anterior a la de inicio.' : null

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Administración</span>
        <h1 className={styles.title}>Pagos</h1>
        <p className={styles.lead}>
          Filtra por estado y fechas, exporta el CSV para la contabilidad y marca como reembolsados
          los pagos ya cobrados cuando haga falta.
        </p>
      </header>

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

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Field label="Estado" as="select" value={status} onChange={changeFilter(setStatus)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </Field>
          <Field
            label="Desde"
            type="date"
            value={from}
            onChange={changeFilter(setFrom)}
            error={dateOrderError || undefined}
          />
          <Field label="Hasta" type="date" value={to} onChange={changeFilter(setTo)} />
          <Field label="Concepto" as="select" value={concept} onChange={changeFilter(setConcept)}>
            {CONCEPT_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </Field>
          <Field
            label="ID de socia"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={userId}
            placeholder="Opcional"
            onChange={changeFilter(setUserId)}
          />
        </div>
        <div className={styles.export}>
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={exporting || Boolean(dateOrderError)}
          >
            {exporting ? 'Exportando…' : 'Exportar CSV'}
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner label="Cargando pagos…" />
      ) : (
        result && (
          <>
            <Table
              caption="Pagos filtrados"
              columns={columns}
              rows={items}
              emptyTitle="No hay pagos con estos filtros"
              emptyText="Prueba con otras fechas, estados o conceptos."
            />
            {result.total > PAGE_SIZE && (
              <div className={styles.footer}>
                <Pagination
                  page={result.page}
                  size={result.size}
                  total={result.total}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        )
      )}

      <Modal
        open={Boolean(refundTarget)}
        title="¿Reembolsar este pago?"
        description={refundDescription(refundTarget)}
        confirmLabel="Sí, reembolsar"
        cancelLabel="Volver"
        tone="danger"
        busy={busyId != null}
        onConfirm={handleConfirmRefund}
        onClose={() => {
          if (busyId == null) setRefundTarget(null)
        }}
      />
    </div>
  )
}

function parseUserId(value) {
  if (value === '' || value == null) return undefined
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : undefined
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

function refundDescription(payment) {
  if (!payment) return undefined
  const member = paymentMemberLabel(payment)
  const concept = paymentConceptLabel(payment)
  const amount = formatEuros(payment.final_amount_cents)
  return `Vas a marcar como reembolsado el pago de ${amount} de ${member} («${concept}»). Quedará registrado en el log.`
}

function refundErrorMessage(error) {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return {
        title: 'No se puede reembolsar',
        text: error.detail ?? 'Solo se pueden reembolsar pagos en estado pagado.',
      }
    }
    if (error.status === 404) {
      return {
        title: 'Pago no encontrado',
        text: error.detail ?? 'Este pago ya no existe o no tienes permiso para verlo.',
      }
    }
    if (error.status === 403) {
      return {
        title: 'Sin permiso',
        text: error.detail ?? 'Solo administración puede reembolsar pagos.',
      }
    }
  }
  return adminErrorMessage(error, { fallback: REFUND_FALLBACK })
}

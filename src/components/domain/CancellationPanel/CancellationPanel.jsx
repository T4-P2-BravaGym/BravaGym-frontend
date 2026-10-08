import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Field from '@/components/ui/Field'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'
import { PATHS } from '@/routes/paths'
import { formatDateTime } from '@/utils/format'
import styles from './CancellationPanel.module.scss'

const REASON_MAX = 500
const REASON_MIN = 10

/**
 * CancellationPanel
 * Member-facing cancellation request (HU-19.3 / RN-12): form with reason, or the
 * current request status (pending / approved / rejected). After a rejection the
 * form comes back so she can try again. The page owns API calls; this component
 * only receives data and callbacks.
 *
 * Props: request, hasActiveSubscription, loading, busy, onSubmit(reason), pricingTo
 */
export default function CancellationPanel({
  request = null,
  hasActiveSubscription = false,
  loading = false,
  busy = false,
  onSubmit,
  pricingTo = PATHS.pricing,
}) {
  const [reason, setReason] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const status = request?.status ?? null
  const isPending = status === 'pending'
  const isApproved = status === 'approved'
  const isRejected = status === 'rejected'
  const canRequest = hasActiveSubscription && !isPending && !isApproved

  function validate() {
    const trimmed = reason.trim()
    if (!trimmed) {
      setFieldError('Cuéntanos el motivo de la baja.')
      return null
    }
    if (trimmed.length < REASON_MIN) {
      setFieldError(`El motivo debe tener al menos ${REASON_MIN} caracteres.`)
      return null
    }
    if (trimmed.length > REASON_MAX) {
      setFieldError(`El motivo no puede superar ${REASON_MAX} caracteres.`)
      return null
    }
    setFieldError('')
    return trimmed
  }

  function handleAskConfirm(event) {
    event.preventDefault()
    if (!validate()) return
    setConfirmOpen(true)
  }

  async function handleConfirm() {
    const trimmed = validate()
    if (!trimmed) {
      setConfirmOpen(false)
      return
    }
    try {
      await onSubmit?.(trimmed)
      setReason('')
    } catch {
      // Parent keeps the error Alert on the page.
    } finally {
      setConfirmOpen(false)
    }
  }

  if (loading) {
    return (
      <Card eyebrow="Baja" title="Solicitud de baja">
        <Spinner label="Cargando tu solicitud…" />
      </Card>
    )
  }

  if (!hasActiveSubscription && !request) {
    return (
      <Card eyebrow="Baja" title="Solicitud de baja">
        <EmptyState
          title="Necesitas una suscripción activa"
          text="Solo puedes pedir la baja si tienes un plan contratado."
          action={pricingTo && <Button to={pricingTo}>Ver planes</Button>}
        />
      </Card>
    )
  }

  return (
    <Card eyebrow="Baja" title="Solicitud de baja">
      <div className={styles.root}>
        {isPending && (
          <>
            <div className={styles.statusRow}>
              <Badge status="pending">Pendiente de revisión</Badge>
            </div>
            <p className={styles.lead}>
              Hemos recibido tu solicitud. Sigues activa hasta que administración la revise.
            </p>
            {request.requested_at && (
              <p className={styles.meta}>Pedida el {formatDateTime(request.requested_at)}</p>
            )}
            {request.reason && <blockquote className={styles.reason}>{request.reason}</blockquote>}
          </>
        )}

        {isApproved && (
          <>
            <div className={styles.statusRow}>
              <Badge status="approved" />
            </div>
            <p className={styles.lead}>Tu baja ha sido aprobada. Gracias por haber formado parte de Brava.</p>
            {request.reviewed_at && (
              <p className={styles.meta}>Revisada el {formatDateTime(request.reviewed_at)}</p>
            )}
            {request.admin_notes && <p className={styles.notes}>{request.admin_notes}</p>}
          </>
        )}

        {isRejected && (
          <>
            <div className={styles.statusRow}>
              <Badge status="rejected" />
            </div>
            <p className={styles.lead}>
              Tu solicitud anterior fue rechazada. Si lo necesitas, puedes enviar una nueva.
            </p>
            {request.admin_notes && <p className={styles.notes}>{request.admin_notes}</p>}
          </>
        )}

        {canRequest && (
          <form className={styles.form} onSubmit={handleAskConfirm} noValidate>
            {!isRejected && (
              <p className={styles.lead}>
                Si quieres darte de baja, cuéntanos el motivo. Seguirás activa hasta que
                administración revise la solicitud. No hay forma de borrarte la cuenta tú misma.
              </p>
            )}
            <Field
              label="Motivo de la baja"
              as="textarea"
              rows={3}
              maxLength={REASON_MAX}
              value={reason}
              placeholder="Cuéntanos por qué…"
              hint={`${reason.trim().length}/${REASON_MAX}`}
              error={fieldError}
              disabled={busy}
              onChange={(event) => {
                setReason(event.target.value)
                if (fieldError) setFieldError('')
              }}
            />
            <div className={styles.actions}>
              <Button type="submit" variant="danger" disabled={busy}>
                Solicitar la baja
              </Button>
            </div>
          </form>
        )}
      </div>

      <Modal
        open={confirmOpen}
        title="¿Solicitar la baja?"
        description="Administración revisará tu solicitud. Mientras tanto sigues activa y puedes seguir reservando."
        confirmLabel="Sí, solicitar"
        cancelLabel="Volver"
        tone="danger"
        busy={busy}
        onConfirm={handleConfirm}
        onClose={() => {
          if (!busy) setConfirmOpen(false)
        }}
      />
    </Card>
  )
}

import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import { formatDate } from '@/utils/format'
import styles from './CancellationRequestCard.module.scss'

/**
 * CancellationRequestCard
 * A member's cancellation request for the admin inbox (RN-13): reason, admin notes and
 * Approve / Reject. Rejecting requires notes. Once reviewed it shows the decision.
 * The page should confirm the approval with a Modal: it deactivates the member.
 *
 * Props: request { id, member_name, member_email?, plan_name, requested_at, reason, status, admin_notes },
 *        busy, onApprove(request, notes), onReject(request, notes)
 */
export default function CancellationRequestCard({ request, busy = false, onApprove, onReject }) {
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const isPending = request.status === 'pending'

  function handleReject() {
    if (!notes.trim()) {
      setError('Para rechazar, explica el motivo en las notas.')
      return
    }
    onReject?.(request, notes.trim())
  }

  return (
    <article className={styles.root}>
      <div className={styles.head}>
        <h3 className={styles.name}>{request.member_name}</h3>
        <span className={styles.date}>Pedida el {formatDate(request.requested_at)}</span>
      </div>
      {request.member_email && <span className={styles.plan}>{request.member_email}</span>}
      {request.plan_name && <span className={styles.plan}>Plan {request.plan_name}</span>}
      <blockquote className={styles.reason}>{request.reason}</blockquote>

      {isPending ? (
        <>
          <Field
            label="Notas de administración"
            as="textarea"
            rows={2}
            maxLength={2000}
            value={notes}
            hint="Obligatorias para rechazar. Opcionales al aprobar."
            error={error}
            disabled={busy}
            onChange={(e) => {
              setNotes(e.target.value)
              if (error) setError('')
            }}
          />
          <div className={styles.actions}>
            <Button disabled={busy} onClick={() => onApprove?.(request, notes.trim())}>
              Aprobar baja
            </Button>
            <Button variant="secondary" disabled={busy} onClick={handleReject}>
              Rechazar
            </Button>
          </div>
        </>
      ) : (
        <div className={styles.decision}>
          <Badge status={request.status} />
          {request.admin_notes && <p className={styles.notes}>{request.admin_notes}</p>}
        </div>
      )}
    </article>
  )
}

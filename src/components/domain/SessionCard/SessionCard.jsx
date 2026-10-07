import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import cx from '@/utils/cx'
import { formatEuros, formatTime } from '@/utils/format'
import { getSessionState } from './sessionState'
import styles from './SessionCard.module.scss'

/**
 * SessionCard
 * One session of the timetable, in the state it has for the current member:
 * available, full (waitlist), booked, booked with less than 1 hour left (cannot cancel),
 * waitlisted (with position), extra price, past or cancelled.
 * Data objects use the API's field names (snake_case).
 *
 * Props: session { id, starts_at, duration_minutes, class_type_name, trainer_name, free_spots,
 *                  extra_price_cents, status },
 *        booking { id, status, waitlist_position } | null, now, busy,
 *        onBook(session), onCancel(booking), onLeaveWaitlist(booking)
 */
export default function SessionCard({ session, booking = null, now, busy = false, onBook, onCancel, onLeaveWaitlist }) {
  const state = getSessionState(session, booking, now)
  const hasExtraPrice = session.extra_price_cents > 0

  return (
    <article
      className={cx(
        styles.root,
        (state === 'booked' || state === 'bookedLocked') && styles.isBooked,
        state === 'waitlisted' && styles.isWaitlisted,
        (state === 'past' || state === 'cancelled') && styles.isInactive,
      )}
    >
      <div className={styles.top}>
        <time className={styles.time} dateTime={session.starts_at}>
          {formatTime(session.starts_at)}
        </time>
        {hasExtraPrice && <Badge tone="brand">+{formatEuros(session.extra_price_cents)}</Badge>}
      </div>
      <h3 className={styles.name}>{session.class_type_name}</h3>
      <span className={styles.meta}>
        {session.trainer_name} · {session.duration_minutes} min
      </span>

      <StateLine state={state} session={session} booking={booking} />

      <div className={styles.action}>
        {state === 'available' && (
          <Button variant={hasExtraPrice ? 'primary' : 'dark'} size="sm" fullWidth disabled={busy} onClick={() => onBook?.(session)}>
            Reservar
          </Button>
        )}
        {state === 'full' && (
          <Button variant="secondary" size="sm" fullWidth disabled={busy} onClick={() => onBook?.(session)}>
            Unirme a la lista
          </Button>
        )}
        {state === 'booked' && onCancel && (
          <Button variant="secondary" size="sm" fullWidth disabled={busy} onClick={() => onCancel(booking)}>
            Cancelar
          </Button>
        )}
        {state === 'bookedLocked' && onCancel && (
          <Button variant="secondary" size="sm" fullWidth disabled>
            Ya no se puede cancelar
          </Button>
        )}
        {state === 'waitlisted' && onLeaveWaitlist && (
          <Button variant="secondary" size="sm" fullWidth disabled={busy} onClick={() => onLeaveWaitlist(booking)}>
            Salir de la lista
          </Button>
        )}
      </div>
    </article>
  )
}

function StateLine({ state, session, booking }) {
  switch (state) {
    case 'available':
      return (
        <span className={styles.free}>
          {session.free_spots === 1 ? '1 plaza libre' : `${session.free_spots} plazas libres`}
        </span>
      )
    case 'full':
      return <span className={styles.full}>Completa</span>
    case 'booked':
      return <Badge status="confirmed" onSurface />
    case 'bookedLocked':
      return (
        <>
          <Badge status="confirmed" onSurface />
          <span className={styles.note}>Falta menos de 1 hora.</span>
        </>
      )
    case 'waitlisted':
      return (
        <Badge status="waitlisted" onSurface>
          Lista de espera{booking?.waitlist_position ? ` · ${booking.waitlist_position}.º` : ''}
        </Badge>
      )
    case 'cancelled':
      return <Badge status="cancelled" />
    default:
      return <span className={styles.note}>Ya ha empezado</span>
  }
}

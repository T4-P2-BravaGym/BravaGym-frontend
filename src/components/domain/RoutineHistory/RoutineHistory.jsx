/**
 * RoutineHistory (T-12)
 * A trainer picks a member and sees all her routines, newest first.
 * Each routine is a card that opens to show its days (RoutineDays).
 *
 * Props: members ([{ id, name }])
 */
import { useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Field from '@/components/ui/Field'
import Spinner from '@/components/ui/Spinner'
import RoutineDays from '@/components/domain/RoutineDays'
import { listRoutines } from '@/services/routines'
import { formatDate } from '@/utils/format'
import styles from './RoutineHistory.module.scss'

export default function RoutineHistory({ members }) {
  const [memberId, setMemberId] = useState('')
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [openId, setOpenId] = useState(null) // the routine that is unfolded, if any

  // Reset everything here, in the event, not inside the effect:
  // the effect only loads data
  function handleMemberChange(event) {
    setMemberId(event.target.value)
    setRoutines([])
    setError(null)
    setOpenId(null)
    setLoading(true)
  }

  // Load the routines every time the member changes.
  // If she changes member before the answer arrives, the old request is cancelled
  useEffect(() => {
    if (!memberId) return
    const controller = new AbortController()

    listRoutines({ memberId, signal: controller.signal })
      .then((data) => {
        setRoutines(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return // a newer request replaced this one
        setError(err.message)
        setLoading(false)
      })

    return () => controller.abort()
  }, [memberId])

  return (
    <div className={styles.root}>
      <Field label="Socia" as="select" value={memberId} onChange={handleMemberChange}>
        <option value="" disabled>Elige una socia</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>{member.name}</option>
        ))}
      </Field>

      {loading && <Spinner />}

      {error && (
        <Alert tone="error" title="No hemos podido cargar el historial">{error}</Alert>
      )}

      {memberId && !loading && !error && routines.length === 0 && (
        <EmptyState
          title="Esta socia todavía no tiene rutinas"
          text="Cuando le crees una en «Nueva rutina», aparecerá aquí."
        />
      )}

      <ul className={styles.list}>
        {routines.map((routine) => {
          const isOpen = routine.id === openId
          return (
            <Card as="li" key={routine.id}>
              {/* A real button: works with keyboard and screen readers.
                  aria-expanded tells if the card is open or closed */}
              <button
                type="button"
                className={styles.summary}
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : routine.id)}
              >
                <span className={styles.name}>{routine.name}</span>
                <span className={styles.meta}>
                  desde el {formatDate(routine.start_date)} · por {routine.trainer_name}
                </span>
                {/* The text says the state; the color only helps */}
                <Badge tone={routine.is_active ? 'success' : 'neutral'}>
                  {routine.is_active ? 'Activa' : 'Inactiva'}
                </Badge>
              </button>

              {isOpen && (
                <div className={styles.detail}>
                  {routine.notes && <p className={styles.notes}>{routine.notes}</p>}
                  <RoutineDays days={routine.days} />
                </div>
              )}
            </Card>
          )
        })}
      </ul>
    </div>
  )
}
/**
 * Mi rutina
 */
import { useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import RoutineDays from '@/components/domain/RoutineDays'
import { myRoutine } from '@/services/routines'
import { formatDate } from '@/utils/format'
import styles from './MyRoutine.module.scss'

export default function MyRoutine() {
  const [routine, setRoutine] = useState(null)      
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    myRoutine()
      .then((data) => setRoutine(data))
      .catch((err) => {
        // 404 = this member has no routine yet: not an error, the empty state shows it
        if (err.status !== 404) setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])
  
  return (
    <section className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mi rutina</h1>
        {routine && (
          <span className={styles.meta}>
            por {routine.trainer_name} · desde el {formatDate(routine.start_date)}
          </span>
        )}
      </div>

      {loading && <Spinner />}

      {error && <Alert tone="error" title="No hemos podido cargar tu rutina">{error}</Alert>}

      {!loading && !error && !routine && (
        <EmptyState
          title="Todavía no tienes rutina"
          text="Tu entrenadora te la preparará pronto."
        />
      )}

      {routine && <RoutineDays days={routine.days} />}
    </section>
  )
}

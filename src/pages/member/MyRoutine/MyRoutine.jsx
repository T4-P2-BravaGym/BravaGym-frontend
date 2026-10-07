/**
 * Mi rutina
 */
import { useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import Tabs from '@/components/ui/Tabs'
import ExerciseRow from '@/components/domain/ExerciseRow'
import { myRoutine } from '@/services/routines'
import { formatDate } from '@/utils/format'
import styles from './MyRoutine.module.scss'

export default function MyRoutine() {
  const [routine, setRoutine] = useState(null)      
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeDay, setActiveDay] = useState(null)  

  useEffect(() => {
    myRoutine()
      .then((data) => setRoutine(data))
      .catch((err) => {
        // 404 = this member has no routine yet: not an error, the empty state shows it
        if (err.status !== 404) setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])
  const days = routine ? routine.days : []
  const tabs = days.map((day) => ({ id: day.day_number, label: `Día ${day.day_number}` }))
  const currentDay = days.find((day) => day.day_number === activeDay) ?? days[0]
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

      {!loading && !error && !currentDay && (
        <EmptyState
          title="Todavía no tienes rutina"
          text="Tu entrenadora te la preparará pronto."
        />
      )}

      {currentDay && (
        <Tabs tabs={tabs} active={currentDay.day_number} onChange={setActiveDay} label="Día de la rutina">
          <ol>
            {currentDay.lines.map((line) => (
              <ExerciseRow key={line.position} line={line} />
            ))}
          </ol>
        </Tabs>
      )}
    </section>
  )
}

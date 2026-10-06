/**
 * Mi rutina
 * TODO(HU-18): build this page from components and load data through src/services.
 */
import { useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import Tabs from '@/components/ui/Tabs'
import ExerciseRow from '@/components/domain/ExerciseRow'
import { myRoutine } from '@/services/routines'

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
    <section>
      <h1>Mi rutina</h1>

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

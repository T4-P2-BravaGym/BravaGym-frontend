/**
 * Mi rutina
 * TODO(HU-18): build this page from components and load data through src/services.
 */
import { useState } from 'react'
import Tabs from '@/components/ui/Tabs'
import ExerciseRow from '@/components/domain/ExerciseRow'

// Temporary sample data: it will come from GET /routines/me
const DAYS = [
  {
    day_number: 1,
    lines: [
      { position: 1, exercise_name: 'Sentadilla goblet', sets: 4, reps: 10, rest_seconds: 90 },
      { position: 2, exercise_name: 'Peso muerto rumano', sets: 3, reps: 10, rest_seconds: 90 },
      { position: 3, exercise_name: 'Hip thrust', sets: 4, reps: 12, rest_seconds: 60 },
    ],
  },
  {
    day_number: 2,
    lines: [
      { position: 1, exercise_name: 'Press de banca', sets: 4, reps: 8, rest_seconds: 120 },
      { position: 2, exercise_name: 'Remo con mancuerna', sets: 3, reps: 10, rest_seconds: 90 },
    ],
  },
]

export default function MyRoutine() {
  const [activeDay, setActiveDay] = useState(1)

  const tabs = DAYS.map((day) => ({ id: day.day_number, label: `Día ${day.day_number}` }))
  const currentDay = DAYS.find((day) => day.day_number === activeDay)

  return (
    <section>
      <h1>Mi rutina</h1>
      <Tabs tabs={tabs} active={activeDay} onChange={setActiveDay} label="Día de la rutina">
        <ol>
          {currentDay.lines.map((line) => (
            <ExerciseRow key={line.position} line={line} />
          ))}
        </ol>
      </Tabs>
    </section>
  )
}

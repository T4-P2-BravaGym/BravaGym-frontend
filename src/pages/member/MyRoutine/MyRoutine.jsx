/**
 * Mi rutina
 * TODO(HU-18): build this page from components and load data through src/services.
 */
import ExerciseRow from '@/components/domain/ExerciseRow'

const LINES = [
  { position: 1, exercise_name: 'Sentadilla goblet', sets: 4, reps: 10, rest_seconds: 90 },
  { position: 2, exercise_name: 'Peso muerto rumano', sets: 3, reps: 10, rest_seconds: 90 },
  { position: 3, exercise_name: 'Hip thrust', sets: 4, reps: 12, rest_seconds: 60 },
]
export default function MyRoutine() {
  return (
    <section>
      <h1>Mi rutina</h1>
      <ol>
        {LINES.map((line) => (
          <ExerciseRow key={line.position} line={line} />
        ))}
      </ol>
    </section>
  )
}

import { formatRest } from '@/utils/format'
import styles from './ExerciseRow.module.scss'

/**
 * ExerciseRow
 * One line of a routine: order, exercise, sets × reps and rest. Renders an <li>,
 * so put it inside an <ol>.
 *
 * Props: line { position, exercise_name, sets, reps, rest_seconds }
 */
export default function ExerciseRow({ line }) {
  return (
    <li className={styles.root}>
      <span className={styles.position} aria-hidden="true">
        {line.position}
      </span>
      <span className={styles.name}>{line.exercise_name}</span>
      <span className={styles.dose}>
        {line.sets} × {line.reps}
        <span className={styles.rest}>descanso {formatRest(line.rest_seconds)}</span>
      </span>
    </li>
  )
}

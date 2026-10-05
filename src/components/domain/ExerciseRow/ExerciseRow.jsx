import styles from './ExerciseRow.module.scss'

/**
 * ExerciseRow
 * Una línea de la rutina: orden, ejercicio, series × repeticiones y descanso.
 *
 * Props (proposal): exercise
 * Uses: — · Stories: HU-18 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function ExerciseRow({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

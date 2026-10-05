import styles from './RoutineEditor.module.scss'

/**
 * RoutineEditor
 * Editor de rutina para entrenadoras: socia, días y líneas de ejercicios editables.
 *
 * Props (proposal): routine, exercises, members, onSave
 * Uses: Field, Tabs, Button · Stories: HU-17 · Level: Avanzado
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function RoutineEditor({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

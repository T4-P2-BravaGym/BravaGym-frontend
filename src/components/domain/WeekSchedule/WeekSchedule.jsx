import styles from './WeekSchedule.module.scss'

/**
 * WeekSchedule
 * Rejilla semanal de SessionCard con filtros de día y clase; en la entrega 2 se actualiza por websocket.
 *
 * Props (proposal): sessions, filters, onFilterChange
 * Uses: SessionCard, Chip · Stories: HU-10, HU-16 · Level: Avanzado
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function WeekSchedule({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

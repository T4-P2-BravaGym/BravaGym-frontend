import styles from './SessionCard.module.scss'

/**
 * SessionCard
 * Una sesión del horario en cada estado: con plazas, reservada, lista de espera, completa, con precio extra; botón según el estado y regla de 1 hora.
 *
 * Props (proposal): session, booking, onBook, onCancel
 * Uses: Button, Badge · Stories: HU-10, HU-12, HU-13 · Level: Medio
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function SessionCard({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

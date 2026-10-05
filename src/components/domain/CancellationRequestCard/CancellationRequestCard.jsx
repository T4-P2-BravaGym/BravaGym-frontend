import styles from './CancellationRequestCard.module.scss'

/**
 * CancellationRequestCard
 * Solicitud de baja con motivo, notas de administración y botones Aprobar / Rechazar.
 *
 * Props (proposal): request, onApprove, onReject
 * Uses: Field, Button, Card · Stories: HU-20 · Level: Medio
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function CancellationRequestCard({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

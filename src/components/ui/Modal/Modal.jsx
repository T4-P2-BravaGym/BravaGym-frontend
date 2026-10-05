import styles from './Modal.module.scss'

/**
 * Modal
 * Diálogo de confirmación accesible (foco atrapado, Escape cierra). Para cancelar reserva o aprobar baja.
 *
 * Props (proposal): open, title, onConfirm, onClose, children
 * Uses: Button · Stories: HU-13, HU-20 · Level: Medio
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function Modal({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

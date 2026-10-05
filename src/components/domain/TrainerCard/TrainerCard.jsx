import styles from './TrainerCard.module.scss'

/**
 * TrainerCard
 * Entrenadora con avatar, especialidad y bio; enlace a sus franjas.
 *
 * Props (proposal): trainer
 * Uses: Avatar · Stories: HU-15, HU-14 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function TrainerCard({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

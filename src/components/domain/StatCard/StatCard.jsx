import styles from './StatCard.module.scss'

/**
 * StatCard
 * Cifra de resumen del panel de administración con enlace.
 *
 * Props (proposal): label, value, to
 * Uses: — · Stories: HU-26 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function StatCard({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

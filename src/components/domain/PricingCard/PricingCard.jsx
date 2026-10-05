import styles from './PricingCard.module.scss'

/**
 * PricingCard
 * Plan de la página de precios: normal o destacado, lista de ventajas y botón Elegir.
 *
 * Props (proposal): plan, featured, onSelect
 * Uses: Button, Badge · Stories: HU-07, HU-09 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function PricingCard({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

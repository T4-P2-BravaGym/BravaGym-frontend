import styles from './CartSummary.module.scss'

/**
 * CartSummary
 * Resumen del carrito: líneas, cantidades y total (el total real lo calcula la API).
 *
 * Props (proposal): items, onChangeQuantity, onCheckout
 * Uses: Button · Stories: HU-23 · Level: Medio
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function CartSummary({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

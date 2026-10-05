import styles from './DiscountCodeInput.module.scss'

/**
 * DiscountCodeInput
 * Campo para aplicar un código: valida con la API y muestra el descuento o el error.
 *
 * Props (proposal): onApply
 * Uses: Field, Button · Stories: HU-24 · Level: Medio
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function DiscountCodeInput({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

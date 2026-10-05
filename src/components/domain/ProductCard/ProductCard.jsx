import styles from './ProductCard.module.scss'

/**
 * ProductCard
 * Producto de la tienda con categoría, precio y botón Añadir o etiqueta Agotado.
 *
 * Props (proposal): product, onAdd
 * Uses: Button, Badge · Stories: HU-21 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function ProductCard({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

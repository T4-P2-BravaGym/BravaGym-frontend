import styles from './Chip.module.scss'

/**
 * Chip
 * Botón de filtro con aria-pressed: día de la semana, categoría de la tienda.
 *
 * Props (proposal): selected, onClick, children
 * Uses: — · Stories: HU-10, HU-21 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function Chip({ children, ...rest }) {
  return (
    <button type="button" className={styles.root} {...rest}>
      {children}
    </button>
  )
}

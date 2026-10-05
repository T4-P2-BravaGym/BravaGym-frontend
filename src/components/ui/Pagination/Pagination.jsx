import styles from './Pagination.module.scss'

/**
 * Pagination
 * Anterior / siguiente y 'Mostrando 1–20 de 48' a partir de {items, total, page, size}.
 *
 * Props (proposal): page, size, total, onChange
 * Uses: Button · Stories: HU-06, HU-21, HU-26 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function Pagination({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

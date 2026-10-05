import styles from './Table.module.scss'

/**
 * Table
 * Tabla de datos con cabecera, filas y estado vacío. Para los paneles de administración.
 *
 * Props (proposal): columns, rows, emptyText
 * Uses: EmptyState · Stories: HU-06, HU-26 · Level: Medio
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function Table({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

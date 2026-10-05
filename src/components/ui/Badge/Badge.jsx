import styles from './Badge.module.scss'

/**
 * Badge
 * Etiqueta de estado: success, wait, danger, neutral, brand, solid. Cada estado de la API siempre con el mismo tono.
 *
 * Props (proposal): tone, children
 * Uses: — · Stories: HU-12, HU-24 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function Badge({ children, ...rest }) {
  return (
    <span className={styles.root} {...rest}>
      {children}
    </span>
  )
}

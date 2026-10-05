import styles from './Card.module.scss'

/**
 * Card
 * Contenedor plano: default, tint, dark. Con eyebrow, título y meta.
 *
 * Props (proposal): variant, eyebrow, title, children
 * Uses: — · Stories: HU-04 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function Card({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

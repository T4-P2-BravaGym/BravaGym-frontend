import styles from './Footer.module.scss'

/**
 * Footer
 * Pie de la web pública.
 *
 * Props (proposal): —
 * Uses: — · Stories: HU-07 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function Footer({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

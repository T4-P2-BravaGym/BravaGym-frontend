import styles from './Button.module.scss'

/**
 * Button
 * Botón píldora: primary, secondary, dark, quiet, danger; tamaño small; disabled con texto que explica el motivo. Renderiza <button> o <a>.
 *
 * Props (proposal): variant, size, as, disabled, children
 * Uses: — · Stories: HU-00 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function Button({ children, ...rest }) {
  return (
    <button className={styles.root} {...rest}>
      {children}
    </button>
  )
}

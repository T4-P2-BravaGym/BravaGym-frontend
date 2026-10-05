import styles from './Field.module.scss'

/**
 * Field
 * Campo con label, input/select/textarea, ayuda y error accesibles (aria-invalid, aria-describedby).
 *
 * Props (proposal): label, as, hint, error, ...inputProps
 * Uses: — · Stories: HU-02, HU-03 · Level: Medio
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function Field({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

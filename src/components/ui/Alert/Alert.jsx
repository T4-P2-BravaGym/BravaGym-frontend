import styles from './Alert.module.scss'

/**
 * Alert
 * Aviso de error o éxito con el mensaje de la API traducido (nunca '409').
 *
 * Props (proposal): tone, children
 * Uses: — · Stories: HU-00 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function Alert({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

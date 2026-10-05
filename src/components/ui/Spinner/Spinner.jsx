import styles from './Spinner.module.scss'

/**
 * Spinner
 * Indicador de carga mientras llega la API.
 *
 * Props (proposal): label
 * Uses: — · Stories: HU-00 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function Spinner({ children, ...rest }) {
  return (
    <span className={styles.root} {...rest}>
      {children}
    </span>
  )
}

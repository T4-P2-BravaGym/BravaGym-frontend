import styles from './EmptyState.module.scss'

/**
 * EmptyState
 * Mensaje amable cuando no hay datos ('Aún no tienes rutina').
 *
 * Props (proposal): title, text, action
 * Uses: — · Stories: HU-18 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function EmptyState({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

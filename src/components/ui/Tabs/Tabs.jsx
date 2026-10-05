import styles from './Tabs.module.scss'

/**
 * Tabs
 * Pestañas accesibles (role=tablist): días de la rutina.
 *
 * Props (proposal): tabs, active, onChange
 * Uses: — · Stories: HU-18 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function Tabs({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

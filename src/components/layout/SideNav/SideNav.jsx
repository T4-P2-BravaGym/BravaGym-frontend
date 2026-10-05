import styles from './SideNav.module.scss'

/**
 * SideNav
 * Barra lateral ciruela de las áreas privadas; entradas según el rol y aria-current.
 *
 * Props (proposal): items, user
 * Uses: Avatar · Stories: HU-04 · Level: Medio
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function SideNav({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

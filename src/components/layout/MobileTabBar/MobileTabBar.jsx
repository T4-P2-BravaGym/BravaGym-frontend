import styles from './MobileTabBar.module.scss'

/**
 * MobileTabBar
 * Barra inferior del móvil para las socias: Reservar, Rutina, Pagos, Tienda.
 *
 * Props (proposal): items
 * Uses: — · Stories: HU-12 · Level: Medio
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function MobileTabBar({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

import { NavLink } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import cx from '@/utils/cx'
import styles from './MobileTabBar.module.scss'

/**
 * MobileTabBar
 * Bottom bar on phones for members: Reservar, Rutina, Pagos, Tienda.
 * Only visible at phone width; on larger screens the SideNav is enough.
 *
 * Props: items [{ to, label, icon }]
 */
export default function MobileTabBar({ items }) {
  if (!items?.length) return null
  return (
    <nav className={styles.root} aria-label="Accesos rápidos">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => cx(styles.item, isActive && styles.isActive)}>
          <Icon name={item.icon} size={22} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

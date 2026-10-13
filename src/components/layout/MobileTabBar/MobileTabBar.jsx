import { NavLink } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import cx from '@/utils/cx'
import styles from './MobileTabBar.module.scss'

/**
 * MobileTabBar
 * Bottom bar on phones for members: Reservar, Rutina, Pagos, Carrito.
 * Only visible at phone width; on larger screens the SideNav is enough.
 *
 * Props: items [{ to, label, icon, count }]
 */
export default function MobileTabBar({ items }) {
  if (!items?.length) return null
  return (
      <nav className={styles.root} aria-label="Accesos rápidos">
        {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => cx(styles.item, isActive && styles.isActive)}>
          <span className={styles.icon}>
            <Icon name={item.icon} size={22} />
            {item.count > 0 && <span className={styles.count}>{item.count > 99 ? '99+' : item.count}</span>}
          </span>
              <span>{item.label}</span>
            </NavLink>
        ))}
      </nav>
  )
}
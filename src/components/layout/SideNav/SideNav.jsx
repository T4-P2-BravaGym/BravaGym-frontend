import { Link, NavLink } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import { PATHS } from '@/routes/paths'
import cx from '@/utils/cx'
import styles from './SideNav.module.scss'

/**
 * SideNav
 * Plum sidebar of the private areas. The entries come from routes/navigation.js
 * (one list per role); the current page gets aria-current automatically (NavLink).
 * Hidden on phones, where MobileTabBar (members) or the top of the page takes over.
 *
 * Props: area { eyebrow, label, items: [{ to, label, end }] }, user { name, roleLabel }, onLogout
 */
export default function SideNav({ area, user, onLogout }) {
  return (
    <aside className={styles.root}>
      <div className={styles.brand}>
        <Link to={PATHS.home} className={styles.logo} aria-label="Brava, inicio">
          brava<span className={styles.dot}>.</span>
        </Link>
        {area.eyebrow && <span className={styles.eyebrow}>{area.eyebrow}</span>}
      </div>

      <nav aria-label={area.label} className={styles.nav}>
        {area.items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cx(styles.link, isActive && styles.isActive)}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className={styles.user}>
          <Avatar name={user.name} tone="champagne" />
          <div className={styles.userText}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userRole}>{user.roleLabel}</span>
          </div>
          {onLogout && (
            <button type="button" className={styles.logout} onClick={onLogout}>
              Salir
            </button>
          )}
        </div>
      )}
    </aside>
  )
}

import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import SideNav from '@/components/layout/SideNav'
import MobileTabBar from '@/components/layout/MobileTabBar'
import useAuth from '@/hooks/useAuth'
import useCart from '@/hooks/useCart'
import { areaFor, NAVIGATION, ROLE_LABELS } from '@/routes/navigation'
import { PATHS } from '@/routes/paths'
import cx from '@/utils/cx'
import styles from './PrivateLayout.module.scss'

// T-93: the narrow menu is a preference of this browser only, so localStorage is enough
const COLLAPSED_KEY = 'brava.sidenav.collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Private areas (member, trainer, admin): SideNav with the entries of the area and the
 * page content; members also get MobileTabBar on phones. The entries come from
 * routes/navigation.js, so there is one layout for every role (DRY).
 * The cart entry gets the number of units in the cart.
 * On a computer the menu can shrink to its icons (T-93).
 */
export default function PrivateLayout() {
  const { user, role, logout } = useAuth()
  const { count } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(readCollapsed)

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, String(collapsed))
    } catch {
      // Private mode or blocked storage: the menu still works, it just is not remembered
    }
  }, [collapsed])
  const areaKey = areaFor(role, location.pathname)
  const baseArea = NAVIGATION[areaKey]
  const items = baseArea.items.map((item) => (item.to === PATHS.cart ? { ...item, count } : item))
  const area = { ...baseArea, items }

  const sideUser = user
      ? { name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'Mi cuenta', roleLabel: ROLE_LABELS[user.role] }
      : null

  async function handleLogout() {
    const confirmed = await logout()
    navigate(confirmed ? PATHS.home : PATHS.login)
  }

  return (
      <div className={cx(styles.root, collapsed && styles.isCollapsed)}>
        <SideNav
          area={area}
          user={sideUser}
          onLogout={user ? handleLogout : undefined}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
        />
        <main className={styles.content}>
          <Outlet />
        </main>
        {areaKey === 'member' && <MobileTabBar items={items.filter((item) => item.mobile)} />}
      </div>
  )
}

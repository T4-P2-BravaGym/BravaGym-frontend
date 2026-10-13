import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import SideNav from '@/components/layout/SideNav'
import MobileTabBar from '@/components/layout/MobileTabBar'
import useAuth from '@/hooks/useAuth'
import useCart from '@/hooks/useCart'
import { areaFor, NAVIGATION, ROLE_LABELS } from '@/routes/navigation'
import { PATHS } from '@/routes/paths'
import styles from './PrivateLayout.module.scss'

/**
 * Private areas (member, trainer, admin): SideNav with the entries of the area and the
 * page content; members also get MobileTabBar on phones. The entries come from
 * routes/navigation.js, so there is one layout for every role (DRY).
 * The cart entry gets the number of units in the cart.
 */
export default function PrivateLayout() {
  const { user, role, logout } = useAuth()
  const { count } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const areaKey = areaFor(role, location.pathname)
  const baseArea = NAVIGATION[areaKey]
  const items = baseArea.items.map((item) => (item.to === PATHS.cart ? { ...item, count } : item))
  const area = { ...baseArea, items }

  const sideUser = user
      ? { name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'Mi cuenta', roleLabel: ROLE_LABELS[user.role] }
      : null

  function handleLogout() {
    logout()
    navigate(PATHS.home)
  }

  return (
      <div className={styles.root}>
        <SideNav area={area} user={sideUser} onLogout={user ? handleLogout : undefined} />
        <main className={styles.content}>
          <Outlet />
        </main>
        {areaKey === 'member' && <MobileTabBar items={items.filter((item) => item.mobile)} />}
      </div>
  )
}
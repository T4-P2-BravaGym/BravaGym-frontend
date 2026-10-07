import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import SideNav from '@/components/layout/SideNav'
import MobileTabBar from '@/components/layout/MobileTabBar'
import useAuth from '@/hooks/useAuth'
import { areaFor, NAVIGATION, ROLE_LABELS } from '@/routes/navigation'
import { PATHS } from '@/routes/paths'
import styles from './PrivateLayout.module.scss'

/**
 * Private areas (member, trainer, admin): SideNav with the entries of the area and the
 * page content; members also get MobileTabBar on phones. The entries come from
 * routes/navigation.js, so there is one layout for every role (DRY).
 */
export default function PrivateLayout() {
  const { user, role, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const areaKey = areaFor(role, location.pathname)
  const area = NAVIGATION[areaKey]

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
      {areaKey === 'member' && <MobileTabBar items={area.items.filter((item) => item.mobile)} />}
    </div>
  )
}

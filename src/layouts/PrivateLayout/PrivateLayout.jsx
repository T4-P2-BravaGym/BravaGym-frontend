import { Outlet } from 'react-router-dom'
import SideNav from '@/components/layout/SideNav'
import MobileTabBar from '@/components/layout/MobileTabBar'
import styles from './PrivateLayout.module.scss'

/**
 * Private areas (member, trainer, admin): SideNav with the entries of the user's role
 * and the page content; MobileTabBar on phones.
 * TODO(HU-04): build the nav items from the role (one place, DRY), not one layout per role.
 */
export default function PrivateLayout() {
  return (
    <div className={styles.root}>
      <SideNav />
      <main className={styles.content}>
        <Outlet />
      </main>
      <MobileTabBar />
    </div>
  )
}

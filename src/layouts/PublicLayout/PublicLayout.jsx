import { Outlet } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import styles from './PublicLayout.module.scss'

/** Public pages: skip link, Navbar, page content and Footer. (HU-07) */
export default function PublicLayout({ minimal = false }) {
  return (
    <div className={styles.root}>
      <a href="#contenido" className={styles.skip}>
        Saltar al contenido
      </a>
      <Navbar minimal={minimal} />
      <main id="contenido" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer minimal={minimal} />
    </div>
  )
}

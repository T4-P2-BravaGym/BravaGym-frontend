import { Link } from 'react-router-dom'
import { PATHS } from '@/routes/paths'
import styles from './Footer.module.scss'

/**
 * Footer
 * Footer of the public website. The address is a placeholder until the gym has one.
 */
export default function Footer() {
  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <span className={styles.logo}>
          brava<span className={styles.dot}>.</span>
        </span>
        <p className={styles.text}>[Dirección del gimnasio] · Abierto todos los días</p>
        <nav aria-label="Pie de página" className={styles.links}>
          <Link to={PATHS.pricing}>Precios</Link>
          <Link to={PATHS.schedule}>Horario</Link>
          <Link to={PATHS.login}>Área de socias</Link>
        </nav>
      </div>
    </footer>
  )
}

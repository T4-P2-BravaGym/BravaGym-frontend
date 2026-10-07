import { Link } from 'react-router-dom'
import { PUBLIC_LINKS } from '@/routes/navigation'
import { PATHS } from '@/routes/paths'
import styles from './Footer.module.scss'

export default function Footer() {
  return (
      <footer className={styles.root}>
        <div className={styles.inner}>
        <span className={styles.logo}>
          brava<span className={styles.dot}>.</span>
        </span>
          <p className={styles.text}>Gimnasio de fuerza para mujeres · Abierto todos los días</p>
          <nav aria-label="Pie de página" className={styles.links}>
            {PUBLIC_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className={styles.link}>
                  {link.label}
                </Link>
            ))}
            <Link to={PATHS.login} className={styles.link}>
              Área de socias
            </Link>
          </nav>
        </div>
      </footer>
  )
}
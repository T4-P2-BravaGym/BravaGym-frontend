import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import useAuth from '@/hooks/useAuth'
import { PATHS } from '@/routes/paths'
import { areaFor, NAVIGATION, PUBLIC_LINKS } from '@/routes/navigation'
import cx from '@/utils/cx'
import styles from './Navbar.module.scss'

export default function Navbar({ minimal = false }) {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  const areaHome = NAVIGATION[areaFor(role)].items[0].to

  return (
      <header className={styles.root}>
        <div className={styles.inner}>
          <Link to={PATHS.home} className={styles.logo} aria-label="Brava, inicio">
            brava<span className={styles.dot}>.</span>
          </Link>

          {/* Login and register only show the logo: no links, no menu, no buttons */}
          {!minimal && (
              <>
                <button
                    type="button"
                    className={styles.menuButton}
                    aria-expanded={open}
                    aria-controls="main-menu"
                    onClick={() => setOpen((value) => !value)}
                >
                  <Icon name={open ? 'x' : 'menu'} />
                  <span>Menú</span>
                </button>

                <nav id="main-menu" className={cx(styles.menu, open && styles.isOpen)} aria-label="Principal">
                  <ul className={styles.links}>
                    {PUBLIC_LINKS.map((link) => (
                        <li key={link.to}>
                          <NavLink to={link.to} className={({ isActive }) => cx(styles.link, isActive && styles.isActive)}>
                            {link.label}
                          </NavLink>
                        </li>
                    ))}
                  </ul>
                  <div className={styles.actions}>
                    {isAuthenticated ? (
                        <Button to={areaHome} variant="dark">
                          Mi área
                        </Button>
                    ) : (
                        <>
                          <Button to={PATHS.login} variant="secondary">
                            Entrar
                          </Button>
                          <Button to={PATHS.pricing}>Empieza ahora</Button>
                        </>
                    )}
                  </div>
                </nav>
              </>
          )}
        </div>
      </header>
  )
}
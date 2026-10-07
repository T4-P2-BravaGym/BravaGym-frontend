import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'
import { PATHS } from '@/routes/paths'
import cx from '@/utils/cx'
import styles from './SideNav.module.scss'

/**
 * Props: area { eyebrow, label, items: [{ to, label, end }] }, user { name, roleLabel }, onLogout
 */
export default function SideNav({ area, user, onLogout }) {
    const [open, setOpen] = useState(false)
    const menuButtonRef = useRef(null)
    const location = useLocation()

    useEffect(() => setOpen(false), [location.pathname])

    function handleKeyDown(event) {
        if (event.key === 'Escape' && open) {
            setOpen(false)
            menuButtonRef.current?.focus()
        }
    }

    return (
        <aside className={cx(styles.root, open && styles.isOpen)} onKeyDown={handleKeyDown}>
            <div className={styles.bar}>
                <div className={styles.brand}>
                    <Link to={PATHS.home} className={styles.logo} aria-label="Brava, inicio">
                        brava<span className={styles.dot}>.</span>
                    </Link>
                    {area.eyebrow && <span className={styles.eyebrow}>{area.eyebrow}</span>}
                </div>

                <button
                    ref={menuButtonRef}
                    type="button"
                    className={styles.menuButton}
                    aria-expanded={open}
                    aria-controls="private-menu"
                    onClick={() => setOpen((value) => !value)}
                >
                    <Icon name={open ? 'x' : 'menu'} />
                    <span>Menú</span>
                </button>
            </div>

            <div id="private-menu" className={styles.panel}>
                <nav aria-label={area.label} className={styles.nav}>
                    {area.items.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => cx(styles.link, isActive && styles.isActive)}
                        >
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
            </div>
        </aside>
    )
}
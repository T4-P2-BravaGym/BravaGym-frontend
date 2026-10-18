import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'
import { PATHS } from '@/routes/paths'
import cx from '@/utils/cx'
import styles from './SideNav.module.scss'

/**
 * Props: area { eyebrow, label, items: [{ to, label, icon, end, count }] }, user { name, roleLabel },
 * onLogout, collapsed, onToggleCollapsed
 * T-93: on a computer the menu can shrink to its icons (`collapsed`); phones keep their own menu.
 */
export default function SideNav({ area, user, onLogout, collapsed = false, onToggleCollapsed }) {
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
        <aside className={cx(styles.root, open && styles.isOpen, collapsed && styles.isCollapsed)} onKeyDown={handleKeyDown}>
            <div className={styles.bar}>
                <div className={styles.brand}>
                    <Link to={PATHS.home} className={styles.logo} aria-label="Brava, inicio">
                        {collapsed ? 'b' : 'brava'}<span className={styles.dot}>.</span>
                    </Link>
                    {area.eyebrow && !collapsed && <span className={styles.eyebrow}>{area.eyebrow}</span>}
                </div>

                {onToggleCollapsed && (
                    <button
                        type="button"
                        className={styles.collapseButton}
                        aria-pressed={collapsed}
                        title="Contraer menú"
                        onClick={onToggleCollapsed}
                    >
                        <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} />
                        <span className={styles.hidden}>Contraer menú</span>
                    </button>
                )}

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
                            title={collapsed ? item.label : undefined}
                        >
                            {collapsed && <Icon name={item.icon} />}
                            <span className={cx(collapsed && styles.hidden)}>{item.label}</span>
                            {item.count > 0 && <span className={styles.count}>{item.count}</span>}
                        </NavLink>
                    ))}
                </nav>

                {user && (
                    <div className={styles.user}>
                        <Avatar name={user.name} tone="champagne" />
                        <div className={cx(styles.userText, collapsed && styles.hidden)}>
                            <span className={styles.userName}>{user.name}</span>
                            <span className={styles.userRole}>{user.roleLabel}</span>
                        </div>
                        {onLogout && (
                            <button type="button" className={styles.logout} onClick={onLogout} title={collapsed ? 'Salir' : undefined}>
                                {collapsed && <Icon name="door" />}
                                <span className={cx(collapsed && styles.hidden)}>Salir</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </aside>
    )
}
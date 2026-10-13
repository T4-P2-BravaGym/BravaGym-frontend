import { Link } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import { PATHS } from '@/routes/paths'
import cx from '@/utils/cx'
import styles from './CartLink.module.scss'

export default function CartLink({ count = 0, className }) {
    const label = count === 1 ? 'Carrito, 1 producto' : `Carrito, ${count} productos`
    return (
        <Link to={PATHS.cart} className={cx(styles.root, className)} aria-label={label}>
            <Icon name="bag" size={22} />
            {count > 0 && (
                <span className={styles.count} aria-hidden="true">
          {count > 99 ? '99+' : count}
        </span>
            )}
        </Link>
    )
}
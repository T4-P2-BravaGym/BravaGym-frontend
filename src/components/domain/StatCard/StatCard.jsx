import { Link } from 'react-router-dom'
import cx from '@/utils/cx'
import styles from './StatCard.module.scss'

/**
 * StatCard
 * A summary figure for the admin panel ("Pagos pendientes: 7") with an optional link
 * to the list it counts. `tint` for the figure that needs attention (one per row).
 *
 * Props: label, value, to, linkLabel, tone ('default' | 'tint')
 */
export default function StatCard({ label, value, to, linkLabel = 'Ver', tone = 'default' }) {
  return (
    <div className={cx(styles.root, styles[tone])}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {to && (
        <Link className={styles.link} to={to}>
          {linkLabel} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  )
}

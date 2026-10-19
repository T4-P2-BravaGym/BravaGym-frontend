import cx from '@/utils/cx'
import styles from './CapacityBar.module.scss'

/**
 * CapacityBar
 * Taken spots over capacity: green while there is room, champagne when full.
 * The number is always written next to the bar.
 *
 * Props: taken, capacity
 */
export default function CapacityBar({ taken, capacity }) {
  const safeCapacity = Math.max(1, capacity)
  const percent = Math.min(100, Math.round((taken / safeCapacity) * 100))
  const isFull = taken >= capacity

  return (
    <div className={styles.root}>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="Aforo ocupado"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={Math.min(taken, capacity)}
        aria-valuetext={`${taken} de ${capacity} plazas ocupadas`}
      >
        <div className={cx(styles.fill, isFull && styles.isFull)} style={{ width: `${percent}%` }} />
      </div>
      <span className={styles.label}>
        {taken}/{capacity}
      </span>
    </div>
  )
}

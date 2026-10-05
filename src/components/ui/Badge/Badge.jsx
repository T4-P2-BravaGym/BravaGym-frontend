import cx from '@/utils/cx'
import { statusInfo } from '@/utils/status'
import styles from './Badge.module.scss'

/**
 * Badge
 * Status label. Each API status always has the same tone: pass `status`
 * ("confirmed", "paid", "waitlisted"…) and the label and tone come from utils/status.js.
 * Or pass `tone` and children for anything else ("+5,00 €", "La más elegida").
 * The text always names the state: color only helps.
 *
 * Props: status, tone ('success' | 'wait' | 'danger' | 'neutral' | 'brand' | 'solid'), onSurface, children
 */
export default function Badge({ status, tone, onSurface = false, className, children }) {
  const info = status ? statusInfo(status) : null
  const finalTone = tone ?? info?.tone ?? 'neutral'
  return (
    <span className={cx(styles.root, styles[finalTone], onSurface && styles.onSurface, className)}>
      {children ?? info?.label}
    </span>
  )
}

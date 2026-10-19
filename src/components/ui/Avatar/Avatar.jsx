import cx from '@/utils/cx'
import { initials } from '@/utils/format'
import styles from './Avatar.module.scss'

/**
 * Avatar
 * Initials in a circle for members and trainers, or their photo when there is one (T-291).
 * Decorative: the name is always written next to it, so screen readers skip it.
 *
 * Props: name, size ('sm' | 'md' | 'lg' | 'xl'), tone ('mauve' | 'champagne'), src (photo URL)
 */
export default function Avatar({ name, size = 'md', tone = 'mauve', src }) {
  if (src) {
    return <img className={cx(styles.root, styles.photo, styles[size])} src={src} alt="" />
  }
  return (
    <span className={cx(styles.root, styles[size], styles[tone])} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

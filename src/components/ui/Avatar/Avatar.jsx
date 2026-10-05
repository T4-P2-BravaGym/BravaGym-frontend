import cx from '@/utils/cx'
import { initials } from '@/utils/format'
import styles from './Avatar.module.scss'

/**
 * Avatar
 * Initials in a circle for members and trainers. Decorative: the name is always
 * written next to it, so screen readers skip it.
 *
 * Props: name, size ('sm' | 'md' | 'lg'), tone ('mauve' | 'champagne')
 */
export default function Avatar({ name, size = 'md', tone = 'mauve' }) {
  return (
    <span className={cx(styles.root, styles[size], styles[tone])} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

import cx from '@/utils/cx'
import styles from './Chip.module.scss'

/**
 * Chip
 * Filter button: day of the week, shop category, class type.
 * Group chips in an element with role="group" and an aria-label that says what is filtered.
 *
 * Props: selected, onClick, className, children, ...rest
 */
export default function Chip({ selected = false, onClick, className, children, ...rest }) {
  return (
    <button
      type="button"
      className={cx(styles.root, selected && styles.isSelected, className)}
      aria-pressed={selected}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  )
}

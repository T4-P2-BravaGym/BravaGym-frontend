import cx from '@/utils/cx'
import styles from './Card.module.scss'

/**
 * Card
 * Flat container (no shadow): it separates by background color, not by elevation.
 * default = surface-raised; tint = mauve-soft, for what needs attention (one per row at most);
 * dark = plum, to highlight a figure on a light page.
 *
 * Props: variant ('default' | 'tint' | 'dark'), eyebrow, title, titleAs, as, className, children
 */
export default function Card({ variant = 'default', eyebrow, title, titleAs: Title = 'h3', as: Tag = 'section', className, children }) {
  return (
    <Tag className={cx(styles.root, styles[variant], className)}>
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      {title && <Title className={styles.title}>{title}</Title>}
      {children}
    </Tag>
  )
}

import { Link } from 'react-router-dom'
import cx from '@/utils/cx'
import styles from './Button.module.scss'

/**
 * Button
 * Pill-shaped action. Variants: primary (the main action of the view, one per view),
 * secondary, dark, quiet (link-like) and danger (destructive, text only).
 * Renders a router <Link> with `to`, an <a> with `href`, otherwise a <button>.
 * A disabled button should say why in its text ("Ya no se puede cancelar").
 *
 * Props: variant, size ('md' | 'sm'), to, href, fullWidth, disabled, type, className, children, ...rest
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  fullWidth = false,
  disabled = false,
  type = 'button',
  className,
  children,
  ...rest
}) {
  const classes = cx(styles.root, styles[variant], size === 'sm' && styles.small, fullWidth && styles.fullWidth, className)

  // A disabled link is not a link: render it as a disabled button.
  if (to && !disabled) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }
  if (href && !disabled) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}

import styles from './Avatar.module.scss'

/**
 * Avatar
 * Iniciales en círculo para socias y entrenadoras.
 *
 * Props (proposal): name, size
 * Uses: — · Stories: HU-15 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function Avatar({ children, ...rest }) {
  return (
    <span className={styles.root} {...rest}>
      {children}
    </span>
  )
}

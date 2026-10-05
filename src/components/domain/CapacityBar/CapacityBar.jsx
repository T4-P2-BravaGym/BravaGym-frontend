import styles from './CapacityBar.module.scss'

/**
 * CapacityBar
 * Barra de aforo ocupado / total, verde con plazas y champán cuando está completa.
 *
 * Props (proposal): taken, capacity
 * Uses: — · Stories: HU-11 · Level: Básico
 * Design reference: Brava design system and the Claude Design canvas.
 *
 * TODO: implement. Styles only with design tokens (var(--…)); accessible markup.
 */
export default function CapacityBar({ children, ...rest }) {
  return (
    <div className={styles.root} {...rest}>
      {children}
    </div>
  )
}

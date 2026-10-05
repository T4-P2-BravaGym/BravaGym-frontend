import styles from './Spinner.module.scss'

/**
 * Spinner
 * Loading indicator while the API answers. The label is read by screen readers
 * and shown next to the spinner unless `hideLabel`.
 *
 * Props: label, hideLabel
 */
export default function Spinner({ label = 'Cargando…', hideLabel = false }) {
  return (
    <span className={styles.root} role="status">
      <span className={styles.circle} aria-hidden="true" />
      <span className={hideLabel ? styles.hiddenLabel : undefined}>{label}</span>
    </span>
  )
}

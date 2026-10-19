import styles from './EmptyState.module.scss'

/**
 * EmptyState
 * Friendly message when there is no data ("Aún no tienes rutina"),
 * with an optional action that tells what to do next.
 *
 * Props: title, text, action
 */
export default function EmptyState({ title, text, action }) {
  return (
    <div className={styles.root}>
      <p className={styles.title}>{title}</p>
      {text && <p className={styles.text}>{text}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}

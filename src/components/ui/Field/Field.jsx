import { useId } from 'react'
import cx from '@/utils/cx'
import styles from './Field.module.scss'

/**
 * Field
 * Form field: label on top, the control, then a hint or an error.
 * The control is linked to its label, hint and error (htmlFor, aria-describedby, aria-invalid).
 * Use `as="select"` with <option> children, or `as="textarea"`.
 * Errors say what happened and how to fix it, in Spanish (never "422").
 *
 * Props: label, as ('input' | 'select' | 'textarea'), hint, error, id, className, children, ...controlProps
 */
export default function Field({ label, as = 'input', hint, error, id, className, children, ...controlProps }) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const Control = as

  return (
    <div className={cx(styles.root, className)}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <Control
        id={fieldId}
        className={cx(styles.control, as === 'textarea' && styles.textarea)}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        {...controlProps}
      >
        {as === 'input' ? undefined : children}
      </Control>
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  )
}

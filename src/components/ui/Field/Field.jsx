import { useId, useState } from 'react'
import Icon from '@/components/ui/Icon'
import cx from '@/utils/cx'
import styles from './Field.module.scss'

/**
 * Field
 * Form field: label on top, the control, then a hint or an error.
 * The control is linked to its label, hint and error (htmlFor, aria-describedby, aria-invalid).
 * Use `as="select"` with <option> children, or `as="textarea"`.
 * `revealable` on a `type="password"` input adds an eye button to show or hide what she types.
 * Errors say what happened and how to fix it, in Spanish (never "422").
 *
 * Props: label, as ('input' | 'select' | 'textarea'), hint, error, id, className, revealable, children, ...controlProps
 */
export default function Field({ label, as = 'input', hint, error, id, className, revealable = false, type, children, ...controlProps }) {
  const autoId = useId()
  const [revealed, setRevealed] = useState(false)
  const canReveal = revealable && as === 'input' && type === 'password'
  const fieldId = id ?? autoId
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const Control = as

  const control = (
    <Control
      id={fieldId}
      type={canReveal && revealed ? 'text' : type}
      className={cx(styles.control, as === 'textarea' && styles.textarea, canReveal && styles.withReveal)}
      aria-invalid={error ? true : undefined}
      aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      {...controlProps}
    >
      {as === 'input' ? undefined : children}
    </Control>
  )

  return (
    <div className={cx(styles.root, className)}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      {canReveal ? (
        // Only password fields get the wrapper, so every other Field keeps the same markup
        <div className={styles.controlWrap}>
          {control}
          <button
            type="button"
            className={styles.reveal}
            aria-label="Mostrar contraseña"
            aria-pressed={revealed}
            onClick={() => setRevealed((value) => !value)}
            disabled={controlProps.disabled}
          >
            <Icon name={revealed ? 'eyeOff' : 'eye'} />
          </button>
        </div>
      ) : (
        control
      )}
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

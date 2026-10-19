import { useEffect, useId, useRef } from 'react'
import Button from '@/components/ui/Button'
import styles from './Modal.module.scss'

/**
 * Modal
 * Confirmation dialog built on the native <dialog>: the browser traps the focus,
 * Escape closes it and focus returns to the button that opened it.
 * Use it before actions that cannot be undone: cancel a booking, approve a cancellation.
 *
 * Props: open, title, description, confirmLabel, cancelLabel, tone ('default' | 'danger'),
 *        busy, onConfirm, onClose, children
 */
export default function Modal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Volver',
  tone = 'default',
  busy = false,
  onConfirm,
  onClose,
  children,
}) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Escape fires "cancel": tell the parent so `open` stays in sync.
  function handleCancel(event) {
    event.preventDefault()
    if (!busy) onClose?.()
  }

  // A click on the backdrop (the dialog itself, outside its content) closes it.
  function handleClick(event) {
    if (event.target === dialogRef.current && !busy) onClose?.()
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.root}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      <div className={styles.content}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        )}
        {children}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          {onConfirm && (
            <Button variant={tone === 'danger' ? 'dark' : 'primary'} onClick={onConfirm} disabled={busy}>
              {busy ? 'Un momento…' : confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </dialog>
  )
}

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import styles from './DiscountCodeInput.module.scss'

/**
 * DiscountCodeInput
 * Field to apply a discount code (RN-14). `onApply(code)` calls the API's validate
 * endpoint and resolves { code, percent_off }, or throws an error whose message
 * (the API's detail, in Spanish) is shown under the field.
 *
 * Props: applied ({ code, percent_off } | null), onApply(code), onRemove()
 */
export default function DiscountCodeInput({ applied = null, onApply, onRemove }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const clean = code.trim().toUpperCase()
    if (!clean) {
      setError('Escribe un código.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await onApply?.(clean)
      setCode('')
    } catch (err) {
      setError(err?.detail ?? err?.message ?? 'No se ha podido aplicar el código.')
    } finally {
      setBusy(false)
    }
  }

  if (applied) {
    return (
      <div className={styles.applied} role="status">
        <span>
          Código <strong>{applied.code}</strong> aplicado: −{applied.percent_off} %
        </span>
        <Button variant="quiet" size="sm" onClick={onRemove}>
          Quitar
        </Button>
      </div>
    )
  }

  return (
    <form className={styles.root} onSubmit={handleSubmit} noValidate>
      <Field
        className={styles.field}
        label="Código de descuento"
        value={code}
        maxLength={32}
        autoComplete="off"
        placeholder="Ej. BRAVA10"
        onChange={(e) => {
          setCode(e.target.value)
          if (error) setError('')
        }}
        error={error}
      />
      <Button type="submit" variant="secondary" disabled={busy} className={styles.button}>
        {busy ? 'Comprobando…' : 'Aplicar'}
      </Button>
    </form>
  )
}

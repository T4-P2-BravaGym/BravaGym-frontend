import { useId, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import styles from './AdminDiscountCodes.module.scss'

const EMPTY_FORM = { code: '', percent_off: '', valid_from: '', valid_until: '', max_uses: '' }

/**
 * Form to create a discount code. The API checks everything (percent 1-100, dates in order,
 * repeated code) and its message is shown in `error`.
 */
export default function DiscountCodeForm({ busy = false, error, onSubmit }) {
  const headingId = useId()
  const [form, setForm] = useState(EMPTY_FORM)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const created = await onSubmit({
      code: form.code,
      percent_off: Number(form.percent_off),
      valid_from: form.valid_from,
      valid_until: form.valid_until,
      max_uses: form.max_uses === '' ? null : Number(form.max_uses),
    })
    if (created) setForm(EMPTY_FORM)
  }

  return (
    <section className={styles.formSection} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.sectionTitle}>
        Nuevo código
      </h2>

      {error && (
        <Alert tone="error" title={error.title}>
          {error.text}
        </Alert>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.formGrid}>
          <Field label="Código" name="code" placeholder="BRAVA20" hint="Se guarda en mayúsculas" value={form.code} onChange={handleChange} disabled={busy} />
          <Field label="% de descuento" name="percent_off" type="number" inputMode="numeric" placeholder="20" hint="Entre 1 y 100" value={form.percent_off} onChange={handleChange} disabled={busy} />
          <Field label="Válido desde" name="valid_from" type="date" value={form.valid_from} onChange={handleChange} disabled={busy} />
          <Field label="Válido hasta" name="valid_until" type="date" value={form.valid_until} onChange={handleChange} disabled={busy} />
          <Field label="Usos máximos (opcional)" name="max_uses" type="number" inputMode="numeric" hint="Vacío = sin límite" value={form.max_uses} onChange={handleChange} disabled={busy} />
        </div>
        <div className={styles.actions}>
          <Button type="submit" disabled={busy}>
            {busy ? 'Creando…' : 'Crear código'}
          </Button>
        </div>
      </form>
      <p className={styles.note}>Los códigos valen para cuotas, clases adicionales y pedidos de la tienda.</p>
    </section>
  )
}

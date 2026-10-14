import { useId, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import { ROLE_LABELS } from '@/routes/navigation'
import styles from './AdminUsers.module.scss'

/**
 * One user's card above the table (HU-31): her data ("Ver") or a form to edit it ("Editar").
 * It never calls the API: the page passes onSave and handles the answer.
 */
export default function UserPanel({ user, mode, canEdit, busy = false, error, onEdit, onSave, onClose }) {
  const headingId = useId()
  const [form, setForm] = useState(() => ({
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone ?? '',
    email: user.email,
  }))

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSave({ ...form, phone: form.phone.trim() || null })
  }

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.panelTitle}>
        {mode === 'edit' ? `Editar a ${user.first_name}` : `${user.first_name} ${user.last_name}`}
      </h2>

      {error && (
        <Alert tone="error" title={error.title}>
          {error.text}
        </Alert>
      )}

      {mode === 'view' ? (
        <>
          <dl className={styles.details}>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Teléfono</dt>
            <dd>{user.phone ?? '—'}</dd>
            <dt>Rol</dt>
            <dd>{ROLE_LABELS[user.role] ?? user.role}</dd>
            <dt>Estado</dt>
            <dd>{user.is_active ? <Badge status="active" /> : <Badge tone="neutral">Desactivada</Badge>}</dd>
          </dl>
          <div className={styles.panelActions}>
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
            {canEdit && <Button onClick={onEdit}>Editar</Button>}
          </div>
        </>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGrid}>
            <Field label="Nombre" name="first_name" value={form.first_name} onChange={handleChange} disabled={busy} />
            <Field label="Apellidos" name="last_name" value={form.last_name} onChange={handleChange} disabled={busy} />
            <Field label="Teléfono" name="phone" type="tel" hint="Opcional" value={form.phone} onChange={handleChange} disabled={busy} />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} disabled={busy} />
          </div>
          <div className={styles.panelActions}>
            <Button variant="secondary" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}

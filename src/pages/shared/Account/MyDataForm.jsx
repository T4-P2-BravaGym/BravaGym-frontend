/**
 * Mis datos (HU-04): name, surname, phone and email of the logged-in user, any role (#101).
 * Used by "Mi perfil" (member and trainer) and "Mi cuenta" (admin).
 */
import { useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Spinner from '@/components/ui/Spinner'
import { getMe } from '@/services/auth'
import { updateMe } from '@/services/users'
import styles from './Account.module.scss'

const EMPTY_FORM = { first_name: '', last_name: '', phone: '', email: '' }

// The API sends null for an empty phone; inputs need a string
function toForm(user) {
  return {
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone ?? '',
    email: user.email,
  }
}

export default function MyDataForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getMe()
      .then((user) => setForm(toForm(user)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
    setSaved(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSaved(false)
    setIsSaving(true)
    try {
      const user = await updateMe({ ...form, phone: form.phone.trim() || null })
      setForm(toForm(user))
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.subtitle}>Mis datos</h2>

      {loading && <Spinner />}

      {error && <Alert tone="error">{error}</Alert>}

      {saved && <Alert tone="success">Tus datos se han guardado.</Alert>}

      {!loading && (
        <>
          <Field label="Nombre" name="first_name" autoComplete="given-name" value={form.first_name} onChange={handleChange} />
          <Field label="Apellidos" name="last_name" autoComplete="family-name" value={form.last_name} onChange={handleChange} />
          <Field label="Teléfono" name="phone" type="tel" autoComplete="tel" hint="Opcional" value={form.phone} onChange={handleChange} />
          <Field label="Email" name="email" type="email" autoComplete="email" hint="Es el email con el que entras en Brava" value={form.email} onChange={handleChange} />
          <div className={styles.actions}>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </>
      )}
    </form>
  )
}
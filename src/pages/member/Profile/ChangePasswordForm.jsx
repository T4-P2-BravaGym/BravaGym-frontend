/**
 * Cambiar contraseña (HU-32): the second card of "Mi perfil".
 * "Repite la nueva" is only checked here; the API gets the current and the new password.
 */
import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import { changeMyPassword } from '@/services/users'
import styles from './Profile.module.scss'

const EMPTY_FORM = { current_password: '', new_password: '', repeat_password: '' }
const MIN_LENGTH = 8

// Same rules as the API, checked first so she gets a clear message instead of a generic 422
function validate(form) {
  if (!form.current_password) return 'Escribe tu contraseña actual.'
  if (form.new_password.length < MIN_LENGTH) return `La contraseña nueva tiene que tener al menos ${MIN_LENGTH} caracteres.`
  if (form.new_password === form.current_password) return 'La contraseña nueva tiene que ser distinta de la actual.'
  if (form.new_password !== form.repeat_password) return 'Las contraseñas nuevas no coinciden.'
  return null
}

export default function ChangePasswordForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
    setSaved(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaved(false)
    const problem = validate(form)
    setError(problem)
    if (problem) return

    setIsSaving(true)
    try {
      await changeMyPassword(form.current_password, form.new_password)
      setForm(EMPTY_FORM) // never keep passwords on screen
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.subtitle}>Cambiar contraseña</h2>

      {error && <Alert tone="error">{error}</Alert>}

      {saved && <Alert tone="success">Tu contraseña se ha cambiado.</Alert>}

      <Field label="Contraseña actual" name="current_password" type="password" autoComplete="current-password" value={form.current_password} onChange={handleChange} disabled={isSaving} />
      <Field label="Contraseña nueva" name="new_password" type="password" autoComplete="new-password" hint={`Mínimo ${MIN_LENGTH} caracteres`} value={form.new_password} onChange={handleChange} disabled={isSaving} />
      <Field label="Repite la contraseña nueva" name="repeat_password" type="password" autoComplete="new-password" value={form.repeat_password} onChange={handleChange} disabled={isSaving} />
      <div className={styles.actions}>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Guardando…' : 'Cambiar contraseña'}
        </Button>
      </div>
    </form>
  )
}


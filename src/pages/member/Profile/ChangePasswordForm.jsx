/**
 * Cambiar contraseña (HU-32): the second card of "Mi perfil".
 * "Repite la nueva" is only checked here; the API gets the current and the new password.
 * After a change the API closes every session, this one too, so she goes to the login.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import useAuth from '@/hooks/useAuth'
import { PATHS } from '@/routes/paths'
import { changeMyPassword } from '@/services/users'
import styles from './Profile.module.scss'

const EMPTY_FORM = { current_password: '', new_password: '', repeat_password: '' }
const MIN_LENGTH = 8
const PASSWORD_CHANGED = 'Tu contraseña se ha cambiado. Vuelve a entrar con la nueva.'

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
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const problem = validate(form)
    setError(problem)
    if (problem) return

    setIsSaving(true)
    try {
      await changeMyPassword(form.current_password, form.new_password)
    } catch (err) {
      setError(err.message)
      setIsSaving(false)
      return
    }
    // HU-32: every session is closed, so she logs in again with the new password
    logout()
    navigate(PATHS.login, { replace: true, state: { notice: PASSWORD_CHANGED } })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.subtitle}>Cambiar contraseña</h2>

      {error && <Alert tone="error">{error}</Alert>}

      <Field label="Contraseña actual" name="current_password" type="password" revealable autoComplete="current-password" value={form.current_password} onChange={handleChange} disabled={isSaving} />
      <Field label="Contraseña nueva" name="new_password" type="password" revealable autoComplete="new-password" hint={`Mínimo ${MIN_LENGTH} caracteres`} value={form.new_password} onChange={handleChange} disabled={isSaving} />
      <Field label="Repite la contraseña nueva" name="repeat_password" type="password" revealable autoComplete="new-password" value={form.repeat_password} onChange={handleChange} disabled={isSaving} />
      <div className={styles.actions}>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Guardando…' : 'Cambiar contraseña'}
        </Button>
      </div>
    </form>
  )
}


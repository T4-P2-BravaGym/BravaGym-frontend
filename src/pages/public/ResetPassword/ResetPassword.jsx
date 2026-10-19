/** Reset secrets live only in component memory; the fragment is removed on mount. */
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import useAuth from '@/hooks/useAuth'
import { confirmPasswordReset } from '@/services/auth'
import { PATHS } from '@/routes/paths'
import styles from '../PasswordRecovery.module.scss'

function initialToken() {
  const value = new URLSearchParams(window.location.hash.slice(1)).get('token') ?? ''
  return value.length <= 256 ? value : ''
}

function validate(password, repeated) {
  if (Array.from(password).length < 8) return 'La contraseña necesita al menos 8 caracteres.'
  if (new TextEncoder().encode(password).length > 72) return 'La contraseña puede ocupar como máximo 72 bytes UTF-8.'
  if (password !== repeated) return 'Las contraseñas no coinciden.'
  return null
}

export default function ResetPassword() {
  const auth = useAuth()
  const [token, setToken] = useState(initialToken)
  const [password, setPassword] = useState('')
  const [repeated, setRepeated] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const busy = useRef(false)

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1))
    if (fragment.has('token')) {
      fragment.delete('token')
      const remaining = fragment.toString()
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${remaining ? `#${remaining}` : ''}`)
    }
  }, [])

  async function submit(event) {
    event.preventDefault()
    if (busy.current) return
    const problem = validate(password, repeated)
    setError(problem)
    if (problem || !token) return
    busy.current = true
    setSaving(true)
    try {
      await confirmPasswordReset(token, password)
      setPassword('')
      setRepeated('')
      setToken('')
      setSaved(true)
      auth?.clearSession()
    } catch (failure) {
      setError(failure.detail ?? failure.message ?? 'No se ha podido conectar. Inténtalo de nuevo.')
      if (failure.status === 400) {
        setToken('')
        setPassword('')
        setRepeated('')
      }
    } finally {
      busy.current = false
      setSaving(false)
    }
  }

  return (
    <div className={styles.root}>
      <Card eyebrow="Recupera tu acceso" title="Nueva contraseña" titleAs="h1" className={styles.panel}>
        {saved ? (
          <>
            <Alert tone="success">Tu contraseña se ha cambiado. Inicia sesión con la nueva contraseña.</Alert>
            <Link className={styles.link} to={PATHS.login}>Ir a iniciar sesión</Link>
          </>
        ) : !token ? (
          <>
            <Alert tone="error">{error ?? 'Solicita un nuevo enlace para elegir tu contraseña.'}</Alert>
            <Link className={styles.link} to={PATHS.forgotPassword}>Solicitar otro enlace</Link>
          </>
        ) : (
          <>
            <p className={styles.lead}>Elige una contraseña nueva. Al guardarla se cerrarán las sesiones de tus otros dispositivos.</p>
            {error && <Alert tone="error">{error}</Alert>}
            <form className={styles.form} onSubmit={submit} noValidate>
              <Field label="Nueva contraseña" name="new_password" type="password" revealable autoComplete="new-password" hint="Mínimo 8 caracteres" value={password} onChange={(event) => setPassword(event.target.value)} disabled={saving} />
              <Field label="Repite la nueva contraseña" name="repeat_password" type="password" revealable autoComplete="new-password" value={repeated} onChange={(event) => setRepeated(event.target.value)} disabled={saving} />
              <Button type="submit" fullWidth disabled={saving}>{saving ? 'Guardando…' : 'Guardar contraseña'}</Button>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}

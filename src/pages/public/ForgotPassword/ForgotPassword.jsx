/** Public recovery request; the same confirmation is shown for every email. */
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { requestPasswordReset } from '@/services/auth'
import { PATHS } from '@/routes/paths'
import styles from '../PasswordRecovery.module.scss'

const ACCEPTED = 'Si existe una cuenta activa con ese email, recibirás un enlace para recuperar tu contraseña.'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const busy = useRef(false)

  async function submit(event) {
    event.preventDefault()
    if (busy.current) return
    setError(null)
    const normalized = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.length > 255) {
      setError('Escribe un email válido, por ejemplo ana@correo.com.')
      return
    }
    busy.current = true
    setIsSending(true)
    try {
      await requestPasswordReset(normalized)
      setEmail('')
      setSent(true)
    } catch (failure) {
      setError(failure.detail ?? failure.message ?? 'No se ha podido conectar. Inténtalo de nuevo.')
    } finally {
      busy.current = false
      setIsSending(false)
    }
  }

  return (
    <div className={styles.root}>
      <Card eyebrow="Recupera tu acceso" title="He olvidado mi contraseña" titleAs="h1" className={styles.panel}>
        <p className={styles.lead}>Escribe el email de tu cuenta para solicitar un enlace de recuperación.</p>
        {error && <Alert tone="error">{error}</Alert>}
        {sent ? <Alert tone="success">{ACCEPTED}</Alert> : (
          <form className={styles.form} onSubmit={submit} noValidate>
            <Field label="Email" type="email" name="email" autoComplete="email" maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} disabled={isSending} />
            <Button type="submit" fullWidth disabled={isSending}>{isSending ? 'Enviando…' : 'Enviar enlace'}</Button>
          </form>
        )}
        <Link className={styles.link} to={PATHS.login}>Volver a iniciar sesión</Link>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import useAuth from '@/hooks/useAuth'
import { areaFor, NAVIGATION } from '@/routes/navigation'
import { PATHS } from '@/routes/paths'
import styles from './Login.module.scss'

const FALLBACK_ERROR = 'No se ha podido iniciar sesión. Inténtalo de nuevo.'

function homeFor(role) {
  return NAVIGATION[areaFor(role)].items[0].to
}

function safeRedirect(path) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? path : null
}

export default function Login() {
  const { isAuthenticated, role, login } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={safeRedirect(location.state?.from) ?? homeFor(role)} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (apiError) {
      setError(apiError.detail ?? FALLBACK_ERROR)
      setIsSubmitting(false)
    }
  }

  return (
      <div className={styles.root}>
        <section className={styles.panel} aria-labelledby="login-title">
          <header>
            <span className={styles.eyebrow}>Bienvenida de nuevo</span>
            <h1 id="login-title" className={styles.title}>
              Entra en tu cuenta
            </h1>
            <p className={styles.lead}>Reserva tus clases, consulta tu rutina y gestiona tus pagos.</p>
          </header>

          {error && <Alert tone="error">{error}</Alert>}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Field
                label="Email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
            />
            <Field
                label="Contraseña"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />
            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <p className={styles.footer}>
            ¿Aún no tienes cuenta?{' '}
            <Link to={PATHS.register} className={styles.link}>
              Crea tu cuenta
            </Link>
          </p>
        </section>
      </div>
  )
}
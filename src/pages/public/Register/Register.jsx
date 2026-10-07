import { useState } from 'react'
import Field from '@/components/ui/Field'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'
import { register } from '@/services/auth'
import { PATHS } from '@/routes/paths'
import { validateRegister } from './validation'
import styles from './Register.module.scss'

const INITIAL_VALUES = { first_name: '', last_name: '', email: '', phone: '', password: '' }

function toPayload(values) {
  return {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    email: values.email.trim(),
    password: values.password,
    phone: values.phone.trim() || null,
  }
}

function getErrorMessage(error) {
  if (error.status === 409) return 'Ya hay una cuenta con este email. Prueba a entrar.'
  return error.detail
}

export default function Register() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const foundErrors = validateRegister(values)
    setErrors(foundErrors)
    if (Object.keys(foundErrors).length > 0) return 

    setIsSubmitting(true)
    setApiError(null)
    try {
      await register(toPayload(values))
      setIsDone(true)
    } catch (error) {
      setApiError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isDone) {
    return (
      <div className={styles.root}>
        <Alert tone="success" title="Tu cuenta está lista">
          Ya puedes entrar con tu email y tu contraseña.
        </Alert>
        <Button to={PATHS.login} fullWidth>
          Entrar
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <span className={styles.eyebrow}>Únete a Brava</span>
      <h1 className={styles.title}>Crear cuenta</h1>

      <Card>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {apiError && (
            <Alert tone="error" onClose={() => setApiError(null)}>
              {apiError}
            </Alert>
          )}

          <div className={styles.row}>
            <Field
              label="Nombre"
              name="first_name"
              autoComplete="given-name"
              value={values.first_name}
              onChange={handleChange}
              error={errors.first_name}
            />
            <Field
              label="Apellidos"
              name="last_name"
              autoComplete="family-name"
              value={values.last_name}
              onChange={handleChange}
              error={errors.last_name}
            />
          </div>

          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />

          <Field
            label="Teléfono (opcional)"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={handleChange}
            error={errors.phone}
          />

          <Field
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="new-password"
            hint="Mínimo 8 caracteres."
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Creando tu cuenta…' : 'Crear cuenta'}
          </Button>
        </form>
      </Card>

      <p className={styles.footer}>
        ¿Ya tienes cuenta?{' '}
        <Button to={PATHS.login} variant="quiet" size="sm">
          Entrar
        </Button>
      </p>
    </div>
  )
}
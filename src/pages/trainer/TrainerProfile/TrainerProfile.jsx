/**
 * Mi perfil público (HU-15): the trainer changes the specialty and bio that visitors see.
 */
import { useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Spinner from '@/components/ui/Spinner'
import useAuth from '@/hooks/useAuth'
import { listTrainers, updateMyTrainerProfile } from '@/services/trainers'
import styles from './TrainerProfile.module.scss'

const EMPTY_FORM = { specialty: '', bio: '' }

export default function TrainerProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  // There is no GET /trainers/me: the public list already has her card, so we pick it by id
  useEffect(() => {
    if (!user?.id) return
    listTrainers()
      .then((trainers) => {
        const mine = trainers.find((item) => item.id === user.id)
        if (mine) setForm({ specialty: mine.specialty ?? '', bio: mine.bio ?? '' })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user?.id])

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
      const updated = await updateMyTrainerProfile({
        specialty: form.specialty.trim() || null,
        bio: form.bio.trim() || null,
      })
      setForm({ specialty: updated.specialty ?? '', bio: updated.bio ?? '' })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ')

  return (
    <section className={styles.root}>
      {loading && <Spinner />}

      {error && <Alert tone="error">{error}</Alert>}

      {saved && <Alert tone="success">Tu perfil se ha guardado. Así lo verán las socias.</Alert>}

      {!loading && (
        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          <Avatar name={fullName} size="lg" />
          <div className={styles.fields}>
            <h1 className={styles.title}>Mi perfil público</h1>
            <Field
              label="Especialidad"
              name="specialty"
              maxLength={120}
              value={form.specialty}
              onChange={handleChange}
              disabled={isSaving}
            />
            <Field
              label="Bio"
              name="bio"
              as="textarea"
              rows={2}
              maxLength={1000}
              value={form.bio}
              onChange={handleChange}
              disabled={isSaving}
            />
          </div>
          <Button type="submit" variant="dark" className={styles.save} disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Guardar perfil'}
          </Button>
        </form>
      )}
    </section>
  )
}



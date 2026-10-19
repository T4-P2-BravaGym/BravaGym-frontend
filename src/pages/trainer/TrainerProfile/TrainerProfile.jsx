/**
 * Mi perfil público (HU-15): the trainer changes the specialty and bio that visitors see,
 * and her photo (T-291). The photo is uploaded as soon as she picks it.
 */
import { useEffect, useRef, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Spinner from '@/components/ui/Spinner'
import useAuth from '@/hooks/useAuth'
import { mediaUrl } from '@/services/api'
import {
  deleteMyTrainerPhoto,
  listTrainers,
  updateMyTrainerProfile,
  uploadMyTrainerPhoto,
} from '@/services/trainers'
import styles from './TrainerProfile.module.scss'

const EMPTY_FORM = { specialty: '', bio: '' }
// Only filters the file picker; the API checks the real type (HU-30, T-291)
const PHOTO_TYPES = 'image/jpeg,image/png,image/webp'

export default function TrainerProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoNotice, setPhotoNotice] = useState(null)
  const fileInputRef = useRef(null)

  // There is no GET /trainers/me: the public list already has her card, so we pick it by id
  useEffect(() => {
    if (!user?.id) return
    listTrainers()
      .then((trainers) => {
        const mine = trainers.find((item) => item.id === user.id)
        if (mine) {
          setForm({ specialty: mine.specialty ?? '', bio: mine.bio ?? '' })
          setPhotoUrl(mine.photo_url)
        }
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

  async function changePhoto(action, notice) {
    setError(null)
    setPhotoNotice(null)
    setPhotoBusy(true)
    try {
      const updated = await action()
      setPhotoUrl(updated.photo_url)
      setPhotoNotice(notice)
    } catch (err) {
      setError(err.message)
    } finally {
      setPhotoBusy(false)
    }
  }

  function choosePhoto(event) {
    const file = event.target.files?.[0]
    event.target.value = '' // so the same file can be chosen again
    if (file) changePhoto(() => uploadMyTrainerPhoto(file), 'Tu foto se ha guardado.')
  }

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ')

  return (
    <section className={styles.root}>
      {loading && <Spinner />}

      {error && <Alert tone="error">{error}</Alert>}

      {saved && <Alert tone="success">Tu perfil se ha guardado. Así lo verán las socias.</Alert>}

      {photoNotice && <Alert tone="success">{photoNotice}</Alert>}

      {!loading && (
        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          <div className={styles.photo}>
            <Avatar name={fullName} size="lg" src={mediaUrl(photoUrl)} />
            <input
              ref={fileInputRef}
              type="file"
              accept={PHOTO_TYPES}
              className={styles.fileInput}
              onChange={choosePhoto}
              tabIndex={-1}
              aria-hidden="true"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoBusy}
            >
              {photoBusy ? 'Subiendo…' : photoUrl ? 'Cambiar foto' : 'Subir foto'}
            </Button>
            {photoUrl && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => changePhoto(deleteMyTrainerPhoto, 'Se ha quitado tu foto.')}
                disabled={photoBusy}
              >
                Quitar foto
              </Button>
            )}
            <span className={styles.hint}>JPEG, PNG o WebP, hasta 2 MB</span>
          </div>
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



import { useCallback, useEffect, useState } from 'react'
import WeekNav from '@/components/domain/WeekNav'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Field from '@/components/ui/Field'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import useAuth from '@/hooks/useAuth'
import { ApiError } from '@/services/api'
import {
  cancelSession,
  createPersonalTrainingSlot,
  isPersonalTrainingSession,
  listSessionsAll,
  toSessionCard,
} from '@/services/sessions'
import { formatDate, formatDateTime, formatTimeRange, madridInputToUtcIso } from '@/utils/format'
import { getWeekRange } from '@/utils/week'
import styles from './TrainerSlots.module.scss'

const LOAD_SLOTS_ERROR = 'No se han podido cargar tus franjas. Inténtalo de nuevo.'
const OVERLAP_ERROR = 'Esta franja se solapa con otra de tus sesiones. Elige otra hora.'
const NO_PT_TYPE_ERROR = 'No hay un tipo de clase de entrenamiento personal activo. Avisa a administración.'
const GENERIC_SAVE_ERROR = 'No se ha podido abrir la franja. Inténtalo de nuevo.'
const GENERIC_CANCEL_ERROR = 'No se ha podido cancelar la franja. Inténtalo de nuevo.'
const REQUIRED_FIELDS = 'Elige la fecha y la hora de inicio.'

/**
 * Franjas de entrenamiento personal (HU-14)
 * The trainer opens one-hour, one-person slots; members book them from their area.
 */
export default function TrainerSlots() {
  const { user } = useAuth()
  const trainerId = user?.role === 'trainer' ? user.id : undefined

  const [weekAnchor, setWeekAnchor] = useState(() => new Date())
  const [slots, setSlots] = useState(null)
  const [slotsError, setSlotsError] = useState(null)
  const [flash, setFlash] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [startsAtLocal, setStartsAtLocal] = useState('')
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)

  const loadSlots = useCallback(
      (signal) => {
        const { from, to } = getWeekRange(weekAnchor)
        return listSessionsAll({ from, to, trainer_id: trainerId, signal })
            .then((data) => {
              const items = Array.isArray(data) ? data : (data?.items ?? [])
              const personalOnly = items
                  .filter(isPersonalTrainingSession)
                  .map(toSessionCard)
                  .sort((a, b) => String(a.starts_at).localeCompare(String(b.starts_at)))
              setSlots(personalOnly)
              setSlotsError(null)
            })
            .catch((apiError) => {
              if (apiError.name === 'AbortError') return
              setSlotsError(apiError.detail ?? LOAD_SLOTS_ERROR)
              setSlots([])
            })
      },
      [weekAnchor, trainerId],
  )

  useEffect(() => {
    const controller = new AbortController()
    setSlots(null)
    setSlotsError(null)
    loadSlots(controller.signal)
    return () => controller.abort()
  }, [loadSlots])

  const loadingSlots = slots === null && !slotsError

  function openForm() {
    setFormOpen(true)
    setStartsAtLocal('')
    setFormError(null)
    setActionError(null)
    setFlash(null)
  }

  function closeForm() {
    setFormOpen(false)
    setStartsAtLocal('')
    setFormError(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError(null)
    setActionError(null)
    setFlash(null)

    const startsAt = madridInputToUtcIso(startsAtLocal)
    if (!startsAt) {
      setFormError(REQUIRED_FIELDS)
      return
    }

    setBusy(true)
    try {
      await createPersonalTrainingSlot({ starts_at: startsAt })
      setFlash('Franja abierta. Ya aparece libre para las socias con entrenamiento personal.')
      closeForm()
      await loadSlots()
    } catch (error) {
      setActionError(saveErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirmCancel() {
    if (!cancelTarget?.id) return
    setBusy(true)
    setActionError(null)
    setFlash(null)
    try {
      await cancelSession(cancelTarget.id)
      setFlash('Franja cancelada. Si estaba reservada, la reserva pasa a cancelada.')
      setCancelTarget(null)
      await loadSlots()
    } catch (error) {
      setActionError(cancelErrorMessage(error))
      setCancelTarget(null)
    } finally {
      setBusy(false)
    }
  }

  const open = (slots ?? []).filter((slot) => slot.status !== 'cancelled')
  const cancelled = (slots ?? []).filter((slot) => slot.status === 'cancelled')

  return (
      <div className={styles.root}>
        <PageHeader
            eyebrow="Panel de entrenadora"
            title="Entrenamiento personal"
            lead="Abre franjas de una hora para entrenar a solas con una socia. Solo pueden reservarlas las socias cuyo plan incluye entrenamiento personal."
            action={
              <Button variant="primary" onClick={openForm} disabled={formOpen}>
                Abrir franja
              </Button>
            }
        />

        {flash && (
            <Alert tone="success" onClose={() => setFlash(null)}>
              {flash}
            </Alert>
        )}
        {actionError && (
            <Alert tone="error" title={actionError.title} onClose={() => setActionError(null)}>
              {actionError.text}
            </Alert>
        )}

        {formOpen && (
            <section className={styles.formSection} aria-labelledby="slot-form-heading">
              <div className={styles.sectionIntro}>
                <h2 id="slot-form-heading" className={styles.sectionTitle}>
                  Nueva franja
                </h2>
                <p className={styles.sectionLead}>
                  Dura 60 minutos y es para una sola socia. La hora se guarda en el horario de Madrid.
                </p>
              </div>

              {formError && <Alert tone="error">{formError}</Alert>}

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <Field
                    label="Fecha y hora de inicio"
                    type="datetime-local"
                    name="starts_at_local"
                    value={startsAtLocal}
                    onChange={(event) => setStartsAtLocal(event.target.value)}
                    hint="Horario de Madrid"
                    disabled={busy}
                    required
                />

                <div className={styles.formActions}>
                  <Button type="button" variant="secondary" onClick={closeForm} disabled={busy}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" disabled={busy}>
                    {busy ? 'Guardando…' : 'Abrir franja'}
                  </Button>
                </div>
              </form>
            </section>
        )}

        <section className={styles.section} aria-labelledby="slots-week-heading">
          <div className={styles.sectionHead}>
            <h2 id="slots-week-heading" className={styles.sectionTitle}>
              Semana
            </h2>
            <WeekNav anchor={weekAnchor} onChange={setWeekAnchor} />
          </div>

          {slotsError && <Alert tone="error">{slotsError}</Alert>}
          {loadingSlots && <Spinner label="Cargando tus franjas…" />}

          {!loadingSlots && !slotsError && open.length === 0 && cancelled.length === 0 && (
              <EmptyState
                  title="No tienes franjas esta semana"
                  text="Abre una franja para que tus socias puedan reservar entrenamiento personal contigo."
                  action={
                      !formOpen && (
                          <Button variant="primary" onClick={openForm}>
                            Abrir franja
                          </Button>
                      )
                  }
              />
          )}

          {open.length > 0 && (
              <ul className={styles.list}>
                {open.map((slot) => (
                    <SlotRow
                        key={slot.id}
                        slot={slot}
                        busy={busy}
                        onCancel={() => setCancelTarget(slot)}
                    />
                ))}
              </ul>
          )}

          {cancelled.length > 0 && (
              <div className={styles.cancelledBlock}>
                <h3 className={styles.cancelledTitle}>Canceladas esta semana</h3>
                <ul className={styles.list}>
                  {cancelled.map((slot) => (
                      <SlotRow key={slot.id} slot={slot} busy={busy} />
                  ))}
                </ul>
              </div>
          )}
        </section>

        <Modal
            open={Boolean(cancelTarget)}
            title="¿Cancelar esta franja?"
            description={
              cancelTarget
                  ? `Vas a cancelar la franja del ${formatDateTime(cancelTarget.starts_at)}.${
                      isBooked(cancelTarget) ? ' Está reservada: la reserva de la socia pasará a cancelada.' : ''
                  }`
                  : undefined
            }
            confirmLabel="Cancelar franja"
            cancelLabel="Volver"
            tone="danger"
            busy={busy}
            onConfirm={handleConfirmCancel}
            onClose={() => {
              if (!busy) setCancelTarget(null)
            }}
        />
      </div>
  )
}

function SlotRow({ slot, busy, onCancel }) {
  const isCancelled = slot.status === 'cancelled'
  const booked = isBooked(slot)

  return (
      <li className={styles.item}>
        <div className={styles.itemMain}>
          <p className={styles.itemName}>{formatDate(slot.starts_at)}</p>
          <p className={styles.itemMeta}>
            {formatTimeRange(slot.starts_at, slot.ends_at)}
            {slot.duration_minutes ? ` · ${slot.duration_minutes} min` : ''}
          </p>
        </div>
        <div className={styles.itemAside}>
          {isCancelled ? (
              <Badge status="cancelled" />
          ) : (
              <Badge tone={booked ? 'brand' : 'success'}>{booked ? 'Reservada' : 'Libre'}</Badge>
          )}
          {!isCancelled && onCancel && (
              <Button variant="secondary" size="sm" disabled={busy} onClick={onCancel}>
                Cancelar
              </Button>
          )}
        </div>
      </li>
  )
}

/** A personal-training slot has capacity 1, so no free spots means a member booked it. */
function isBooked(slot) {
  return typeof slot.free_spots === 'number' && slot.free_spots === 0
}

function saveErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return { title: 'Error', text: GENERIC_SAVE_ERROR }
  }
  if (error.status === 404) {
    return { title: 'Falta configuración', text: error.detail || NO_PT_TYPE_ERROR }
  }
  if (error.status === 409) {
    return { title: 'Horario ocupado', text: error.detail || OVERLAP_ERROR }
  }
  if (error.status === 422) {
    return {
      title: 'Datos no válidos',
      text: error.detail || 'Revisa la fecha y la hora e inténtalo de nuevo.',
    }
  }
  return { title: 'No se pudo guardar', text: error.detail || GENERIC_SAVE_ERROR }
}

function cancelErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return { title: 'Error', text: GENERIC_CANCEL_ERROR }
  }
  if (error.status === 403) {
    return { title: 'Sin permiso', text: error.detail || 'No puedes cancelar una franja de otra entrenadora.' }
  }
  return { title: 'No se pudo cancelar', text: error.detail || GENERIC_CANCEL_ERROR }
}
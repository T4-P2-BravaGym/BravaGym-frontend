import { useCallback, useEffect, useMemo, useState } from 'react'
import WeekNav from '@/components/domain/WeekNav'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import Field from '@/components/ui/Field'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import Tabs from '@/components/ui/Tabs'
import useAuth from '@/hooks/useAuth'
import { ApiError } from '@/services/api'
import {
  cancelSession,
  createPersonalTrainingSlot,
  createPersonalTrainingSlotsBulk,
  isPersonalTrainingSession,
  listSessions,
  toSessionCard,
} from '@/services/sessions'
import {
  formatDate,
  formatDateTime,
  formatTimeRange,
  madridInputToUtcIso,
  utcIsoToMadridInput,
} from '@/utils/format'
import { getWeekRange } from '@/utils/week'
import {
  MAX_SLOT_TIMES,
  MAX_SLOT_WEEKS,
  WEEKDAYS,
  formatSlotDay,
  weeklySlotDates,
} from '@/utils/weeklySlots'
import styles from './TrainerSlots.module.scss'

const LOAD_SLOTS_ERROR = 'No se han podido cargar tus franjas. Inténtalo de nuevo.'
const OVERLAP_ERROR = 'Esta franja se solapa con otra de tus sesiones. Elige otra hora.'
const NO_PT_TYPE_ERROR = 'No hay un tipo de clase de entrenamiento personal activo. Avisa a administración.'
const GENERIC_SAVE_ERROR = 'No se han podido abrir las franjas. Inténtalo de nuevo.'
const GENERIC_CANCEL_ERROR = 'No se ha podido cancelar la franja. Inténtalo de nuevo.'
const SINGLE_REQUIRED = 'Elige la fecha y la hora de inicio.'
const WEEKLY_REQUIRED = 'Elige al menos un día, una hora y la fecha de inicio.'

const PREVIEW_LIMIT = 6
const DEFAULT_WEEKS = '4'
const WEEK_OPTIONS = Array.from({ length: MAX_SLOT_WEEKS }, (_, index) => index + 1)

const MODE_TABS = [
  { id: 'weekly', label: 'Horario semanal' },
  { id: 'single', label: 'Franja suelta' },
]

const SKIP_REASONS = {
  overlap: 'se solapa con otra de tus sesiones',
  past: 'ya ha pasado',
}

/** Today in Madrid as "YYYY-MM-DD", the default start of the weekly period. */
function todayInMadrid() {
  return utcIsoToMadridInput(new Date().toISOString()).slice(0, 10)
}

function emptyWeekly() {
  return { weekdays: [], times: ['11:00'], start_date: todayInMadrid(), weeks: DEFAULT_WEEKS }
}

/**
 * Franjas de entrenamiento personal (HU-14, T-11)
 * The trainer opens one-hour, one-person slots, one by one or with a weekly schedule.
 */
export default function TrainerSlots() {
  const { user } = useAuth()
  const trainerId = user?.role === 'trainer' ? user.id : undefined

  const [weekAnchor, setWeekAnchor] = useState(() => new Date())
  const [slots, setSlots] = useState(null)
  const [slotsError, setSlotsError] = useState(null)
  const [flash, setFlash] = useState(null)
  const [skippedSlots, setSkippedSlots] = useState([])
  const [actionError, setActionError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [mode, setMode] = useState('weekly')
  const [weekly, setWeekly] = useState(emptyWeekly)
  const [startsAtLocal, setStartsAtLocal] = useState('')
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)

  const loadSlots = useCallback(
      (signal) => {
        const { from, to } = getWeekRange(weekAnchor)
        return listSessions({ from, to, trainer_id: trainerId, signal })
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

  const preview = useMemo(
      () =>
          weeklySlotDates({
            startDate: weekly.start_date,
            weeks: weekly.weeks,
            weekdays: weekly.weekdays,
            times: weekly.times,
          }),
      [weekly],
  )

  const loadingSlots = slots === null && !slotsError

  function clearMessages() {
    setFormError(null)
    setActionError(null)
    setFlash(null)
    setSkippedSlots([])
  }

  function openForm() {
    setFormOpen(true)
    setMode('weekly')
    setWeekly(emptyWeekly())
    setStartsAtLocal('')
    clearMessages()
  }

  function closeForm() {
    setFormOpen(false)
    setFormError(null)
  }

  function toggleWeekday(value) {
    setWeekly((current) => ({
      ...current,
      weekdays: current.weekdays.includes(value)
          ? current.weekdays.filter((day) => day !== value)
          : [...current.weekdays, value],
    }))
  }

  function updateTime(index, value) {
    setWeekly((current) => ({
      ...current,
      times: current.times.map((time, position) => (position === index ? value : time)),
    }))
  }

  function addTime() {
    setWeekly((current) => ({ ...current, times: [...current.times, ''] }))
  }

  function removeTime(index) {
    setWeekly((current) => ({
      ...current,
      times: current.times.filter((_, position) => position !== index),
    }))
  }

  function updateWeeklyField(name, value) {
    setWeekly((current) => ({ ...current, [name]: value }))
  }

  async function submitWeekly() {
    const body = buildWeeklyBody(weekly)
    if (!body) {
      setFormError(WEEKLY_REQUIRED)
      return
    }

    const result = await createPersonalTrainingSlotsBulk(body)
    const createdCount = result?.created?.length ?? 0
    setFlash(createdCount > 0 ? `Se han abierto ${createdCount} ${plural(createdCount, 'franja', 'franjas')}.` : null)
    setSkippedSlots(result?.skipped ?? [])
    closeForm()
    setWeekAnchor(new Date(`${body.start_date}T12:00:00Z`))
  }

  async function submitSingle() {
    const startsAt = madridInputToUtcIso(startsAtLocal)
    if (!startsAt) {
      setFormError(SINGLE_REQUIRED)
      return
    }

    await createPersonalTrainingSlot({ starts_at: startsAt })
    setFlash('Franja abierta. Ya aparece libre para las socias con entrenamiento personal.')
    closeForm()
    setWeekAnchor(new Date(startsAt))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    clearMessages()
    setBusy(true)
    try {
      if (mode === 'weekly') {
        await submitWeekly()
      } else {
        await submitSingle()
      }
    } catch (error) {
      setActionError(saveErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirmCancel() {
    if (!cancelTarget?.id) return
    setBusy(true)
    clearMessages()
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
  const submitLabel =
      mode === 'weekly'
          ? preview.length > 0
              ? `Abrir ${preview.length} ${plural(preview.length, 'franja', 'franjas')}`
              : 'Abrir franjas'
          : 'Abrir franja'

  return (
      <div className={styles.root}>
        <PageHeader
            eyebrow="Panel de entrenadora"
            title="Entrenamiento personal"
            lead="Abre franjas de una hora para entrenar a solas con una socia. Solo pueden reservarlas las socias cuyo plan incluye entrenamiento personal."
            action={
              <Button variant="primary" onClick={openForm} disabled={formOpen}>
                Abrir franjas
              </Button>
            }
        />

        {flash && (
            <Alert tone="success" onClose={() => setFlash(null)}>
              {flash}
            </Alert>
        )}
        {skippedSlots.length > 0 && (
            <Alert
                tone="warning"
                title={
                  flash
                      ? `${skippedSlots.length} ${plural(skippedSlots.length, 'franja no se ha abierto', 'franjas no se han abierto')}`
                      : 'No se ha abierto ninguna franja'
                }
                onClose={() => setSkippedSlots([])}
            >
              <ul className={styles.skippedList}>
                {skippedSlots.map((slot) => (
                    <li key={`${slot.starts_at}-${slot.reason}`}>
                      {formatDateTime(slot.starts_at)}: {SKIP_REASONS[slot.reason] ?? 'no se ha podido abrir'}
                    </li>
                ))}
              </ul>
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
                  Abrir franjas
                </h2>
                <p className={styles.sectionLead}>
                  Cada franja dura 60 minutos y es para una sola socia. Las horas son del horario de Madrid.
                </p>
              </div>

              <Tabs tabs={MODE_TABS} active={mode} onChange={setMode} label="Cómo abrir las franjas">
                {formError && <Alert tone="error">{formError}</Alert>}

                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                  {mode === 'weekly' ? (
                      <>
                        <fieldset className={styles.fieldset}>
                          <legend className={styles.legend}>Días</legend>
                          <div role="group" aria-label="Días de la semana" className={styles.chips}>
                            {WEEKDAYS.map((day) => (
                                <Chip
                                    key={day.value}
                                    selected={weekly.weekdays.includes(day.value)}
                                    onClick={() => toggleWeekday(day.value)}
                                    aria-label={day.name}
                                    disabled={busy}
                                >
                                  {day.short}
                                </Chip>
                            ))}
                          </div>
                        </fieldset>

                        <fieldset className={styles.fieldset}>
                          <legend className={styles.legend}>Horas de inicio</legend>
                          <ul className={styles.timeList}>
                            {weekly.times.map((time, index) => (
                                <li key={index} className={styles.timeRow}>
                                  <Field
                                      label={`Hora ${index + 1}`}
                                      type="time"
                                      name={`time-${index}`}
                                      value={time}
                                      onChange={(event) => updateTime(index, event.target.value)}
                                      disabled={busy}
                                  />
                                  {weekly.times.length > 1 && (
                                      <Button
                                          type="button"
                                          variant="secondary"
                                          size="sm"
                                          onClick={() => removeTime(index)}
                                          disabled={busy}
                                      >
                                        Quitar
                                      </Button>
                                  )}
                                </li>
                            ))}
                          </ul>
                          {weekly.times.length < MAX_SLOT_TIMES && (
                              <div>
                                <Button type="button" variant="secondary" size="sm" onClick={addTime} disabled={busy}>
                                  Añadir hora
                                </Button>
                              </div>
                          )}
                        </fieldset>

                        <div className={styles.formRow}>
                          <Field
                              label="Desde"
                              type="date"
                              name="start_date"
                              value={weekly.start_date}
                              onChange={(event) => updateWeeklyField('start_date', event.target.value)}
                              disabled={busy}
                          />
                          <Field
                              label="Durante"
                              as="select"
                              name="weeks"
                              value={weekly.weeks}
                              onChange={(event) => updateWeeklyField('weeks', event.target.value)}
                              disabled={busy}
                          >
                            {WEEK_OPTIONS.map((count) => (
                                <option key={count} value={String(count)}>
                                  {count} {plural(count, 'semana', 'semanas')}
                                </option>
                            ))}
                          </Field>
                        </div>

                        <WeeklyPreview slots={preview} />
                      </>
                  ) : (
                      <Field
                          label="Fecha y hora de inicio"
                          type="datetime-local"
                          name="starts_at_local"
                          value={startsAtLocal}
                          onChange={(event) => setStartsAtLocal(event.target.value)}
                          hint="Horario de Madrid"
                          disabled={busy}
                      />
                  )}

                  <div className={styles.formActions}>
                    <Button type="button" variant="secondary" onClick={closeForm} disabled={busy}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={busy}>
                      {busy ? 'Guardando…' : submitLabel}
                    </Button>
                  </div>
                </form>
              </Tabs>
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
                  text="Abre tu horario semanal para que tus socias puedan reservar entrenamiento personal contigo."
                  action={
                      !formOpen && (
                          <Button variant="primary" onClick={openForm}>
                            Abrir franjas
                          </Button>
                      )
                  }
              />
          )}

          {open.length > 0 && (
              <ul className={styles.list}>
                {open.map((slot) => (
                    <SlotRow key={slot.id} slot={slot} busy={busy} onCancel={() => setCancelTarget(slot)} />
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

function WeeklyPreview({ slots }) {
  if (slots.length === 0) {
    return <p className={styles.previewEmpty}>Elige al menos un día y una hora para ver las franjas.</p>
  }

  const shown = slots.slice(0, PREVIEW_LIMIT)
  const rest = slots.length - shown.length

  return (
      <div className={styles.preview} aria-live="polite">
        <p className={styles.previewTitle}>
          Vas a abrir {slots.length} {plural(slots.length, 'franja', 'franjas')}
        </p>
        <ul className={styles.previewList}>
          {shown.map((slot) => (
              <li key={`${slot.day}-${slot.time}`}>
                {formatSlotDay(slot.day)} · {slot.time}
              </li>
          ))}
        </ul>
        {rest > 0 && <p className={styles.previewNote}>y {rest} más</p>}
        <p className={styles.previewNote}>
          Si alguna se solapa con otra de tus sesiones o ya ha pasado, no se abre y te lo indicamos.
        </p>
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

function isBooked(slot) {
  return typeof slot.free_spots === 'number' && slot.free_spots === 0
}

function plural(count, one, many) {
  return count === 1 ? one : many
}

function buildWeeklyBody(weekly) {
  const times = [...new Set(weekly.times.filter(Boolean))].sort()
  if (weekly.weekdays.length === 0 || times.length === 0 || !weekly.start_date) return null
  return {
    weekdays: [...weekly.weekdays].sort((a, b) => a - b),
    times,
    start_date: weekly.start_date,
    weeks: Number(weekly.weeks),
  }
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
      text: error.detail || 'Revisa los días, las horas y las fechas e inténtalo de nuevo.',
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
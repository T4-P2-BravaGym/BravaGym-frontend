import { useCallback, useEffect, useMemo, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Field from '@/components/ui/Field'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'
import useAuth from '@/hooks/useAuth'
import { ApiError } from '@/services/api'
import { groupClassTypesFrom, listClassTypes } from '@/services/classTypes'
import {
  cancelSession,
  createSession,
  isPersonalTrainingSession,
  listSessions,
  toSessionCard,
  updateSession,
} from '@/services/sessions'
import { formatDateTime, madridInputToUtcIso, utcIsoToMadridInput } from '@/utils/format'
import { formatWeekLabel, getWeekRange, shiftWeek } from '@/utils/week'
import styles from './TrainerSessions.module.scss'

const LOAD_SESSIONS_ERROR = 'No se han podido cargar tus clases. Inténtalo de nuevo.'
const LOAD_TYPES_ERROR = 'No se han podido cargar los tipos de clase. Inténtalo de nuevo.'
const OVERLAP_ERROR = 'Esta franja se solapa con otra de tus clases. Elige otra hora.'
const OWNERSHIP_ERROR = 'No puedes modificar una clase de otra entrenadora.'
const GENERIC_SAVE_ERROR = 'No se ha podido guardar la clase. Inténtalo de nuevo.'
const GENERIC_CANCEL_ERROR = 'No se ha podido cancelar la clase. Inténtalo de nuevo.'
const REQUIRED_FIELDS = 'Completa el tipo, la fecha y la hora, la duración y el aforo.'

const EMPTY_FORM = {
  class_type_id: '',
  starts_at_local: '',
  duration_minutes: '60',
  capacity: '12',
}

/**
 * Mis clases (HU-11.5).
 * Trainer panel: list own group sessions for the week, create / edit / cancel.
 * Wires to GET/POST/PATCH /sessions and POST /sessions/{id}/cancel,
 * plus GET /class-types for the form. RN-09 → 409, RN-10 → 403.
 */
export default function TrainerSessions() {
  const { user } = useAuth()
  const trainerId = user?.role === 'trainer' ? user.id : undefined

  const [weekAnchor, setWeekAnchor] = useState(() => new Date())
  const [sessions, setSessions] = useState(null)
  const [classTypes, setClassTypes] = useState(null)
  const [sessionsError, setSessionsError] = useState(null)
  const [typesError, setTypesError] = useState(null)
  const [flash, setFlash] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [formMode, setFormMode] = useState(null) // 'create' | 'edit' | null
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)

  const loadSessions = useCallback(
    (signal) => {
      const { from, to } = getWeekRange(weekAnchor)
      return listSessions({ from, to, trainer_id: trainerId, signal })
        .then((data) => {
          const items = Array.isArray(data) ? data : (data?.items ?? [])
          const groupOnly = items
            .filter((session) => !isPersonalTrainingSession(session))
            .map(toSessionCard)
            .sort((a, b) => String(a.starts_at).localeCompare(String(b.starts_at)))
          setSessions(groupOnly)
          setSessionsError(null)
        })
        .catch((apiError) => {
          if (apiError.name === 'AbortError') return
          setSessionsError(apiError.detail ?? LOAD_SESSIONS_ERROR)
          setSessions([])
        })
    },
    [weekAnchor, trainerId],
  )

  useEffect(() => {
    const controller = new AbortController()
    setSessions(null)
    setSessionsError(null)
    loadSessions(controller.signal)
    return () => controller.abort()
  }, [loadSessions])

  useEffect(() => {
    const controller = new AbortController()
    setClassTypes(null)
    setTypesError(null)
    listClassTypes({ signal: controller.signal })
      .then((data) => {
        setClassTypes(groupClassTypesFrom(data))
        setTypesError(null)
      })
      .catch((apiError) => {
        if (apiError.name === 'AbortError') return
        setTypesError(apiError.detail ?? LOAD_TYPES_ERROR)
        setClassTypes([])
      })
    return () => controller.abort()
  }, [])

  const weekLabel = formatWeekLabel(weekAnchor)
  const loadingSessions = sessions === null && !sessionsError
  const loadingTypes = classTypes === null && !typesError

  const typeOptions = useMemo(() => classTypes ?? [], [classTypes])

  function openCreate() {
    setFormMode('create')
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setActionError(null)
    setFlash(null)
  }

  function openEdit(session) {
    setFormMode('edit')
    setEditingId(session.id)
    setForm({
      class_type_id: String(findClassTypeId(session, typeOptions) ?? ''),
      starts_at_local: utcIsoToMadridInput(session.starts_at),
      duration_minutes: String(session.duration_minutes ?? 60),
      capacity: String(session.capacity ?? 12),
    })
    setFormError(null)
    setActionError(null)
    setFlash(null)
  }

  function closeForm() {
    setFormMode(null)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError(null)
    setActionError(null)
    setFlash(null)

    const body = buildSessionBody(form)
    if (!body) {
      setFormError(REQUIRED_FIELDS)
      return
    }

    setBusy(true)
    try {
      if (formMode === 'edit' && editingId != null) {
        await updateSession(editingId, body)
        setFlash('Clase actualizada.')
      } else {
        await createSession(body)
        setFlash('Clase creada.')
      }
      closeForm()
      await loadSessions()
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
      setFlash('Clase cancelada. Las reservas de esta sesión pasan a canceladas.')
      setCancelTarget(null)
      await loadSessions()
    } catch (error) {
      setActionError(cancelErrorMessage(error))
      setCancelTarget(null)
    } finally {
      setBusy(false)
    }
  }

  const scheduled = (sessions ?? []).filter((session) => session.status !== 'cancelled')
  const cancelled = (sessions ?? []).filter((session) => session.status === 'cancelled')

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>Panel de entrenadora</span>
          <h1 className={styles.title}>Mis clases</h1>
          <p className={styles.lead}>
            Crea, edita o cancela tus clases de grupo. No pueden solaparse dos de tus
            sesiones a la misma hora.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} disabled={Boolean(formMode)}>
          Nueva clase
        </Button>
      </header>

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
      {typesError && <Alert tone="warning">{typesError}</Alert>}

      {formMode && (
        <section className={styles.formSection} aria-labelledby="session-form-heading">
          <div className={styles.sectionIntro}>
            <h2 id="session-form-heading" className={styles.sectionTitle}>
              {formMode === 'edit' ? 'Editar clase' : 'Nueva clase'}
            </h2>
            <p className={styles.sectionLead}>
              La hora se guarda en el horario de Madrid. El aforo es el máximo de plazas.
            </p>
          </div>

          {formError && <Alert tone="error">{formError}</Alert>}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Field
              label="Tipo de clase"
              as="select"
              name="class_type_id"
              value={form.class_type_id}
              onChange={(event) => updateField('class_type_id', event.target.value)}
              disabled={loadingTypes || busy}
              required
            >
              <option value="">Elige un tipo</option>
              {typeOptions.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                  {type.extra_price_cents > 0 ? ' (precio extra)' : ''}
                </option>
              ))}
            </Field>

            <Field
              label="Fecha y hora"
              type="datetime-local"
              name="starts_at_local"
              value={form.starts_at_local}
              onChange={(event) => updateField('starts_at_local', event.target.value)}
              hint="Horario de Madrid"
              disabled={busy}
              required
            />

            <div className={styles.formRow}>
              <Field
                label="Duración (minutos)"
                type="number"
                name="duration_minutes"
                min={1}
                step={5}
                value={form.duration_minutes}
                onChange={(event) => updateField('duration_minutes', event.target.value)}
                disabled={busy}
                required
              />
              <Field
                label="Aforo"
                type="number"
                name="capacity"
                min={1}
                step={1}
                value={form.capacity}
                onChange={(event) => updateField('capacity', event.target.value)}
                disabled={busy}
                required
              />
            </div>

            <div className={styles.formActions}>
              <Button type="button" variant="secondary" onClick={closeForm} disabled={busy}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={busy || loadingTypes}>
                {busy ? 'Guardando…' : formMode === 'edit' ? 'Guardar cambios' : 'Crear clase'}
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className={styles.section} aria-labelledby="week-heading">
        <div className={styles.sectionHead}>
          <h2 id="week-heading" className={styles.sectionTitle}>
            Semana
          </h2>
          <div className={styles.weekNav} role="group" aria-label="Semana">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setWeekAnchor((current) => shiftWeek(current, -1))}
              aria-label="Semana anterior"
            >
              Anterior
            </Button>
            <p className={styles.weekLabel} aria-live="polite">
              {weekLabel}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setWeekAnchor((current) => shiftWeek(current, 1))}
              aria-label="Semana siguiente"
            >
              Siguiente
            </Button>
          </div>
        </div>

        {sessionsError && <Alert tone="error">{sessionsError}</Alert>}
        {loadingSessions && <Spinner label="Cargando tus clases…" />}

        {!loadingSessions && !sessionsError && scheduled.length === 0 && cancelled.length === 0 && (
          <EmptyState
            title="No tienes clases esta semana"
            text="Crea una clase para que aparezca en el horario público."
            action={
              !formMode && (
                <Button variant="primary" onClick={openCreate}>
                  Nueva clase
                </Button>
              )
            }
          />
        )}

        {scheduled.length > 0 && (
          <ul className={styles.list}>
            {scheduled.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                busy={busy}
                onEdit={openEdit}
                onCancel={() => setCancelTarget(session)}
              />
            ))}
          </ul>
        )}

        {cancelled.length > 0 && (
          <div className={styles.cancelledBlock}>
            <h3 className={styles.cancelledTitle}>Canceladas esta semana</h3>
            <ul className={styles.list}>
              {cancelled.map((session) => (
                <SessionRow key={session.id} session={session} busy={busy} />
              ))}
            </ul>
          </div>
        )}
      </section>

      <Modal
        open={Boolean(cancelTarget)}
        title="¿Cancelar esta clase?"
        description={
          cancelTarget
            ? `Vas a cancelar «${cancelTarget.class_type_name}» del ${formatDateTime(cancelTarget.starts_at)}. Las socias con reserva pasarán a canceladas.`
            : undefined
        }
        confirmLabel="Cancelar clase"
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

function SessionRow({ session, busy, onEdit, onCancel }) {
  const isCancelled = session.status === 'cancelled'
  const spots =
    typeof session.free_spots === 'number' && typeof session.capacity === 'number'
      ? `${session.free_spots}/${session.capacity} plazas`
      : session.capacity
        ? `Aforo ${session.capacity}`
        : null

  return (
    <li className={styles.item}>
      <div className={styles.itemMain}>
        <p className={styles.itemName}>{session.class_type_name}</p>
        <p className={styles.itemMeta}>
          {formatDateTime(session.starts_at)}
          {session.duration_minutes ? ` · ${session.duration_minutes} min` : ''}
          {spots ? ` · ${spots}` : ''}
        </p>
      </div>
      <div className={styles.itemAside}>
        <Badge status={isCancelled ? 'cancelled' : 'scheduled'} />
        {!isCancelled && onEdit && (
          <Button variant="secondary" size="sm" disabled={busy} onClick={() => onEdit(session)}>
            Editar
          </Button>
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

function buildSessionBody(form) {
  const classTypeId = Number(form.class_type_id)
  const duration = Number(form.duration_minutes)
  const capacity = Number(form.capacity)
  const startsAt = madridInputToUtcIso(form.starts_at_local)

  if (!Number.isFinite(classTypeId) || classTypeId < 1) return null
  if (!startsAt) return null
  if (!Number.isFinite(duration) || duration < 1) return null
  if (!Number.isFinite(capacity) || capacity < 1) return null

  return {
    class_type_id: classTypeId,
    starts_at: startsAt,
    duration_minutes: duration,
    capacity,
  }
}

function findClassTypeId(session, types) {
  if (session.class_type_id) return session.class_type_id
  if (session.class_type?.id) return session.class_type.id
  const byName = types.find((type) => type.name === session.class_type_name)
  return byName?.id ?? null
}

function saveErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return { title: 'Error', text: GENERIC_SAVE_ERROR }
  }
  if (error.status === 403) {
    return { title: 'Sin permiso', text: error.detail || OWNERSHIP_ERROR }
  }
  if (error.status === 409) {
    return { title: 'Horario ocupado', text: error.detail || OVERLAP_ERROR }
  }
  if (error.status === 422) {
    return {
      title: 'Datos no válidos',
      text: error.detail || 'Revisa el formulario e inténtalo de nuevo.',
    }
  }
  return { title: 'No se pudo guardar', text: error.detail || GENERIC_SAVE_ERROR }
}

function cancelErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return { title: 'Error', text: GENERIC_CANCEL_ERROR }
  }
  if (error.status === 403) {
    return { title: 'Sin permiso', text: error.detail || OWNERSHIP_ERROR }
  }
  if (error.status === 409) {
    return { title: 'No se pudo cancelar', text: error.detail || GENERIC_CANCEL_ERROR }
  }
  return { title: 'No se pudo cancelar', text: error.detail || GENERIC_CANCEL_ERROR }
}

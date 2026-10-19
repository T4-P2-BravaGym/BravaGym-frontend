import { useCallback, useEffect, useState } from 'react'
import WeekNav from '@/components/domain/WeekNav'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import useAuth from '@/hooks/useAuth'
import {
  cancelSession,
  createPersonalTrainingSlot,
  createPersonalTrainingSlotsBulk,
  isPersonalTrainingSession,
  listSessions,
  toSessionCard,
} from '@/services/sessions'
import { formatDateTime } from '@/utils/format'
import { getWeekRange } from '@/utils/week'
import SlotForm from './SlotForm'
import SlotRow from './SlotRow'
import { SKIP_REASONS, cancelErrorMessage, isBooked, plural, saveErrorMessage } from './slotHelpers'
import styles from './TrainerSlots.module.scss'

const LOAD_SLOTS_ERROR = 'No se han podido cargar tus franjas. Inténtalo de nuevo.'

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

  const loadingSlots = slots === null && !slotsError

  function clearMessages() {
    setActionError(null)
    setFlash(null)
    setSkippedSlots([])
  }

  function openForm() {
    clearMessages()
    setFormOpen(true)
  }

  async function runSave(save) {
    clearMessages()
    setBusy(true)
    try {
      await save()
      setFormOpen(false)
    } catch (error) {
      setActionError(saveErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  function handleSubmitWeekly(body) {
    return runSave(async () => {
      const result = await createPersonalTrainingSlotsBulk(body)
      const createdCount = result?.created?.length ?? 0
      setFlash(createdCount > 0 ? `Se han abierto ${createdCount} ${plural(createdCount, 'franja', 'franjas')}.` : null)
      setSkippedSlots(result?.skipped ?? [])
      setWeekAnchor(new Date(`${body.start_date}T12:00:00Z`))
    })
  }

  function handleSubmitSingle(body) {
    return runSave(async () => {
      await createPersonalTrainingSlot(body)
      setFlash('Franja abierta. Ya aparece libre para las socias con entrenamiento personal.')
      setWeekAnchor(new Date(body.starts_at))
    })
  }

  async function handleConfirmCancel() {
    if (!cancelTarget?.id) return
    clearMessages()
    setBusy(true)
    try {
      await cancelSession(cancelTarget.id)
      setFlash('Franja cancelada. Si estaba reservada, la reserva pasa a cancelada.')
      await loadSlots()
    } catch (error) {
      setActionError(cancelErrorMessage(error))
    } finally {
      setCancelTarget(null)
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
            <SlotForm
                busy={busy}
                onSubmitWeekly={handleSubmitWeekly}
                onSubmitSingle={handleSubmitSingle}
                onCancel={() => setFormOpen(false)}
            />
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
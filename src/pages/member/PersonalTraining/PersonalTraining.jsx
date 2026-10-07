import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import TrainerCard from '@/components/domain/TrainerCard'
import WeekSchedule from '@/components/domain/WeekSchedule'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import { PATHS } from '@/routes/paths'
import { ApiError } from '@/services/api'
import { bookSession, bookingsBySessionId, listMyBookings } from '@/services/bookings'
import { isPersonalTrainingSession, listSessions, toSessionCard } from '@/services/sessions'
import { listTrainers } from '@/services/trainers'
import { formatWeekLabel, getWeekRange, shiftWeek } from '@/utils/week'
import styles from './PersonalTraining.module.scss'

const TRAINER_PARAM = 'entrenadora'
const LOAD_TRAINERS_ERROR = 'No se han podido cargar las entrenadoras. Inténtalo de nuevo.'
const LOAD_SLOTS_ERROR = 'No se han podido cargar las franjas. Inténtalo de nuevo.'
const NO_PT_PLAN =
  'Tu plan no incluye entrenamiento personal. Cambia a un plan Premium en Precios.'
const DUPLICATE_BOOKING = 'Ya tienes una reserva en esta franja.'
const GENERIC_BOOK_ERROR = 'No se ha podido completar la reserva. Inténtalo de nuevo.'

/**
 * Entrenamiento personal (HU-14.4 / RN-08).
 * Flow: choose a trainer → list her free 60-min PT slots → book via POST /sessions/{id}/bookings.
 * Slots come from GET /sessions?trainer_id=… filtered to is_personal_training.
 */
export default function PersonalTraining() {
  const [searchParams, setSearchParams] = useSearchParams()
  const trainerIdParam = searchParams.get(TRAINER_PARAM)
  const selectedTrainerId = trainerIdParam ? Number(trainerIdParam) : null

  const [trainers, setTrainers] = useState(null)
  const [trainersError, setTrainersError] = useState(null)
  const [weekAnchor, setWeekAnchor] = useState(() => new Date())
  const [sessions, setSessions] = useState(null)
  const [slotsError, setSlotsError] = useState(null)
  const [bookings, setBookings] = useState(null)
  const [flash, setFlash] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [now] = useState(() => new Date())

  const selectedTrainer = useMemo(() => {
    if (selectedTrainerId == null || !Array.isArray(trainers)) return null
    return trainers.find((trainer) => trainer.id === selectedTrainerId) ?? null
  }, [selectedTrainerId, trainers])

  const loadTrainers = useCallback((signal) => {
    return listTrainers({ signal })
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.items ?? [])
        setTrainers(items)
        setTrainersError(null)
        return items
      })
      .catch((apiError) => {
        if (apiError.name === 'AbortError') return
        setTrainersError(apiError.detail ?? LOAD_TRAINERS_ERROR)
        setTrainers([])
      })
  }, [])

  const loadBookings = useCallback((signal) => {
    return listMyBookings({ upcoming: true, signal })
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.items ?? [])
        setBookings(items)
        return items
      })
      .catch((apiError) => {
        if (apiError.name === 'AbortError') return
        setBookings([])
      })
  }, [])

  const loadSlots = useCallback(
    (signal) => {
      if (selectedTrainerId == null || Number.isNaN(selectedTrainerId)) {
        setSessions([])
        return Promise.resolve([])
      }
      const { from, to } = getWeekRange(weekAnchor)
      return listSessions({ from, to, trainer_id: selectedTrainerId, signal })
        .then((data) => {
          const items = Array.isArray(data) ? data : (data?.items ?? [])
          const personal = items.filter(isPersonalTrainingSession).map((session) => {
            const card = toSessionCard(session)
            const trainerName =
              selectedTrainer?.name ?? card.trainer_name ?? 'Entrenadora'
            return { ...card, trainer_name: trainerName }
          })
          setSessions(personal)
          setSlotsError(null)
          return personal
        })
        .catch((apiError) => {
          if (apiError.name === 'AbortError') return
          setSlotsError(apiError.detail ?? LOAD_SLOTS_ERROR)
          setSessions([])
        })
    },
    [selectedTrainerId, selectedTrainer, weekAnchor],
  )

  useEffect(() => {
    const controller = new AbortController()
    setTrainers(null)
    setTrainersError(null)
    loadTrainers(controller.signal)
    return () => controller.abort()
  }, [loadTrainers])

  useEffect(() => {
    if (selectedTrainerId == null) return undefined
    const controller = new AbortController()
    setSessions(null)
    setSlotsError(null)
    loadSlots(controller.signal)
    loadBookings(controller.signal)
    return () => controller.abort()
  }, [selectedTrainerId, loadSlots, loadBookings])

  function selectTrainer(trainerId) {
    setFlash(null)
    setActionError(null)
    setSearchParams({ [TRAINER_PARAM]: String(trainerId) })
  }

  function clearTrainer() {
    setFlash(null)
    setActionError(null)
    setSessions(null)
    setSearchParams({})
  }

  async function handleBook(session) {
    setActionError(null)
    setFlash(null)
    setBusyId(session.id)
    try {
      const booking = await bookSession(session.id)
      setFlash(successMessage(booking))
      await Promise.all([loadSlots(), loadBookings()])
    } catch (error) {
      setActionError(bookErrorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  const bookingMap = bookingsBySessionId(bookings ?? [])
  const weekLabel = formatWeekLabel(weekAnchor)
  const loadingTrainers = trainers === null && !trainersError
  const loadingSlots = selectedTrainerId != null && sessions === null && !slotsError
  const unknownTrainer =
    selectedTrainerId != null &&
    trainers !== null &&
    !trainersError &&
    selectedTrainer == null

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>Sesión individual</span>
          <h1 className={styles.title}>Entrenamiento personal</h1>
          <p className={styles.lead}>
            Elige entrenadora y después una franja libre de una hora. Solo disponible con un plan
            que incluya entrenamiento personal.
          </p>
        </div>
      </header>

      {flash && (
        <Alert tone="success" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      )}
      {actionError && (
        <Alert
          tone="error"
          onClose={() => setActionError(null)}
          title={actionError.title}
        >
          {actionError.text}
          {actionError.showPricing && (
            <div className={styles.alertAction}>
              <Button to={PATHS.pricing} variant="secondary" size="sm">
                Ver planes
              </Button>
            </div>
          )}
        </Alert>
      )}

      {selectedTrainerId == null ? (
        <section className={styles.section} aria-labelledby="trainers-heading">
          <div className={styles.sectionIntro}>
            <h2 id="trainers-heading" className={styles.sectionTitle}>
              1. Elige entrenadora
            </h2>
            <p className={styles.sectionLead}>
              Verás solo las franjas libres de la entrenadora que elijas.
            </p>
          </div>

          {trainersError && <Alert tone="error">{trainersError}</Alert>}
          {loadingTrainers && <Spinner label="Cargando entrenadoras…" />}
          {!loadingTrainers && !trainersError && trainers?.length === 0 && (
            <EmptyState
              title="Todavía no hay entrenadoras"
              text="Cuando el equipo publique perfiles aparecerán aquí."
            />
          )}
          {trainers?.length > 0 && (
            <ul className={styles.trainerGrid}>
              {trainers.map((trainer) => (
                <li key={trainer.id} className={styles.trainerItem}>
                  <TrainerCard trainer={trainer} />
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => selectTrainer(trainer.id)}
                  >
                    Ver sus franjas
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className={styles.section} aria-labelledby="slots-heading">
          <div className={styles.sectionHead}>
            <div className={styles.sectionIntro}>
              <Button variant="quiet" size="sm" onClick={clearTrainer}>
                ← Cambiar entrenadora
              </Button>
              <h2 id="slots-heading" className={styles.sectionTitle}>
                2. Elige franja
                {selectedTrainer ? ` · ${selectedTrainer.name}` : ''}
              </h2>
              <p className={styles.sectionLead}>
                Franjas de 60 minutos con plaza libre (aforo 1). Reserva con el mismo flujo que
                una clase.
              </p>
            </div>
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

          {unknownTrainer && (
            <Alert tone="warning" title="Entrenadora no encontrada">
              Esa entrenadora no está en el listado activo.{' '}
              <Link to={PATHS.personalTraining} onClick={clearTrainer}>
                Volver a elegir
              </Link>
            </Alert>
          )}
          {slotsError && <Alert tone="error">{slotsError}</Alert>}
          {loadingSlots && <Spinner label="Cargando franjas…" />}
          {!loadingSlots && !slotsError && sessions?.length === 0 && (
            <EmptyState
              title="No hay franjas esta semana"
              text="La entrenadora aún no ha publicado huecos de entrenamiento personal para estas fechas."
            />
          )}
          {sessions?.length > 0 && (
            <WeekSchedule
              sessions={sessions}
              bookings={bookingMap}
              now={now}
              busyId={busyId}
              onBook={handleBook}
            />
          )}
        </section>
      )}
    </div>
  )
}

function successMessage(booking) {
  if (booking?.status === 'waitlisted') {
    const position = booking.waitlist_position
      ? ` · ${booking.waitlist_position}.º`
      : ''
    return `Estás en lista de espera${position}. Te avisamos si se libera la franja.`
  }
  return 'Franja de entrenamiento personal reservada.'
}

function bookErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return { title: 'Error', text: GENERIC_BOOK_ERROR, showPricing: false }
  }
  if (error.status === 403) {
    return {
      title: 'No puedes reservar',
      text: error.detail || NO_PT_PLAN,
      showPricing: true,
    }
  }
  if (error.status === 409) {
    return {
      title: 'No se pudo reservar',
      text: error.detail || DUPLICATE_BOOKING,
      showPricing: false,
    }
  }
  return {
    title: 'No se pudo reservar',
    text: error.detail || GENERIC_BOOK_ERROR,
    showPricing: false,
  }
}

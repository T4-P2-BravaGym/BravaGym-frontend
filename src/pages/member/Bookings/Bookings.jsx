import { useCallback, useEffect, useState } from 'react'
import WeekSchedule from '@/components/domain/WeekSchedule'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import { PATHS } from '@/routes/paths'
import { ApiError } from '@/services/api'
import {
  bookSession,
  bookingsBySessionId,
  bookingSessionId,
  listMyBookings,
} from '@/services/bookings'
import { listSessions, toSessionCard } from '@/services/sessions'
import { formatDateTime } from '@/utils/format'
import { formatWeekLabel, getWeekRange, shiftWeek } from '@/utils/week'
import styles from './Bookings.module.scss'

const LOAD_SCHEDULE_ERROR = 'No se ha podido cargar el horario. Inténtalo de nuevo.'
const LOAD_BOOKINGS_ERROR = 'No se han podido cargar tus reservas. Inténtalo de nuevo.'
const NO_SUBSCRIPTION =
  'Necesitas una suscripción activa para reservar. Elige un plan en Precios.'
const DUPLICATE_BOOKING = 'Ya tienes una reserva en esta clase.'
const GENERIC_BOOK_ERROR = 'No se ha podido completar la reserva. Inténtalo de nuevo.'

/**
 * Reservar clases (HU-12.4).
 * Week schedule with book / waitlist actions (POST /sessions/{id}/bookings)
 * and "Mis reservas" from GET /bookings/me. Cancel is HU-13.
 */
export default function Bookings() {
  const [weekAnchor, setWeekAnchor] = useState(() => new Date())
  const [sessions, setSessions] = useState(null)
  const [bookings, setBookings] = useState(null)
  const [scheduleError, setScheduleError] = useState(null)
  const [bookingsError, setBookingsError] = useState(null)
  const [flash, setFlash] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [now] = useState(() => new Date())

  const loadBookings = useCallback((signal) => {
    return listMyBookings({ upcoming: true, signal })
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.items ?? [])
        setBookings(items)
        setBookingsError(null)
        return items
      })
      .catch((apiError) => {
        if (apiError.name === 'AbortError') return
        setBookingsError(apiError.detail ?? LOAD_BOOKINGS_ERROR)
        setBookings([])
      })
  }, [])

  const loadSessions = useCallback(
    (signal) => {
      const { from, to } = getWeekRange(weekAnchor)
      return listSessions({ from, to, signal })
        .then((data) => {
          const items = Array.isArray(data) ? data : (data?.items ?? [])
          setSessions(items.map(toSessionCard))
          setScheduleError(null)
        })
        .catch((apiError) => {
          if (apiError.name === 'AbortError') return
          setScheduleError(apiError.detail ?? LOAD_SCHEDULE_ERROR)
          setSessions([])
        })
    },
    [weekAnchor],
  )

  useEffect(() => {
    const controller = new AbortController()
    setSessions(null)
    setScheduleError(null)
    loadSessions(controller.signal)
    return () => controller.abort()
  }, [loadSessions])

  useEffect(() => {
    const controller = new AbortController()
    setBookings(null)
    setBookingsError(null)
    loadBookings(controller.signal)
    return () => controller.abort()
  }, [loadBookings])

  async function handleBook(session) {
    setActionError(null)
    setFlash(null)
    setBusyId(session.id)
    try {
      const booking = await bookSession(session.id)
      setFlash(successMessage(booking))
      await Promise.all([loadBookings(), loadSessions()])
    } catch (error) {
      setActionError(bookErrorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  const bookingMap = bookingsBySessionId(bookings ?? [])
  const upcomingBookings = (bookings ?? [])
    .filter((booking) => booking.status === 'confirmed' || booking.status === 'waitlisted')
    .slice()
    .sort(compareBySessionStart)

  const weekLabel = formatWeekLabel(weekAnchor)
  const loadingSchedule = sessions === null && !scheduleError
  const loadingBookings = bookings === null && !bookingsError

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>Clases en grupo</span>
          <h1 className={styles.title}>Reservar clases</h1>
          <p className={styles.lead}>
            Elige una clase con plazas o únete a la lista de espera si está completa.
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

      <section className={styles.section} aria-labelledby="my-bookings-heading">
        <div className={styles.sectionIntro}>
          <h2 id="my-bookings-heading" className={styles.sectionTitle}>
            Mis reservas
          </h2>
          <p className={styles.sectionLead}>Tus próximas plazas confirmadas y en lista de espera.</p>
        </div>

        {bookingsError && <Alert tone="error">{bookingsError}</Alert>}
        {loadingBookings && <Spinner label="Cargando tus reservas…" />}
        {!loadingBookings && !bookingsError && upcomingBookings.length === 0 && (
          <EmptyState
            title="Aún no tienes reservas"
            text="Cuando reserves una clase aparecerá aquí."
          />
        )}
        {upcomingBookings.length > 0 && (
          <ul className={styles.bookingList}>
            {upcomingBookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section} aria-labelledby="schedule-heading">
        <div className={styles.sectionHead}>
          <h2 id="schedule-heading" className={styles.sectionTitle}>
            Horario de la semana
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

        {scheduleError && <Alert tone="error">{scheduleError}</Alert>}
        {loadingSchedule && <Spinner label="Cargando el horario…" />}
        {sessions && (
          <WeekSchedule
            sessions={sessions}
            bookings={bookingMap}
            now={now}
            busyId={busyId}
            onBook={handleBook}
          />
        )}
      </section>
    </div>
  )
}

function BookingRow({ booking }) {
  const session = booking.session ?? null
  const title =
    booking.class_type_name ??
    session?.class_type_name ??
    session?.class_type?.name ??
    'Clase'
  const trainer =
    booking.trainer_name ?? session?.trainer_name ?? session?.trainer?.name ?? null
  const startsAt = booking.starts_at ?? session?.starts_at ?? null
  const duration = booking.duration_minutes ?? session?.duration_minutes ?? null
  const sessionId = bookingSessionId(booking)

  return (
    <li className={styles.bookingItem}>
      <div className={styles.bookingMain}>
        <p className={styles.bookingName}>{title}</p>
        <p className={styles.bookingMeta}>
          {startsAt ? formatDateTime(startsAt) : sessionId ? `Sesión #${sessionId}` : 'Fecha por confirmar'}
          {trainer ? ` · ${trainer}` : ''}
          {duration ? ` · ${duration} min` : ''}
        </p>
      </div>
      <div className={styles.bookingBadge}>
        {booking.status === 'waitlisted' ? (
          <Badge status="waitlisted">
            Lista de espera
            {booking.waitlist_position ? ` · ${booking.waitlist_position}.º` : ''}
          </Badge>
        ) : (
          <Badge status={booking.status} />
        )}
      </div>
    </li>
  )
}

function successMessage(booking) {
  if (booking?.status === 'waitlisted') {
    const position = booking.waitlist_position
      ? ` · ${booking.waitlist_position}.º`
      : ''
    return `Estás en lista de espera${position}. Te avisamos si se libera una plaza.`
  }
  if (booking?.payment_status === 'pending' || booking?.has_pending_payment) {
    return 'Plaza reservada. Tienes un pago pendiente por el precio extra de la clase.'
  }
  return 'Plaza reservada.'
}

function bookErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return { title: 'Error', text: GENERIC_BOOK_ERROR, showPricing: false }
  }
  if (error.status === 403) {
    return {
      title: 'No puedes reservar',
      text: error.detail || NO_SUBSCRIPTION,
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

function compareBySessionStart(a, b) {
  const aStart = a.starts_at ?? a.session?.starts_at ?? ''
  const bStart = b.starts_at ?? b.session?.starts_at ?? ''
  return String(aStart).localeCompare(String(bStart))
}

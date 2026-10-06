import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WeekSchedule from '@/components/domain/WeekSchedule'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import Spinner from '@/components/ui/Spinner'
import useAuth from '@/hooks/useAuth'
import { PATHS } from '@/routes/paths'
import { listSessions } from '@/services/sessions'
import { formatWeekLabel, getWeekRange, shiftWeek } from '@/utils/week'
import styles from './Schedule.module.scss'

const LOAD_ERROR = 'No se ha podido cargar el horario. Inténtalo de nuevo.'

/**
 * Horario de clases (HU-10.4).
 * Loads GET /sessions for the visible week, shows free spots and extra price
 * via WeekSchedule / SessionCard. Booking actions live in HU-12.
 */
export default function Schedule() {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()
  const [weekAnchor, setWeekAnchor] = useState(() => new Date())
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [sessions, setSessions] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const { from, to } = getWeekRange(weekAnchor)
    setSessions(null)
    setError(null)

    listSessions({
      from,
      to,
      only_available: onlyAvailable || undefined,
      signal: controller.signal,
    })
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.items ?? [])
        setSessions(items)
      })
      .catch((apiError) => {
        if (apiError.name !== 'AbortError') setError(apiError.detail ?? LOAD_ERROR)
      })

    return () => controller.abort()
  }, [weekAnchor, onlyAvailable])

  function handleBook() {
    if (!isAuthenticated) {
      navigate(PATHS.login, { state: { from: PATHS.bookings } })
      return
    }
    if (role === 'member') {
      navigate(PATHS.bookings)
      return
    }
    navigate(PATHS.member)
  }

  const weekLabel = formatWeekLabel(weekAnchor)

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>Clases en grupo</span>
          <h1 className={styles.title}>Horario de la semana</h1>
          <p className={styles.lead}>
            Elige el día y la hora. Verás las plazas libres y si la clase tiene precio extra.
          </p>
        </div>

        <div className={styles.toolbar}>
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

          <div className={styles.chips} role="group" aria-label="Disponibilidad">
            <Chip selected={!onlyAvailable} onClick={() => setOnlyAvailable(false)}>
              Todas
            </Chip>
            <Chip selected={onlyAvailable} onClick={() => setOnlyAvailable(true)}>
              Solo con plazas
            </Chip>
          </div>
        </div>
      </header>

      {error && <Alert tone="error">{error}</Alert>}

      {!sessions && !error && <Spinner label="Cargando el horario…" />}

      {sessions && (
        <WeekSchedule sessions={sessions} now={new Date()} onBook={handleBook} />
      )}
    </div>
  )
}

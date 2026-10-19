import { useMemo, useState } from 'react'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import SessionCard from '@/components/domain/SessionCard'
import cx from '@/utils/cx'
import { dayKey, formatDate } from '@/utils/format'
import styles from './WeekSchedule.module.scss'

/**
 * WeekSchedule
 * The week's timetable: one column per day (stacked on phones) with a SessionCard each.
 * Filters by day and by class type (chips). In delivery 2, free spots update by websocket:
 * the page only has to pass the new `sessions`.
 *
 * Props: sessions (API list), bookings ({ [sessionId]: booking }), now, busyId,
 *        onBook, onCancel, onLeaveWaitlist
 */
export default function WeekSchedule({ sessions, bookings = {}, now, busyId, onBook, onCancel, onLeaveWaitlist }) {
  const [day, setDay] = useState('all')
  const [classType, setClassType] = useState('all')

  const days = useMemo(() => {
    const groups = new Map()
    ;[...sessions]
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
      .forEach((session) => {
        const key = dayKey(session.starts_at)
        if (!groups.has(key)) groups.set(key, { key, label: formatDate(session.starts_at), sessions: [] })
        groups.get(key).sessions.push(session)
      })
    return [...groups.values()]
  }, [sessions])

  const classTypes = useMemo(() => [...new Set(sessions.map((s) => s.class_type_name))].sort(), [sessions])

  const visibleDays = days
    .filter((d) => day === 'all' || d.key === day)
    .map((d) => ({ ...d, sessions: d.sessions.filter((s) => classType === 'all' || s.class_type_name === classType) }))

  if (!sessions.length) {
    return <EmptyState title="No hay clases esta semana" text="Cuando el equipo publique el horario aparecerá aquí." />
  }

  return (
    <div className={styles.root}>
      <div className={styles.filters}>
        <div className={styles.chips} role="group" aria-label="Día">
          <Chip selected={day === 'all'} onClick={() => setDay('all')}>
            Toda la semana
          </Chip>
          {days.map((d) => (
            <Chip key={d.key} selected={day === d.key} onClick={() => setDay(d.key)}>
              {d.label}
            </Chip>
          ))}
        </div>
        {classTypes.length > 1 && (
          <div className={styles.chips} role="group" aria-label="Clase">
            <Chip selected={classType === 'all'} onClick={() => setClassType('all')}>
              Todas las clases
            </Chip>
            {classTypes.map((name) => (
              <Chip key={name} selected={classType === name} onClick={() => setClassType(name)}>
                {name}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <div className={cx(styles.grid, day !== 'all' && styles.singleDay)}>
        {visibleDays.map((d) => (
          <section key={d.key} className={styles.day} aria-label={d.label}>
            <h3 className={styles.dayTitle}>{d.label}</h3>
            {d.sessions.length ? (
              d.sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  booking={bookings[session.id] ?? null}
                  now={now}
                  busy={busyId === session.id}
                  onBook={onBook}
                  onCancel={onCancel}
                  onLeaveWaitlist={onLeaveWaitlist}
                />
              ))
            ) : (
              <p className={styles.none}>Sin clases</p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

/**
 * Week helpers for the class schedule.
 * Days follow Europe/Madrid (same as format.js); API dates stay in UTC ISO.
 */

const TIME_ZONE = 'Europe/Madrid'
const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Madrid calendar day "YYYY-MM-DD" for an instant. */
function madridDayKey(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/** Weekday in Madrid: 0 = Monday … 6 = Sunday. */
function madridWeekdayIndex(date) {
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short' }).format(date)
  const map = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }
  return map[weekday]
}

/**
 * Instant for a Madrid local wall time on a calendar day.
 * Uses a short correction loop so DST edges stay accurate.
 */
function madridLocalToUtc(year, month, day, hour = 0, minute = 0, second = 0) {
  let guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second))
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })

  for (let i = 0; i < 3; i += 1) {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(guess)
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, Number(part.value)]),
    )
    const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
    const wanted = Date.UTC(year, month - 1, day, hour, minute, second)
    guess = new Date(guess.getTime() + (wanted - asUtc))
  }

  return guess
}

/** Monday 00:00:00 Madrid → next Monday 00:00:00 Madrid (exclusive end) for the week of `anchor`. */
export function getWeekRange(anchor = new Date()) {
  const dayKey = madridDayKey(anchor)
  const [year, month, day] = dayKey.split('-').map(Number)
  const midday = madridLocalToUtc(year, month, day, 12, 0, 0)
  const mondayMidday = new Date(midday.getTime() - madridWeekdayIndex(midday) * MS_PER_DAY)
  const mondayKey = madridDayKey(mondayMidday)
  const [my, mm, md] = mondayKey.split('-').map(Number)

  const fromDate = madridLocalToUtc(my, mm, md, 0, 0, 0)
  const nextMonday = new Date(mondayMidday.getTime() + 7 * MS_PER_DAY)
  const nextKey = madridDayKey(nextMonday)
  const [ny, nm, nd] = nextKey.split('-').map(Number)
  const toDate = madridLocalToUtc(ny, nm, nd, 0, 0, 0)

  return { from: fromDate.toISOString(), to: toDate.toISOString(), fromDate, toDate }
}

/** Move `anchor` by `delta` weeks (negative = previous). */
export function shiftWeek(anchor, delta) {
  return new Date(anchor.getTime() + delta * 7 * MS_PER_DAY)
}

/** "6–12 oct 2026" for the week containing `anchor`. */
export function formatWeekLabel(anchor = new Date()) {
  const { fromDate, toDate } = getWeekRange(anchor)
  const lastDay = new Date(toDate.getTime() - 1000)
  const startDay = new Intl.DateTimeFormat('es-ES', { timeZone: TIME_ZONE, day: 'numeric' }).format(fromDate)
  const end = new Intl.DateTimeFormat('es-ES', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(lastDay)
  const startMonth = new Intl.DateTimeFormat('es-ES', { timeZone: TIME_ZONE, month: 'short' }).format(fromDate)
  const endMonth = new Intl.DateTimeFormat('es-ES', { timeZone: TIME_ZONE, month: 'short' }).format(lastDay)
  if (startMonth === endMonth) {
    return `${startDay}–${end}`
  }
  const startFull = new Intl.DateTimeFormat('es-ES', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'short',
  }).format(fromDate)
  return `${startFull} – ${end}`
}

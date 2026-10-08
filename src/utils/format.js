const LOCALE = 'es-ES'
const TIME_ZONE = 'Europe/Madrid'

const euros = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR' })

export function formatEuros(cents) {
  return euros.format((Number(cents) || 0) / 100)
}

export function centsToEurosInput(cents) {
  if (cents === null || cents === undefined) return ''
  return (Number(cents) / 100).toFixed(2).replace('.', ',')
}

export function eurosToCents(text) {
  const clean = String(text ?? '').replace(/[\s€]/g, '').replace(',', '.')
  if (clean === '') return null
  const value = Number(clean)
  return Number.isFinite(value) ? Math.round(value * 100) : text
}

export function formatTime(isoUtc) {
  return new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE }).format(
    new Date(isoUtc),
  )
}

export function formatDate(isoUtc) {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: TIME_ZONE,
  }).format(new Date(isoUtc))
}

export function formatDateTime(isoUtc) {
  return `${formatDate(isoUtc)}, ${formatTime(isoUtc)}`
}

export function formatRest(seconds) {
  const s = Number(seconds) || 0
  if (s < 90) return `${s} s`
  const minutes = Math.floor(s / 60)
  const rest = s % 60
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`
}

export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function dayKey(isoUtc) {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: TIME_ZONE }).format(
    new Date(isoUtc),
  )
}

/**
 * Instant for a Madrid local wall time on a calendar day.
 * Short correction loop so DST edges stay accurate (same idea as week.js).
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

/**
 * datetime-local value in Madrid ("2026-10-07T18:00") → UTC ISO for the API.
 */
export function madridInputToUtcIso(localValue) {
  if (!localValue) return null
  const [datePart, timePart = '00:00'] = String(localValue).split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour = 0, minute = 0] = timePart.split(':').map(Number)
  if (![year, month, day].every(Number.isFinite)) return null
  return madridLocalToUtc(year, month, day, hour, minute, 0).toISOString()
}

/**
 * UTC ISO → Madrid datetime-local value ("2026-10-07T18:00") for form fields.
 */
export function utcIsoToMadridInput(isoUtc) {
  if (!isoUtc) return ''
  const date = new Date(isoUtc)
  if (Number.isNaN(date.getTime())) return ''
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}

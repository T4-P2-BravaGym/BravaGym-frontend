const LOCALE = 'es-ES'
const TIME_ZONE = 'Europe/Madrid'

const euros = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR' })

export function formatEuros(cents) {
  return euros.format((Number(cents) || 0) / 100)
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

export function eurosToCents(text) {
  const value = String(text ?? '').trim()
  if (!value) return undefined
  const number = Number(value.replace(',', '.'))
  return Number.isFinite(number) ? Math.round(number * 100) : value
}
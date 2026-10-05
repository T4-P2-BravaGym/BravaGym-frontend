/**
 * Formatting helpers shared by the whole app (DRY).
 * The API sends money in integer cents and dates in UTC (ISO strings);
 * we always show euros and Madrid local time.
 */
const LOCALE = 'es-ES'
const TIME_ZONE = 'Europe/Madrid'

const euros = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR' })

/** 1250 -> "12,50 €" */
export function formatEuros(cents) {
  return euros.format((Number(cents) || 0) / 100)
}

/** "2026-10-05T16:00:00Z" -> "18:00" */
export function formatTime(isoUtc) {
  return new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE }).format(
    new Date(isoUtc),
  )
}

/** "2026-10-05T16:00:00Z" -> "lun 5 oct" */
export function formatDate(isoUtc) {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: TIME_ZONE,
  }).format(new Date(isoUtc))
}

/** "2026-10-05T16:00:00Z" -> "lun 5 oct, 18:00" */
export function formatDateTime(isoUtc) {
  return `${formatDate(isoUtc)}, ${formatTime(isoUtc)}`
}

/** 90 -> "1 min 30 s", 60 -> "60 s" */
export function formatRest(seconds) {
  const s = Number(seconds) || 0
  if (s < 90) return `${s} s`
  const minutes = Math.floor(s / 60)
  const rest = s % 60
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`
}

/** "Marta Ruiz" -> "MR" */
export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** "2026-10-05T22:30:00Z" -> "2026-10-06" (the day in Madrid, to group sessions by day) */
export function dayKey(isoUtc) {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: TIME_ZONE }).format(
    new Date(isoUtc),
  )
}

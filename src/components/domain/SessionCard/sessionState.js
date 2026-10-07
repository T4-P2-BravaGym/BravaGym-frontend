/**
 * State of a session for the current member, from the API data.
 * Mirrors the business rules so the UI never offers what the API would refuse:
 * RN-04 (no past or cancelled sessions), RN-05 (cancel 60 minutes or more before).
 * The API still checks everything: this only decides what to show.
 */
export const CANCEL_LIMIT_MINUTES = 60

/** Minutes remaining until session start (negative if already started). */
export function minutesUntilStart(startsAt, now = new Date()) {
  if (!startsAt) return Number.POSITIVE_INFINITY
  return (new Date(startsAt).getTime() - now.getTime()) / 60000
}

/**
 * RN-05: a confirmed booking can be cancelled only when ≥60 minutes remain.
 * Waitlist exit is always allowed before the session starts.
 */
export function canCancelBooking(booking, startsAt, now = new Date()) {
  const minutesLeft = minutesUntilStart(startsAt, now)
  if (minutesLeft <= 0) return false
  if (booking?.status === 'waitlisted') return true
  if (booking?.status === 'confirmed') return minutesLeft >= CANCEL_LIMIT_MINUTES
  return false
}

export function getSessionState(session, booking, now = new Date()) {
  const minutesLeft = minutesUntilStart(session.starts_at, now)

  if (session.status === 'cancelled') return 'cancelled'
  if (minutesLeft <= 0) return 'past'
  if (booking?.status === 'confirmed') return minutesLeft < CANCEL_LIMIT_MINUTES ? 'bookedLocked' : 'booked'
  if (booking?.status === 'waitlisted') return 'waitlisted'
  if (session.free_spots <= 0) return 'full'
  return 'available'
}

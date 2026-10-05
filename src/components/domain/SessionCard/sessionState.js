/**
 * State of a session for the current member, from the API data.
 * Mirrors the business rules so the UI never offers what the API would refuse:
 * RN-04 (no past or cancelled sessions), RN-05 (cancel 60 minutes or more before).
 * The API still checks everything: this only decides what to show.
 */
export const CANCEL_LIMIT_MINUTES = 60

export function getSessionState(session, booking, now = new Date()) {
  const startsAt = new Date(session.starts_at)
  const minutesLeft = (startsAt.getTime() - now.getTime()) / 60000

  if (session.status === 'cancelled') return 'cancelled'
  if (minutesLeft <= 0) return 'past'
  if (booking?.status === 'confirmed') return minutesLeft < CANCEL_LIMIT_MINUTES ? 'bookedLocked' : 'booked'
  if (booking?.status === 'waitlisted') return 'waitlisted'
  if (session.free_spots <= 0) return 'full'
  return 'available'
}

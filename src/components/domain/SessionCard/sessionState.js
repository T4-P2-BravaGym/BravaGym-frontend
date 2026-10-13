import {parseApiDate} from "@/utils/format.js";

export const CANCEL_LIMIT_MINUTES = 60

export function minutesUntilStart(startsAt, now = new Date()) {
  if (!startsAt) return Number.POSITIVE_INFINITY
  return (parseApiDate(startsAt).getTime() - now.getTime()) / 60000
}

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
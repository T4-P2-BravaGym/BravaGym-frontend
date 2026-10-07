import { apiRequest, buildQuery } from './api'

/**
 * API calls for class bookings (HU-12, HU-13).
 * Pages call these; components never call the API.
 *
 * POST /sessions/{id}/bookings — member books (or joins waitlist).
 * GET /bookings/me — member's bookings, optional status / upcoming filters.
 * Response shape follows api.md + BookingOut (status, waitlist_position when waitlisted).
 */

/**
 * bookSession(sessionId, { signal })
 * Body is empty: the server decides confirmed vs waitlisted (RN-02) and extra payment (RN-07).
 */
export function bookSession(sessionId, { signal } = {}) {
  return apiRequest(`/sessions/${sessionId}/bookings`, { method: 'POST', signal })
}

/**
 * listMyBookings({ status, upcoming, page, size, signal })
 * `upcoming=true` keeps only future sessions when the API supports it.
 */
export function listMyBookings({ status, upcoming, page = 1, size = 50, signal } = {}) {
  return apiRequest(
    `/bookings/me${buildQuery({ status, upcoming, page, size })}`,
    { signal },
  )
}

/** Session id used to key a booking against the week schedule. */
export function bookingSessionId(booking) {
  return booking?.class_session_id ?? booking?.session?.id ?? booking?.session_id ?? null
}

/**
 * Active bookings keyed by session id for WeekSchedule / SessionCard.
 * Cancelled bookings are omitted so the card offers "Reservar" again (RN-03).
 */
export function bookingsBySessionId(bookings = []) {
  const map = {}
  for (const booking of bookings) {
    if (!booking || booking.status === 'cancelled') continue
    const sessionId = bookingSessionId(booking)
    if (sessionId == null) continue
    map[sessionId] = {
      id: booking.id,
      status: booking.status,
      waitlist_position: booking.waitlist_position ?? null,
    }
  }
  return map
}

import { apiRequest, buildQuery } from './api'

/**
 * API calls for class sessions. Pages call these; components never call the API.
 *
 * GET /sessions is public (api.md). Listings return { items, total, page, size }.
 * SessionOut nests class_type (name, extra_price_cents, is_personal_training);
 * SessionCard expects flat class_type_name / extra_price_cents.
 */

/** Page size large enough to cover a full week of classes in one request. */
const WEEK_PAGE_SIZE = 100

/**
 * Map API SessionOut (or already-flat sample data) to the shape SessionCard / WeekSchedule use.
 */
export function toSessionCard(session) {
  if (!session) return session
  return {
    id: session.id,
    starts_at: session.starts_at,
    duration_minutes: session.duration_minutes,
    status: session.status,
    free_spots: session.free_spots,
    capacity: session.capacity,
    trainer_id: session.trainer_id,
    extra_price_cents: session.extra_price_cents ?? session.class_type?.extra_price_cents ?? 0,
    class_type_name: session.class_type_name ?? session.class_type?.name ?? 'Clase',
    trainer_name: session.trainer_name ?? session.trainer?.name ?? 'Entrenadora',
    is_personal_training:
      session.is_personal_training ?? session.class_type?.is_personal_training ?? false,
  }
}

/** True when the session (or its class type) is personal training (RN-08). */
export function isPersonalTrainingSession(session) {
  if (!session) return false
  return Boolean(session.is_personal_training ?? session.class_type?.is_personal_training)
}

/**
 * listSessions({ from, to, only_available, class_type_id, trainer_id, page, size, signal })
 * `from` / `to` are UTC ISO strings.
 */
export function listSessions({
  from,
  to,
  only_available,
  class_type_id,
  trainer_id,
  page = 1,
  size = WEEK_PAGE_SIZE,
  signal,
} = {}) {
  return apiRequest(
    `/sessions${buildQuery({
      from,
      to,
      only_available,
      class_type_id,
      trainer_id,
      page,
      size,
    })}`,
    { auth: false, signal },
  )
}

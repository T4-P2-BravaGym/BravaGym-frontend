import { apiRequest, buildQuery } from './api'

/**
 * API calls for class sessions. Pages call these; components never call the API.
 *
 * GET /sessions is public (api.md). Listings return { items, total, page, size }.
 * Each item includes computed free_spots and extra_price_cents from the class type.
 */

/** Page size large enough to cover a full week of classes in one request. */
const WEEK_PAGE_SIZE = 100

/**
 * listSessions({ from, to, only_available, class_type_id, trainer_id, page, size, signal })
 * `from` / `to` are UTC ISO strings (inclusive start, exclusive end recommended).
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

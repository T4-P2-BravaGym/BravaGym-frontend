import { apiRequest, buildQuery } from './api'

/**
 * Class types for scheduling (HU-11).
 * GET /class-types is public (api.md). Listings may be a page or a bare array.
 */

/** listClassTypes({ page, size, signal }) */
export function listClassTypes({ page = 1, size = 100, signal } = {}) {
  return apiRequest(`/class-types${buildQuery({ page, size })}`, { auth: false, signal })
}

/** Normalize list response and keep active, non–personal-training types for group classes. */
export function groupClassTypesFrom(data) {
  const items = Array.isArray(data) ? data : (data?.items ?? [])
  return items.filter(
    (type) => type && type.is_active !== false && !type.is_personal_training,
  )
}

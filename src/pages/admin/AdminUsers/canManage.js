/**
 * RN-18 in the table: only the superadmin manages admin and superadmin accounts.
 * The API checks it too (403); this only decides which buttons to show.
 */
const STAFF_ROLES = ['admin', 'superadmin']

export function canManage(actor, user) {
  if (!actor) return false
  if (actor.role === 'superadmin') return true
  return !STAFF_ROLES.includes(user.role)
}

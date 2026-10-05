import { Outlet } from 'react-router-dom'

/**
 * Guard for private routes: requires a session and, optionally, one of `roles`.
 * It is a convenience for the user; the API is what really protects the data.
 *
 * TODO(HU-03): with useAuth(), redirect to PATHS.login when there is no session and
 * show a 403 page when the role is not allowed. For now it lets everything through
 * so the team can build pages before login exists.
 */
export default function ProtectedRoute({ roles }) {
  return <Outlet />
}

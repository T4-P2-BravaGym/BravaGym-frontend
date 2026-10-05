import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { PATHS } from './paths'

// While the login does not exist yet, set VITE_DEV_SKIP_AUTH=true in .env to see the
// private pages. It only works in development (npm run dev), never in a build.
const SKIP_AUTH = import.meta.env.DEV && import.meta.env.VITE_DEV_SKIP_AUTH === 'true'

/**
 * Guard for private routes: requires a session and, optionally, one of `roles` (HU-03).
 * It is a convenience for the user; the API is what really protects the data.
 */
export default function ProtectedRoute({ roles }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (SKIP_AUTH) return <Outlet />

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-12)', display: 'flex', justifyContent: 'center' }}>
        <Spinner label="Comprobando tu sesión…" />
      </div>
    )
  }

  if (!user) {
    // Only an internal path is remembered for after login (never a URL from outside).
    return <Navigate to={PATHS.login} replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div style={{ padding: 'var(--space-12)' }}>
        <EmptyState
          title="No tienes acceso a esta sección"
          text="Tu cuenta no tiene permiso para ver esta página."
          action={
            <Button to={PATHS.home} variant="secondary">
              Volver al inicio
            </Button>
          }
        />
      </div>
    )
  }

  return <Outlet />
}

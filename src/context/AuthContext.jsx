import { createContext, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { configureApi } from '@/services/api'
import * as authService from '@/services/auth'
import { createSession } from '@/services/session'
import { sessionFromToken } from '@/utils/token'

export const AuthContext = createContext(null)

// One session owner also prevents React StrictMode from rotating the cookie twice.
const sessionStore = createSession(authService)
configureApi({
  tokenGetter: () => sessionStore.getSnapshot().token,
  sessionGetter: () => sessionStore.getSnapshot().version,
  refreshHandler: sessionStore.refresh,
  unauthorizedHandler: sessionStore.clear,
})

export function AuthProvider({ children }) {
  const { token, isLoading, isLoggingOut, error } = useSyncExternalStore(
    sessionStore.subscribe, sessionStore.getSnapshot,
  )
  const [profile, setProfile] = useState(null)
  const session = useMemo(() => sessionFromToken(token), [token])

  useEffect(() => {
    try {
      localStorage.removeItem('brava.token')
    } catch {
      // Storage may be unavailable; the new session never depends on it.
    }
    void sessionStore.initialize()
  }, [])

  useEffect(() => {
    if (!session) return undefined
    const timer = setTimeout(() => {
      // The session owner clears state if renewal fails.
      void sessionStore.refresh().catch(() => {})
    }, Math.max(0, session.expiresAt - Date.now()))
    return () => clearTimeout(timer)
  }, [session])

  useEffect(() => {
    setProfile(null)
    if (!token) return undefined
    let cancelled = false
    authService.getMe()
      .then((me) => { if (!cancelled) setProfile(me) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [token])

  const login = useCallback(async (email, password) => {
    const result = await sessionStore.login(email, password)
    return sessionFromToken(result.access_token)
  }, [])

  const value = useMemo(() => ({
    user: session ? { ...profile, id: session.id, role: session.role } : null,
    role: session?.role ?? null,
    isAuthenticated: Boolean(session),
    isLoading: isLoading || isLoggingOut,
    isLoggingOut,
    sessionError: error,
    login,
    logout: sessionStore.logout,
  }), [session, profile, isLoading, isLoggingOut, error, login])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

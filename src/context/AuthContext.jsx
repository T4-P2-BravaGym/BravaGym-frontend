import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { configureApi } from '@/services/api'
import * as authService from '@/services/auth'
import { sessionFromToken } from '@/utils/token'

export const AuthContext = createContext(null)

const TOKEN_KEY = 'brava.token'

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function writeToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
  }
}

function readValidToken() {
  const token = readToken()
  if (token && sessionFromToken(token)) return token
  writeToken(null)
  return null
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readValidToken)
  const [profile, setProfile] = useState(null)
  const session = useMemo(() => sessionFromToken(token), [token])

  const logout = useCallback(() => {
    writeToken(null)
    setToken(null)
    setProfile(null)
  }, [])

  useEffect(() => {
    configureApi({ tokenGetter: () => token, unauthorizedHandler: logout })
  }, [token, logout])

  useEffect(() => {
    if (!session) return undefined
    const timer = setTimeout(logout, session.expiresAt - Date.now())
    return () => clearTimeout(timer)
  }, [session, logout])

  useEffect(() => {
    if (!token) return undefined
    let cancelled = false
    authService
        .getMe()
        .then((me) => {
          if (!cancelled) setProfile(me)
        })
        .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [token])

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password)
    writeToken(result.access_token)
    setToken(result.access_token)
    return sessionFromToken(result.access_token)
  }, [])

  const value = useMemo(() => {
    const user = session ? { ...profile, id: session.id, role: session.role } : null
    return {
      user,
      role: session?.role ?? null,
      isAuthenticated: Boolean(session),
      isLoading: false,
      login,
      logout,
    }
  }, [session, profile, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { configureApi } from '@/services/api'
import * as authService from '@/services/auth'

export const AuthContext = createContext(null)

const TOKEN_KEY = 'brava.token'

// localStorage can throw (private mode, blocked storage): never let that break the app.
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
    // ignore: the session just will not survive a reload
  }
}

/**
 * Keeps the session: token, current user and role (HU-03).
 * The token lives in localStorage, readable by any script on the page (XSS),
 * so never use dangerouslySetInnerHTML with user data.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(readToken()))

  const logout = useCallback(() => {
    writeToken(null)
    setToken(null)
    setUser(null)
  }, [])

  // The API client reads the token and logs out on 401.
  useEffect(() => {
    configureApi({ tokenGetter: () => token, unauthorizedHandler: logout })
  }, [token, logout])

  // On start (or after login) load the current user from /users/me.
  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    let cancelled = false
    setIsLoading(true)
    authService
      .getMe()
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {
        if (!cancelled) logout()
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, logout])

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password)
    writeToken(result.access_token)
    setToken(result.access_token)
  }, [])

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

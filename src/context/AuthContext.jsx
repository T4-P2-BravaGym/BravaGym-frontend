import { createContext, useMemo, useState } from 'react'

export const AuthContext = createContext(null)

/**
 * Keeps the session: token, current user and role.
 * TODO(HU-03): login(email, password) calls services/auth.js and stores the token;
 * logout() clears it; load the current user from /users/me on start.
 * Remember: the token in localStorage can be read by any script (XSS), so never use
 * dangerouslySetInnerHTML with user data.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: async () => {
        throw new Error('TODO(HU-03)')
      },
      logout: () => setUser(null),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

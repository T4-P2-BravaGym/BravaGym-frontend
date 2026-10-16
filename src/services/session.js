const LOGOUT_ERROR = 'La sesión se ha borrado de esta página, pero no se ha podido confirmar el cierre en el servidor. Comprueba tu conexión e inténtalo de nuevo.'

/** Own the in-memory session and serialize refresh/logout, independently of React. */
export function createSession(auth) {
  let state = { token: null, isLoading: true, isLoggingOut: false, error: null, version: 0 }
  let generation = 0
  let renewal = null
  let initialization = null
  let logoutPending = null
  let logoutToken = null
  const listeners = new Set()

  function update(changes) {
    state = { ...state, ...changes }
    listeners.forEach((listener) => listener())
  }

  function clear() {
    generation++
    update({ token: null, isLoading: false, version: generation })
  }

  function refresh() {
    if (logoutPending) return Promise.reject(new Error('Cerrando sesión.'))
    if (renewal) return renewal
    const started = generation
    renewal = auth.refresh()
      .then((result) => {
        if (started === generation) update({ token: result.access_token, error: null })
        return result.access_token
      })
      .catch((error) => {
        if (started === generation) clear()
        throw error
      })
      .finally(() => { renewal = null })
    return renewal
  }

  function initialize() {
    if (!initialization) {
      initialization = refresh()
        .catch(() => null) // An absent/expired cookie means the visitor is anonymous.
        .finally(() => update({ isLoading: false }))
    }
    return initialization
  }

  async function login(email, password) {
    // Finish cookie-changing operations before creating a different session.
    if (logoutPending) await logoutPending
    if (renewal) await renewal.catch(() => null)
    const started = ++generation
    update({ error: null, version: started })
    const result = await auth.login(email, password)
    if (started === generation) {
      logoutToken = null
      update({ token: result.access_token, isLoading: false })
    }
    return result
  }

  function logout() {
    if (logoutPending) return logoutPending
    const oldToken = state.token ?? logoutToken
    const pending = renewal
    clear()
    update({ isLoggingOut: true, error: null })
    logoutPending = Promise.resolve().then(async () => {
      try {
        // A running refresh may have replaced the cookie; revoke that pair instead.
        const latest = pending ? await pending.catch(() => null) : null
        const token = latest ?? oldToken
        logoutToken = token
        if (token) await auth.logout(token)
        logoutToken = null
        return true
      } catch {
        update({ error: LOGOUT_ERROR })
        return false
      } finally {
        update({ isLoggingOut: false })
        logoutPending = null
      }
    })
    return logoutPending
  }

  return {
    getSnapshot: () => state,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
    initialize, login, logout, refresh, clear,
  }
}

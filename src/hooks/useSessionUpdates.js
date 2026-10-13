import { useEffect, useRef } from 'react'
import { watchSession } from '@/services/sessionUpdates'

/**
 * Calls onUpdate(sessionId) when someone books or cancels one of these sessions (HU-16).
 * One websocket per session on screen; they close when the sessions change or the page closes.
 */

export default function useSessionUpdates(sessionIds, onUpdate) {
  // Keep the latest callback without reopening the sockets on every render
  const callback = useRef(onUpdate)
  useEffect(() => {
    callback.current = onUpdate
  })

  const key = sessionIds.join(',')

  useEffect(() => {
    if (!key) return undefined
    const stops = key.split(',').map((id) => watchSession(id, (changedId) => callback.current(changedId)))
    return () => stops.forEach((stop) => stop())
  }, [key])
}
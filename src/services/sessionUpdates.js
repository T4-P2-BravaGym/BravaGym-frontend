/**
 * Live free spots (HU-16): listen to WS /ws/sessions/{id} on the API.
 * The API only says "this session changed"; the page then reloads its data.
 */
import { API_URL } from './api'

// http://localhost:8000/api/v1 -> ws://localhost:8000/api/v1 (https -> wss)
const WS_URL = API_URL.replace(/^http/, 'ws')

/** Opens a websocket for one session. Returns a function that closes it. */
export function watchSession(sessionId, onUpdate) {
  const socket = new WebSocket(`${WS_URL}/ws/sessions/${sessionId}`)
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (message.type === 'session_updated') onUpdate(message.session_id)
  }
  return () => socket.close()
}
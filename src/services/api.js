/**
 * Single HTTP client for the whole app (DRY): every service file uses apiRequest.
 *
 * - Base URL from VITE_API_URL.
 * - Adds "Authorization: Bearer <token>" when there is a session.
 * - Sends JSON (body), a urlencoded form (form) or a multipart form with files (formData).
 * - Throws ApiError with the API's { detail, code } on any error.
 * - On 401 it calls the unauthorized handler (AuthContext logs out).
 * - mediaUrl() turns the /media/... paths the API returns into full URLs (HU-30).
 */
export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '')

// Host of the API without /api/v1: uploaded files (HU-30) are served from /media there.
// The base makes it work too if VITE_API_URL is ever a relative path behind a proxy.
export const API_ORIGIN = new URL(API_URL, window.location.origin).origin

const GENERIC_ERROR = 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'
const NETWORK_ERROR = 'No se ha podido conectar con el servidor. Comprueba tu conexión.'

export class ApiError extends Error {
  constructor(status, detail, code) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
    this.code = code
  }
}

// AuthContext registers these, so this file does not depend on React.
let getToken = () => null
let onUnauthorized = () => {}

export function configureApi({ tokenGetter, unauthorizedHandler }) {
  if (tokenGetter) getToken = tokenGetter
  if (unauthorizedHandler) onUnauthorized = unauthorizedHandler
}

/**
 * mediaUrl('/media/products/a.webp') -> 'http://localhost:8000/media/products/a.webp'
 * Absolute, data: and blob: URLs are returned as they are. Null stays null.
 */
export function mediaUrl(path) {
  if (!path) return null
  return path.startsWith('/') ? `${API_ORIGIN}${path}` : path
}

/** { page: 1, status: undefined } -> "?page=1" (empty values are skipped) */
export function buildQuery(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.append(key, String(value))
  })
  const text = query.toString()
  return text ? `?${text}` : ''
}

/**
 * apiRequest('/bookings/me')
 * apiRequest('/sessions/3/bookings', { method: 'POST' })
 * apiRequest('/auth/login', { method: 'POST', form: { username, password }, auth: false })
 * apiRequest('/products/3/image', { method: 'PUT', formData })
 */
export async function apiRequest(path, { method = 'GET', body, form, formData, auth = true, signal } = {}) {
  const headers = { Accept: 'application/json' }
  let payload

  if (formData) {
    // No Content-Type here: the browser sets multipart/form-data with its boundary.
    payload = formData
  } else if (form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    payload = new URLSearchParams(form).toString()
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, body: payload, signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(0, NETWORK_ERROR, 'network_error')
  }

  if (response.status === 204) return null

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    if (response.status === 401 && auth) onUnauthorized()
    throw new ApiError(response.status, readDetail(data), data?.code)
  }
  return data
}

/**
 * apiDownload('/payments/export?status=paid')
 * Fetches a non-JSON body (CSV, file) as a Blob. Same auth and error rules as apiRequest.
 * Returns `{ blob, filename }` — filename comes from Content-Disposition when present.
 */
export async function apiDownload(path, { method = 'GET', auth = true, signal, fallbackFilename = 'download' } = {}) {
  const headers = { Accept: '*/*' }
  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(0, NETWORK_ERROR, 'network_error')
  }

  if (!response.ok) {
    if (response.status === 401 && auth) onUnauthorized()
    const isJson = response.headers.get('content-type')?.includes('application/json')
    const data = isJson ? await response.json().catch(() => null) : null
    throw new ApiError(response.status, readDetail(data), data?.code)
  }

  const blob = await response.blob()
  const filename = filenameFromContentDisposition(response.headers.get('content-disposition')) ?? fallbackFilename
  return { blob, filename }
}

function filenameFromContentDisposition(header) {
  if (!header) return null
  const utf = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (utf?.[1]) {
    try {
      return decodeURIComponent(utf[1].trim())
    } catch {
      return utf[1].trim()
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header)
  return plain?.[1]?.trim() || null
}

// FastAPI sends a string, or a list of field errors for 422.
function readDetail(data) {
  const detail = data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail[0]?.msg) return 'Revisa los datos del formulario.'
  return GENERIC_ERROR
}
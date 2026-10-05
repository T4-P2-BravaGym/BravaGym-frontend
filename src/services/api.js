/**
 * Single HTTP client for the whole app (DRY): every service file uses it.
 *
 * TODO(HU-00):
 * - Base URL from import.meta.env.VITE_API_URL.
 * - Add "Authorization: Bearer <token>" when there is a session.
 * - Parse JSON; on error throw an ApiError with the API's { detail, code }.
 * - On 401: log out and go to /login.
 * - Never show technical details to the user: show the API's detail message.
 */
export const API_URL = import.meta.env.VITE_API_URL

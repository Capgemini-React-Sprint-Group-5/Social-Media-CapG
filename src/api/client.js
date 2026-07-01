import axios from 'axios'

/**
 * api/client.js
 * Central Axios instance. Import this (not raw axios) in every api file.
 *
 * The backend always responds with one of two envelopes:
 *   { status: "success", data: { ... } | [ ... ] }
 *   { status: "success", message: "Operation completed." }
 *
 * The response interceptor below unwraps this so hooks receive
 * the inner `data` or `message` directly — no envelope drilling in components.
 */

const client = axios.create({
  // Vite proxy handles /api/* during dev (see vite.config.js).
  // In production, set VITE_API_BASE_URL in .env.
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

// ── Response interceptor ───────────────────────────────────────────────────
client.interceptors.response.use(
  (response) => {
    // Unwrap the envelope: return data if present, else message string
    const body = response.data
    if (body?.data !== undefined) return body.data
    if (body?.message !== undefined) return body.message
    return body
  },
  (error) => {
    // Normalise error shape so hooks can do: error.status, error.message
    const normalised = {
      status:  error.response?.status,
      message: error.response?.data?.message || error.message || 'Unknown error',
    }
    return Promise.reject(normalised)
  }
)

export default client

// API utility with timeout, error handling, and CSRF support
// EN-07, EN-08, EN-16

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT) || 10000

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function request(method, path, body = null) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const headers = { 'Content-Type': 'application/json' }

    // EN-16: CSRF token from meta tag (set by server)
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      credentials: 'same-origin',
      signal: controller.signal,
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new ApiError(data?.message || `请求失败 (${res.status})`, res.status, data)
    }

    return await res.json()
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('请求超时，请检查网络后重试', 0, null)
    }
    if (err instanceof ApiError) throw err
    throw new ApiError('网络异常，请检查网络连接', 0, null)
  } finally {
    clearTimeout(timeout)
  }
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
}

export { ApiError, API_BASE, TIMEOUT_MS }

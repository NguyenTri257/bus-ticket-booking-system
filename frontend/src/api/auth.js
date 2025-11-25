const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const REFRESH_TOKEN_KEY = 'refreshToken'

let accessTokenInMemory = null

const setAccessToken = (token) => {
  accessTokenInMemory = token ?? null
}

export const getAccessToken = () => accessTokenInMemory
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

export function clearTokens() {
  setAccessToken(null)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

function buildHeaders(extraHeaders = {}, token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  }
}

function buildUrl(path, query) {
  const url = new URL(path, API_BASE_URL)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      url.searchParams.set(key, `${value}`)
    })
  }
  return url.toString()
}

async function request(path, { body, token, method = 'POST', query, ...options } = {}) {
  let response
  try {
    const url = buildUrl(path, query)
    response = await fetch(url, {
      method,
      credentials: 'include',
      headers: buildHeaders(options.headers, token),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    })
  } catch (networkError) {
    const error = new Error(networkError?.message || 'Failed to fetch')
    error.code = 'NETWORK_ERROR'
    throw error
  }

  let data = null
  try {
    data = await response.json()
  } catch (error) {
    data = null
  }

  const isError = !response.ok || (data && data.success === false)
  if (isError) {
    const message = data?.error?.message || 'Unable to complete the request. Please try again.'
    const error = new Error(message)
    error.code = data?.error?.code || response.status
    throw error
  }

  return data
}

export async function login({ identifier, password }) {
  const payload = { identifier, password }
  const response = await request('/auth/login', { body: payload })
  return response?.data
}

export async function registerAccount({ email, phone, password, fullName, role = 'passenger' }) {
  const payload = { email, phone, password, fullName, role }
  const response = await request('/auth/register', { body: payload })
  return response?.data
}

export async function loginWithGoogle({ idToken }) {
  const payload = { idToken }
  const response = await request('/auth/oauth/google', { body: payload })
  return response?.data
}

export async function requestPasswordReset({ email }) {
  const payload = { email }
  const response = await request('/auth/forgot-password', { body: payload })
  return response?.data
}

export async function verifyEmailToken({ token }) {
  const response = await request('/auth/verify-email', {
    method: 'GET',
    query: { token },
  })
  return response
}

export async function resendVerificationEmail({ email }) {
  const payload = { email }
  const response = await request('/auth/resend-verification', { body: payload })
  return response
}

export function storeTokens({ accessToken, refreshToken }) {
  if (accessToken) {
    setAccessToken(accessToken)
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export { API_BASE_URL }

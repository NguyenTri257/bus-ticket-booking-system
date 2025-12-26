import { getAccessToken } from '@/api/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type Json = Record<string, unknown>

type ApiErrorResponse = {
  message?: string
  error?: { details?: unknown; code?: string }
}

type ErrorWithDetails = Error & {
  details?: unknown
  code?: string
}

export async function postJSON<T extends Json = Json>(
  path: string,
  payload?: Json,
  init?: RequestInit
): Promise<T> {
  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
    ...init,
  })

  const data = (await response.json().catch(() => ({}))) as T & ApiErrorResponse

  if (!response.ok) {
    console.log('API Error Response:', { status: response.status, data })
    const error = new Error(
      data?.message ?? 'Something went wrong. Please try again.'
    ) as ErrorWithDetails
    error.details = data?.error?.details
    error.code = data?.error?.code
    console.log('Throwing error with details:', error.details)
    throw error
  }

  return data
}

export { API_BASE_URL }

export type User = {
  sub: string
  email: string
  name?: string
  picture?: string
}

type Envelope<T> = {
  success: boolean
  data?: T
  error?: string
}

export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  const fallback = 'http://localhost:8080'
  return (configured || fallback).replace(/\/+$/, '')
}

export function createApiUrl(path: string) {
  return `${getApiBaseUrl()}${path}`
}

async function readEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as Envelope<T>

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error || 'Request failed')
  }

  return payload.data
}

export async function fetchCurrentUser() {
  const response = await fetch(createApiUrl('/api/v1/auth/me'), {
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }

  return readEnvelope<User>(response)
}

export async function signInWithGoogle(credential: string) {
  const response = await fetch(createApiUrl('/api/v1/auth/google'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ credential }),
  })

  return readEnvelope<User>(response)
}

export async function logout() {
  const response = await fetch(createApiUrl('/api/v1/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  })

  return readEnvelope<{ status: string }>(response)
}


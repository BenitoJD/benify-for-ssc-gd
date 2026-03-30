// Auth utilities for Next.js
// Note: This file replaces the old Vite-based auth.ts

export interface User {
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

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim()
  const fallback = 'http://localhost:3100'
  return (configured || fallback).replace(/\/+$/, '')
}

export function createApiUrl(path: string): string {
  return `${getApiBaseUrl()}${path}`
}

async function readEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as Envelope<T>

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error || 'Request failed')
  }

  return payload.data
}

export async function fetchCurrentUser(): Promise<User | null> {
  const response = await fetch(createApiUrl('/api/v1/auth/me'), {
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }

  return readEnvelope<User>(response)
}

export async function signInWithGoogle(credential: string): Promise<User> {
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

export async function logout(): Promise<{ status: string }> {
  const response = await fetch(createApiUrl('/api/v1/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  })

  return readEnvelope<{ status: string }>(response)
}

// Auth utilities for Next.js
// Note: This file replaces the old Vite-based auth.ts

// Backend API response types
export interface ApiUser {
  id: string
  email: string
  name?: string
  phone?: string
  avatar_url?: string
  role: string
  language_preference: string
  subscription_status: string
  created_at: string
  updated_at?: string
}

export interface ApiTokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

type Envelope<T> = {
  success: boolean
  data?: T
  error?: string
}

// Frontend User type (uses different field names than API)
export interface User {
  sub: string
  email: string
  name?: string
  picture?: string
}

// Transform API user to frontend user
function transformUser(apiUser: ApiUser): User {
  return {
    sub: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    picture: apiUser.avatar_url,
  }
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

  // The API returns User directly, not wrapped in envelope
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload.detail || 'Request failed')
  }

  return transformUser(payload as ApiUser)
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

  // The API returns TokenResponse + sets cookie, then we need to fetch user
  if (!response.ok) {
    const payload = await response.json()
    throw new Error(payload.detail || 'Google sign-in failed')
  }

  // After successful Google auth, fetch the user info
  const user = await fetchCurrentUser()
  if (!user) {
    throw new Error('Failed to fetch user after Google sign-in')
  }
  return user
}

export async function logout(): Promise<{ status: string }> {
  const response = await fetch(createApiUrl('/api/v1/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  })

  return readEnvelope<{ status: string }>(response)
}

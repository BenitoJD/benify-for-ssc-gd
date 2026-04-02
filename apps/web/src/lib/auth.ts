// Auth utilities for Next.js
// Note: This file replaces the old Vite-based auth.ts
import apiClient from './api/client'
import { clearStudentSession } from './session'

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

  if (configured) {
    const normalized = configured.replace(/\/+$/, '')

    if (normalized.endsWith('/api/v1')) {
      return normalized
    }

    if (normalized.endsWith('/api')) {
      return `${normalized}/v1`
    }

    return `${normalized}/api/v1`
  }

  return 'http://localhost:3100/api/v1'
}

export function createApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (baseUrl.endsWith('/api/v1') && normalizedPath.startsWith('/api/v1/')) {
    return `${baseUrl}${normalizedPath.slice('/api/v1'.length)}`
  }

  return `${baseUrl}${normalizedPath}`
}

async function readEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as Envelope<T>

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error || 'Request failed')
  }

  return payload.data
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get('/auth/me')
    return transformUser(response.data as ApiUser)
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      (error as { response?: { status?: number } }).response?.status === 401
    ) {
      clearStudentSession()
      return null
    }

    throw error
  }
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

  await response.json() as ApiTokenResponse

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

  clearStudentSession()

  return readEnvelope<{ status: string }>(response)
}

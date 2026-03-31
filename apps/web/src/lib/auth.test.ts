import { describe, expect, it, vi } from 'vitest'

import { createApiUrl } from './auth'

describe('createApiUrl', () => {
  it('appends the path to the configured API base url', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8080/')

    expect(createApiUrl('/api/v1/auth/me')).toBe('http://localhost:8080/api/v1/auth/me')
  })

  it('falls back to localhost when the env var is missing', () => {
    vi.unstubAllEnvs()

    expect(createApiUrl('/healthz')).toBe('http://localhost:3100/healthz')
  })
})


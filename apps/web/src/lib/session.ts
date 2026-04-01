const STUDENT_ACCESS_TOKEN_KEY = 'student_access_token'
const STUDENT_REFRESH_TOKEN_KEY = 'student_refresh_token'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getStudentAccessToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(STUDENT_ACCESS_TOKEN_KEY)
}

export function getStudentRefreshToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(STUDENT_REFRESH_TOKEN_KEY)
}

export function storeStudentTokens(accessToken: string, refreshToken: string): void {
  if (!isBrowser()) return
  localStorage.setItem(STUDENT_ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(STUDENT_REFRESH_TOKEN_KEY, refreshToken)
}

export function clearStudentSession(): void {
  if (!isBrowser()) return
  localStorage.removeItem(STUDENT_ACCESS_TOKEN_KEY)
  localStorage.removeItem(STUDENT_REFRESH_TOKEN_KEY)
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getStudentAccessToken(): string | null {
  return null
}

export function storeStudentTokens(_accessToken?: string, _refreshToken?: string): void {
  if (!isBrowser()) return
  localStorage.removeItem('student_access_token')
  localStorage.removeItem('student_refresh_token')
}

export function clearStudentSession(): void {
  if (!isBrowser()) return
  localStorage.removeItem('student_access_token')
  localStorage.removeItem('student_refresh_token')
}

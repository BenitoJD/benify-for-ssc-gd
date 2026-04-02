import axios from 'axios'
import {
  clearStudentSession,
} from '@/lib/session'

function resolveApiBaseUrl(): string {
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

const API_BASE_URL = resolveApiBaseUrl()

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const requestUrl = originalRequest?.url || ''
    const shouldSkipRefresh =
      requestUrl.startsWith('/auth/login') ||
      requestUrl.startsWith('/auth/register') ||
      requestUrl.startsWith('/auth/refresh') ||
      requestUrl.startsWith('/admin/login')

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      originalRequest._retry = true

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        void refreshResponse
        return apiClient(originalRequest)
      } catch (refreshError) {
        clearStudentSession()
        if (typeof window !== 'undefined') {
          window.location.href = requestUrl.startsWith('/admin') ? '/admin/login' : '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

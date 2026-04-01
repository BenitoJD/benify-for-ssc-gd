import apiClient from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'instructor' | 'admin' | 'super_admin'
  phone?: string
  avatar_url?: string
  language_preference: 'en'
  subscription_status: 'free' | 'premium' | 'cancelled'
  created_at: string
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  refresh: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh')
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  googleAuth: async (credential: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/google', { credential })
    return response.data
  },
}

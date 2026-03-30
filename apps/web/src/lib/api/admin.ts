import apiClient from './client'

export interface AdminUser {
  id: string
  email: string
  name?: string
  role: 'student' | 'instructor' | 'admin' | 'super_admin'
  subscription_status: 'free' | 'premium' | 'cancelled'
  created_at: string
  last_login_at?: string
  is_active: boolean
}

export interface AdminDashboardStats {
  total_users: number
  active_subscriptions: number
  daily_active_users: number
  reports_count: number
  total_lessons_completed: number
  total_tests_taken: number
}

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminLoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: {
    id: string
    email: string
    name?: string
    role: string
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const adminApi = {
  login: async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await apiClient.post<AdminLoginResponse>('/admin/login', data)
    return response.data
  },

  getDashboard: async (): Promise<{
    stats: AdminDashboardStats
    recent_registrations: AdminUser[]
    recent_activity: unknown[]
  }> => {
    const response = await apiClient.get('/admin/dashboard')
    return response.data
  },

  listUsers: async (params: {
    page?: number
    limit?: number
    search?: string
    role?: string
  }): Promise<PaginatedResponse<AdminUser>> => {
    const response = await apiClient.get('/admin/users', { params })
    return response.data
  },

  getUser: async (userId: string): Promise<AdminUser & { profile?: unknown; stats?: unknown }> => {
    const response = await apiClient.get(`/admin/users/${userId}`)
    return response.data
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<{
    id: string
    is_active: boolean
    message: string
  }> => {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { is_active: isActive })
    return response.data
  },
}

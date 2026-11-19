import apiClient from './client'
import type { LoginCredentials, AuthResponse } from '@/types/auth'
import type { ApiResponse } from '@/types/api'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    return res.data.data
  },
  getCurrentUser: async () => {
    const res = await apiClient.get<ApiResponse<any>>('/auth/me')
    return res.data.data
  },
  logout: async () => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
}

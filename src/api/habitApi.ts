import apiClient from './client'
import type {
  Habit,
  HabitRequest,
  CheckinRequest,
  TodayHabit,
  HabitStatistics
} from '@/types/habit'
import type { ApiResponse } from '@/types/api'

export const habitApi = {
  getHabits: async (params?: { goalId?: string; activeOnly?: boolean }): Promise<Habit[]> => {
    const res = await apiClient.get<ApiResponse<Habit[]>>('/habits', { params })
    return res.data.data
  },

  getTodayHabits: async (): Promise<TodayHabit[]> => {
    const res = await apiClient.get<ApiResponse<TodayHabit[]>>('/habits/today')
    return res.data.data
  },

  getStatistics: async (): Promise<HabitStatistics> => {
    const res = await apiClient.get<ApiResponse<HabitStatistics>>('/habits/statistics')
    return res.data.data
  },

  getHabitById: async (id: string): Promise<Habit> => {
    const res = await apiClient.get<ApiResponse<Habit>>(`/habits/${id}`)
    return res.data.data
  },

  createHabit: async (data: HabitRequest): Promise<Habit> => {
    const res = await apiClient.post<ApiResponse<Habit>>('/habits', data)
    return res.data.data
  },

  updateHabit: async (id: string, data: HabitRequest): Promise<Habit> => {
    const res = await apiClient.put<ApiResponse<Habit>>(`/habits/${id}`, data)
    return res.data.data
  },

  deleteHabit: async (id: string): Promise<void> => {
    await apiClient.delete(`/habits/${id}`)
  },

  checkin: async (id: string, data?: CheckinRequest): Promise<Habit> => {
    const res = await apiClient.post<ApiResponse<Habit>>(`/habits/${id}/check-ins`, data)
    return res.data.data
  },

  removeCheckin: async (id: string, date: string): Promise<void> => {
    await apiClient.delete(`/habits/${id}/check-ins/${date}`)
  }
}

import apiClient from './client'
import type { MoodEntry, MoodEntryRequest, MoodCalendarDay, MoodStatistics } from '@/types/mood'
import type { ApiResponse } from '@/types/api'

export const moodApi = {
  getMoods: async (params?: { from?: string; to?: string }): Promise<MoodEntry[]> => {
    const res = await apiClient.get<ApiResponse<MoodEntry[]>>('/moods', { params })
    return res.data.data
  },

  getMoodByDate: async (date: string): Promise<MoodEntry | null> => {
    const res = await apiClient.get<ApiResponse<MoodEntry | null>>(`/moods/by-date/${date}`)
    return res.data.data
  },

  getMoodById: async (id: string): Promise<MoodEntry> => {
    const res = await apiClient.get<ApiResponse<MoodEntry>>(`/moods/${id}`)
    return res.data.data
  },

  saveMood: async (data: MoodEntryRequest): Promise<MoodEntry> => {
    const res = await apiClient.post<ApiResponse<MoodEntry>>('/moods', data)
    return res.data.data
  },

  updateMood: async (id: string, data: MoodEntryRequest): Promise<MoodEntry> => {
    const res = await apiClient.put<ApiResponse<MoodEntry>>(`/moods/${id}`, data)
    return res.data.data
  },

  deleteMood: async (id: string): Promise<void> => {
    await apiClient.delete(`/moods/${id}`)
  },

  getCalendar: async (params?: { from?: string; to?: string }): Promise<MoodCalendarDay[]> => {
    const res = await apiClient.get<ApiResponse<MoodCalendarDay[]>>('/moods/calendar', { params })
    return res.data.data
  },

  getStatistics: async (params?: { from?: string; to?: string }): Promise<MoodStatistics> => {
    const res = await apiClient.get<ApiResponse<MoodStatistics>>('/moods/statistics', { params })
    return res.data.data
  }
}

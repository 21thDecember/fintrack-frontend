import apiClient from './client'
import type { DailyJournal, DailyJournalRequest, JournalCalendarDay } from '@/types/journal'
import type { ApiResponse, PageResponse } from '@/types/api'

export const journalApi = {
  getJournals: async (params?: { from?: string; to?: string; keyword?: string; page?: number; size?: number }): Promise<PageResponse<DailyJournal>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<DailyJournal>>>('/journals', { params })
    return res.data.data
  },

  getJournalById: async (id: string): Promise<DailyJournal> => {
    const res = await apiClient.get<ApiResponse<DailyJournal>>(`/journals/${id}`)
    return res.data.data
  },

  getJournalByDate: async (date: string): Promise<DailyJournal | null> => {
    const res = await apiClient.get<ApiResponse<DailyJournal | null>>(`/journals/by-date/${date}`)
    return res.data.data
  },

  saveJournal: async (data: DailyJournalRequest): Promise<DailyJournal> => {
    const res = await apiClient.post<ApiResponse<DailyJournal>>('/journals', data)
    return res.data.data
  },

  updateJournal: async (id: string, data: DailyJournalRequest): Promise<DailyJournal> => {
    const res = await apiClient.put<ApiResponse<DailyJournal>>(`/journals/${id}`, data)
    return res.data.data
  },

  deleteJournal: async (id: string): Promise<void> => {
    await apiClient.delete(`/journals/${id}`)
  },

  getCalendar: async (params?: { from?: string; to?: string }): Promise<JournalCalendarDay[]> => {
    const res = await apiClient.get<ApiResponse<JournalCalendarDay[]>>('/journals/calendar', { params })
    return res.data.data
  }
}

import apiClient from './client'
import type { WeeklyReview, WeeklyReviewRequest, WeeklySummary } from '@/types/review'
import type { ApiResponse, PageResponse } from '@/types/api'

export const reviewApi = {
  getReviews: async (params?: { page?: number; size?: number }): Promise<PageResponse<WeeklyReview>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<WeeklyReview>>>('/weekly-reviews', { params })
    return res.data.data
  },

  getReviewById: async (id: string): Promise<WeeklyReview> => {
    const res = await apiClient.get<ApiResponse<WeeklyReview>>(`/weekly-reviews/${id}`)
    return res.data.data
  },

  getReviewByWeek: async (date: string): Promise<WeeklyReview | null> => {
    const res = await apiClient.get<ApiResponse<WeeklyReview | null>>(`/weekly-reviews/by-week/${date}`)
    return res.data.data
  },

  saveReview: async (data: WeeklyReviewRequest): Promise<WeeklyReview> => {
    const res = await apiClient.post<ApiResponse<WeeklyReview>>('/weekly-reviews', data)
    return res.data.data
  },

  updateReview: async (id: string, data: WeeklyReviewRequest): Promise<WeeklyReview> => {
    const res = await apiClient.put<ApiResponse<WeeklyReview>>(`/weekly-reviews/${id}`, data)
    return res.data.data
  },

  completeReview: async (id: string): Promise<WeeklyReview> => {
    const res = await apiClient.patch<ApiResponse<WeeklyReview>>(`/weekly-reviews/${id}/complete`)
    return res.data.data
  },

  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/weekly-reviews/${id}`)
  },

  getWeeklySummary: async (date?: string): Promise<WeeklySummary> => {
    const res = await apiClient.get<ApiResponse<WeeklySummary>>('/weekly-reviews/summary', { params: { date } })
    return res.data.data
  }
}

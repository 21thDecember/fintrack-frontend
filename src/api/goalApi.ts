import apiClient from './client'
import type {
  Goal,
  GoalRequest,
  Milestone,
  MilestoneRequest,
  GoalProgress,
  GoalStatistics,
  GoalCategory,
  GoalStatus,
  GoalPriority
} from '@/types/goal'
import type { ApiResponse } from '@/types/api'

export const goalApi = {
  getGoals: async (params?: { category?: GoalCategory; status?: GoalStatus; priority?: GoalPriority }): Promise<Goal[]> => {
    const res = await apiClient.get<ApiResponse<Goal[]>>('/goals', { params })
    return res.data.data
  },

  getGoalById: async (id: string): Promise<Goal> => {
    const res = await apiClient.get<ApiResponse<Goal>>(`/goals/${id}`)
    return res.data.data
  },

  createGoal: async (data: GoalRequest): Promise<Goal> => {
    const res = await apiClient.post<ApiResponse<Goal>>('/goals', data)
    return res.data.data
  },

  updateGoal: async (id: string, data: GoalRequest): Promise<Goal> => {
    const res = await apiClient.put<ApiResponse<Goal>>(`/goals/${id}`, data)
    return res.data.data
  },

  deleteGoal: async (id: string): Promise<void> => {
    await apiClient.delete(`/goals/${id}`)
  },

  createMilestone: async (goalId: string, data: MilestoneRequest): Promise<Milestone> => {
    const res = await apiClient.post<ApiResponse<Milestone>>(`/goals/${goalId}/milestones`, data)
    return res.data.data
  },

  updateMilestone: async (goalId: string, milestoneId: string, data: MilestoneRequest): Promise<Milestone> => {
    const res = await apiClient.put<ApiResponse<Milestone>>(`/goals/${goalId}/milestones/${milestoneId}`, data)
    return res.data.data
  },

  deleteMilestone: async (goalId: string, milestoneId: string): Promise<void> => {
    await apiClient.delete(`/goals/${goalId}/milestones/${milestoneId}`)
  },

  getProgress: async (id: string): Promise<GoalProgress> => {
    const res = await apiClient.get<ApiResponse<GoalProgress>>(`/goals/${id}/progress`)
    return res.data.data
  },

  getStatistics: async (): Promise<GoalStatistics> => {
    const res = await apiClient.get<ApiResponse<GoalStatistics>>('/goals/statistics')
    return res.data.data
  }
}

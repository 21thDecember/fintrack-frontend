import apiClient from './client'
import type { Task, TaskRequest, TaskStatusUpdateRequest, TaskStatistics, TaskFilterParams } from '@/types/task'
import type { ApiResponse, PageResponse } from '@/types/api'

export const taskApi = {
  getTasks: async (params?: TaskFilterParams): Promise<PageResponse<Task>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Task>>>('/tasks', { params })
    return res.data.data
  },

  getTaskById: async (id: string): Promise<Task> => {
    const res = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`)
    return res.data.data
  },

  createTask: async (data: TaskRequest): Promise<Task> => {
    const res = await apiClient.post<ApiResponse<Task>>('/tasks', data)
    return res.data.data
  },

  updateTask: async (id: string, data: TaskRequest): Promise<Task> => {
    const res = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data)
    return res.data.data
  },

  updateStatus: async (id: string, data: TaskStatusUpdateRequest): Promise<Task> => {
    const res = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/status`, data)
    return res.data.data
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`)
  },

  getStatistics: async (): Promise<TaskStatistics> => {
    const res = await apiClient.get<ApiResponse<TaskStatistics>>('/tasks/statistics')
    return res.data.data
  }
}

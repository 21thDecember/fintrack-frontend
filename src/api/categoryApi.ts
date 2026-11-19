import apiClient from './client'
import type { Category, CreateCategoryDto, UpdateCategoryDto, CategoryType } from '@/types/category'
import type { ApiResponse } from '@/types/api'

export const categoryApi = {
  getCategories: async (type?: CategoryType): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories', {
      params: { type }
    })
    return res.data.data
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const res = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`)
    return res.data.data
  },

  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    const res = await apiClient.post<ApiResponse<Category>>('/categories', data)
    return res.data.data
  },

  updateCategory: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const res = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data)
    return res.data.data
  },

  toggleActive: async (id: string, isActive: boolean): Promise<Category> => {
    const res = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}/status`, { isActive })
    return res.data.data
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  }
}

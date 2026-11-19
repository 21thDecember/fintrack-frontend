import apiClient from './client'
import type { Budget, SetBudgetDto } from '@/types/budget'
import type { ApiResponse } from '@/types/api'

export const budgetApi = {
  getBudgets: async (year: number, month: number): Promise<Budget[]> => {
    const res = await apiClient.get<ApiResponse<Budget[]>>('/budgets', {
      params: { year, month }
    })
    return res.data.data
  },

  setBudget: async (data: SetBudgetDto): Promise<Budget> => {
    const res = await apiClient.post<ApiResponse<Budget>>('/budgets', data)
    return res.data.data
  }
}

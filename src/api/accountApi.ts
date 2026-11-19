import apiClient from './client'
import type { Account, CreateAccountDto, UpdateAccountDto } from '@/types/account'
import type { ApiResponse } from '@/types/api'

export const accountApi = {
  getAccounts: async (activeOnly = false): Promise<Account[]> => {
    const res = await apiClient.get<ApiResponse<Account[]>>('/accounts', {
      params: { activeOnly }
    })
    return res.data.data
  },

  getAccountById: async (id: string): Promise<Account> => {
    const res = await apiClient.get<ApiResponse<Account>>(`/accounts/${id}`)
    return res.data.data
  },

  createAccount: async (data: CreateAccountDto): Promise<Account> => {
    const res = await apiClient.post<ApiResponse<Account>>('/accounts', data)
    return res.data.data
  },

  updateAccount: async (id: string, data: UpdateAccountDto): Promise<Account> => {
    const res = await apiClient.put<ApiResponse<Account>>(`/accounts/${id}`, data)
    return res.data.data
  },

  toggleActive: async (id: string, isActive: boolean): Promise<Account> => {
    const res = await apiClient.patch<ApiResponse<Account>>(`/accounts/${id}/status`, { isActive })
    return res.data.data
  },

  deleteAccount: async (id: string): Promise<void> => {
    await apiClient.delete(`/accounts/${id}`)
  }
}

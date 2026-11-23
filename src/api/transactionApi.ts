import apiClient from './client'
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilterParams,
  ClassificationStatus
} from '@/types/transaction'
import type { ApiResponse, PageResponse } from '@/types/api'

export const transactionApi = {
  getTransactions: async (params?: TransactionFilterParams): Promise<PageResponse<Transaction>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Transaction>>>('/transactions', {
      params
    })
    return res.data.data
  },

  getTransactionById: async (id: string): Promise<Transaction> => {
    const res = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`)
    return res.data.data
  },

  createTransaction: async (data: CreateTransactionDto): Promise<Transaction> => {
    const res = await apiClient.post<ApiResponse<Transaction>>('/transactions', data)
    return res.data.data
  },

  updateTransaction: async (id: string, data: UpdateTransactionDto): Promise<Transaction> => {
    const res = await apiClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, data)
    return res.data.data
  },

  updateClassification: async (id: string, categoryId: string, status: ClassificationStatus = 'CLASSIFIED'): Promise<Transaction> => {
    const res = await apiClient.patch<ApiResponse<Transaction>>(`/transactions/${id}/classification`, {
      categoryId,
      classificationStatus: status
    })
    return res.data.data
  },

  updateNote: async (id: string, note?: string): Promise<Transaction> => {
    const res = await apiClient.patch<ApiResponse<Transaction>>(`/transactions/${id}/note`, {
      note
    })
    return res.data.data
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`)
  }
}

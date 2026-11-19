import apiClient from './client'
import type {
  Debt,
  CreateDebtDto,
  RecordDebtPaymentDto,
  DebtFilterParams
} from '@/types/debt'
import type { ApiResponse, PageResponse } from '@/types/api'

export const debtApi = {
  getDebts: async (params?: DebtFilterParams): Promise<PageResponse<Debt>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Debt>>>('/debts', {
      params
    })
    return res.data.data
  },

  getDebtById: async (id: string): Promise<Debt> => {
    const res = await apiClient.get<ApiResponse<Debt>>(`/debts/${id}`)
    return res.data.data
  },

  createDebt: async (data: CreateDebtDto): Promise<Debt> => {
    const res = await apiClient.post<ApiResponse<Debt>>('/debts', data)
    return res.data.data
  },

  recordPayment: async (debtId: string, data: RecordDebtPaymentDto): Promise<Debt> => {
    const res = await apiClient.post<ApiResponse<Debt>>(`/debts/${debtId}/payments`, data)
    return res.data.data
  },

  cancelDebt: async (debtId: string): Promise<Debt> => {
    const res = await apiClient.post<ApiResponse<Debt>>(`/debts/${debtId}/cancel`)
    return res.data.data
  },

  getSummary: async (): Promise<import('@/types/debt').DebtSummary> => {
    const res = await apiClient.get<ApiResponse<import('@/types/debt').DebtSummary>>('/debts/summary')
    return res.data.data
  },

  getSummaryByPerson: async (): Promise<import('@/types/debt').PersonDebtSummary[]> => {
    const res = await apiClient.get<ApiResponse<import('@/types/debt').PersonDebtSummary[]>>('/debts/by-person')
    return res.data.data
  }
}

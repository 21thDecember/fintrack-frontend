import apiClient from './client'
import type { ApiResponse } from '@/types/api'

export interface ClassificationRule {
  id: string
  keyword: string
  categoryId: string
  categoryName?: string
  priority: number
}

const defaultRules: ClassificationRule[] = [
  { id: '1', keyword: 'GRAB', categoryId: 'cat-exp-2', categoryName: 'Di chuyển', priority: 1 },
  { id: '2', keyword: 'SHOPEE', categoryId: 'cat-exp-3', categoryName: 'Mua sắm', priority: 2 },
  { id: '3', keyword: 'EVN', categoryId: 'cat-exp-8', categoryName: 'Hóa đơn & Tiện ích', priority: 3 },
  { id: '4', keyword: 'TIKI', categoryId: 'cat-exp-3', categoryName: 'Mua sắm', priority: 4 },
  { id: '5', keyword: 'HIGHLANDS', categoryId: 'cat-exp-1', categoryName: 'Ăn uống', priority: 5 },
  { id: '6', keyword: 'LUONG', categoryId: 'cat-inc-1', categoryName: 'Lương', priority: 6 }
]

export const settingsApi = {
  getRules: async (): Promise<ClassificationRule[]> => {
    try {
      const res = await apiClient.get<ApiResponse<ClassificationRule[]>>('/settings/classification-rules')
      if (Array.isArray(res.data?.data)) {
        return res.data.data
      }
    } catch {
      // fallback
    }
    return [...defaultRules]
  },

  addRule: async (rule: Omit<ClassificationRule, 'id'>): Promise<ClassificationRule> => {
    try {
      const res = await apiClient.post<ApiResponse<ClassificationRule>>('/settings/classification-rules', rule)
      if (res.data?.data) return res.data.data
    } catch {
      // fallback local
    }
    const newRule = { id: `rule-${Date.now()}`, ...rule }
    defaultRules.push(newRule)
    return newRule
  },

  deleteRule: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/settings/classification-rules/${id}`)
    } catch {
      // fallback local
    }
    const idx = defaultRules.findIndex(r => r.id === id)
    if (idx !== -1) defaultRules.splice(idx, 1)
  }
}

import apiClient from './client'
import type { WeeklyReportData, MonthlyReportData, CategoryBreakdownItem } from '@/types/report'
import type { ApiResponse } from '@/types/api'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)

export const reportApi = {
  getWeeklyReport: async (date?: string): Promise<WeeklyReportData> => {
    const res = await apiClient.get<ApiResponse<any>>('/reports/weekly', {
      params: date ? { date } : {}
    })
    const d = res.data.data || {}

    const categories: CategoryBreakdownItem[] = (d.categoryBreakdown || []).map((c: any) => ({
      categoryId: c.categoryId || String(Math.random()),
      categoryName: c.categoryName || 'Khác',
      icon: c.icon || 'more-horizontal',
      color: c.color || '#6B7280',
      amount: c.amount || 0,
      percentage: c.percentage || 0,
      count: c.count || 1
    }))

    const totalIncome = d.totalIncome || 0
    const grossExpense = d.grossExpense || 0
    const personalExpense = d.personalExpense || 0
    const netCashFlow = d.netCashFlow || 0

    const sDate = d.startDate ? dayjs(d.startDate) : dayjs(date)
    return {
      week: sDate.isoWeek(),
      year: sDate.isoWeekYear(),
      startDate: d.startDate || new Date().toISOString(),
      endDate: d.endDate || new Date().toISOString(),
      totalIncome,
      totalExpense: grossExpense,
      personalExpense,
      cashFlowIn: totalIncome,
      cashFlowOut: grossExpense,
      netCashFlow,
      categories,
      debtActivity: {
        receivablesCollected: 0,
        payablesPaid: 0,
        newReceivables: d.debtAllocations || 0,
        newPayables: 0
      }
    }
  },

  getMonthlyReport: async (month?: number, year?: number): Promise<MonthlyReportData> => {
    const now = dayjs()
    const m = month || (now.month() + 1)
    const y = year || now.year()
    const res = await apiClient.get<ApiResponse<any>>('/reports/monthly', {
      params: { month: m, year: y }
    })
    const d = res.data.data || {}

    const categories: CategoryBreakdownItem[] = (d.categoryBreakdown || []).map((c: any) => ({
      categoryId: c.categoryId || String(Math.random()),
      categoryName: c.categoryName || 'Khác',
      icon: c.icon || 'more-horizontal',
      color: c.color || '#6B7280',
      amount: c.amount || 0,
      percentage: c.percentage || 0,
      count: c.count || 1
    }))

    const totalIncome = d.totalIncome || 0
    const grossExpense = d.grossExpense || 0
    const savingsRate = totalIncome > 0
      ? Math.max(0, Math.min(100, Math.round(((totalIncome - grossExpense) / totalIncome) * 100)))
      : 0

    return {
      month: m,
      year: y,
      totalIncome,
      totalExpense: grossExpense,
      previousMonthIncome: d.previousMonthIncome || 0,
      previousMonthExpense: d.previousMonthExpense || 0,
      comparison: {
        incomeChangePercentage: d.incomeChangePercentage || 0,
        expenseChangePercentage: d.expenseChangePercentage || 0,
        netWorthChangePercentage: 0,
        savingsRate,
        previousMonthSavingsRate: 0
      },
      topExpenseCategories: categories,
      savingsRate,
      netWorthTrend: [
        { period: `T${m - 2 <= 0 ? m - 2 + 12 : m - 2}`, income: 0, expense: 0, netWorth: 0 },
        { period: `T${m - 1 <= 0 ? m - 1 + 12 : m - 1}`, income: d.previousMonthIncome || 0, expense: d.previousMonthExpense || 0, netWorth: 0 },
        { period: `T${m}`, income: totalIncome, expense: grossExpense, netWorth: 0 }
      ]
    }
  }
}

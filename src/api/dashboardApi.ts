import apiClient from './client'
import type { DashboardData } from '@/types/dashboard'
import type { ApiResponse } from '@/types/api'

export const dashboardApi = {
  getDashboardData: async (timeRange: string = 'thisMonth'): Promise<DashboardData> => {
    let period = 'THIS_MONTH'
    if (timeRange === 'today') period = 'TODAY'
    else if (timeRange === 'thisWeek') period = 'THIS_WEEK'
    else if (timeRange === 'lastMonth') period = 'LAST_MONTH'

    const res = await apiClient.get<ApiResponse<any>>('/dashboard', {
      params: { period }
    })
    const d = res.data.data || {}

    return {
      summary: {
        totalBalance: d.totalBalance ?? d.summary?.totalBalance ?? 0,
        totalReceivable: d.totalReceivables ?? d.summary?.totalReceivable ?? 0,
        totalPayable: d.totalPayables ?? d.summary?.totalPayable ?? 0,
        netWorth: d.netWorth ?? d.summary?.netWorth ?? 0,
        totalIncome: d.income ?? d.summary?.totalIncome ?? 0,
        totalExpense: d.grossExpense ?? d.summary?.totalExpense ?? 0,
        balanceDiff: d.netIncome ?? d.summary?.balanceDiff ?? 0,
        unclassifiedCount: d.unclassifiedCount ?? d.summary?.unclassifiedCount ?? 0
      },
      incomeExpenseChart: d.incomeExpenseChart || [],
      categoryExpenseChart: d.categoryExpenseChart || [],
      recentTransactions: d.recentTransactions || [],
      upcomingDebts: d.upcomingDebts || []
    }
  }
}

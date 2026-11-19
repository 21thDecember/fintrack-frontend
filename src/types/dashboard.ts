import type { Transaction } from './transaction'
import type { Debt } from './debt'

export interface DashboardSummary {
  totalBalance: number
  totalReceivable: number
  totalPayable: number
  netWorth: number
  totalIncome: number
  totalExpense: number
  balanceDiff: number
  unclassifiedCount: number
}

export interface IncomeExpenseDataPoint {
  label: string
  income: number
  expense: number
}

export interface CategoryExpenseDataPoint {
  name: string
  amount: number
  color: string
  icon?: string
}

export interface DashboardData {
  summary: DashboardSummary
  incomeExpenseChart: IncomeExpenseDataPoint[]
  categoryExpenseChart: CategoryExpenseDataPoint[]
  recentTransactions: Transaction[]
  upcomingDebts: Debt[]
}

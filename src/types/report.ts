export interface CategoryBreakdownItem {
  categoryId: string
  categoryName: string
  icon: string
  color: string
  amount: number
  percentage: number
  count: number
}

export interface DebtSummaryReport {
  receivablesCollected: number
  payablesPaid: number
  newReceivables: number
  newPayables: number
}

export interface WeeklyReportData {
  week: number
  year: number
  startDate: string
  endDate: string
  totalIncome: number
  totalExpense: number
  personalExpense: number
  cashFlowIn: number
  cashFlowOut: number
  netCashFlow: number
  categories: CategoryBreakdownItem[]
  debtActivity: DebtSummaryReport
}

export interface MonthlyComparison {
  incomeChangePercentage: number
  expenseChangePercentage: number
  netWorthChangePercentage: number
  savingsRate: number
  previousMonthSavingsRate: number
}

export interface MonthlyTrendPoint {
  period: string
  income: number
  expense: number
  netWorth: number
}

export interface MonthlyReportData {
  month: number
  year: number
  totalIncome: number
  totalExpense: number
  previousMonthIncome: number
  previousMonthExpense: number
  comparison: MonthlyComparison
  topExpenseCategories: CategoryBreakdownItem[]
  savingsRate: number
  netWorthTrend: MonthlyTrendPoint[]
}

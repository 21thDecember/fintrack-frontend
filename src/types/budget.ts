export interface Budget {
  id: string
  categoryId: string
  categoryName?: string
  categoryColor?: string
  categoryIcon?: string
  year: number
  month: number
  limitAmount: number
  spentAmount: number
  remainingAmount: number
  percentage: number
}

export interface SetBudgetDto {
  categoryId: string
  year: number
  month: number
  limitAmount: number
}

import type { Account } from './account'
import type { Category } from './category'
import type { DebtAllocation } from './debt'

export type TransactionType =
  | 'INCOME'
  | 'EXPENSE'
  | 'TRANSFER'
  | 'BORROW_RECEIVED'
  | 'LOAN_GIVEN'
  | 'DEBT_REPAYMENT'
  | 'DEBT_COLLECTION'
  | 'ADJUSTMENT'

export type TransactionDirection = 'IN' | 'OUT' | 'NONE'
export type TransactionSource = 'BANK' | 'MANUAL' | 'SYSTEM'
export type ClassificationStatus = 'UNCLASSIFIED' | 'CLASSIFIED'
export type TransactionStatus = 'POSTED' | 'VOIDED'

export interface Transaction {
  id: string
  accountId: string
  categoryId?: string
  type: TransactionType
  amount: number
  direction: TransactionDirection
  source: TransactionSource
  externalTransactionId?: string
  externalReference?: string
  originalDescription?: string
  description: string
  note?: string
  transactionDate: string
  classificationStatus: ClassificationStatus
  transferGroupId?: string
  toAccountId?: string
  status: TransactionStatus
  account?: Account
  category?: Category
  allocations?: DebtAllocation[]
  debtAllocations?: DebtAllocation[]
  debtIds?: string[]
  debtId?: string
  personId?: string
  personName?: string
  dueDate?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateTransactionDto {
  accountId: string
  toAccountId?: string // For TRANSFER
  categoryId?: string
  type: TransactionType
  amount: number
  direction?: TransactionDirection
  source?: TransactionSource
  description: string
  note?: string
  transactionDate: string
  classificationStatus?: ClassificationStatus
  allocations?: DebtAllocation[]
  debtAllocations?: DebtAllocation[]
  debtId?: string // For debt repayment / collection
  debtIds?: string[] // Multiple debts linked to transaction
  personId?: string // For LOAN_GIVEN or BORROW_RECEIVED
  dueDate?: string // Due date for loan
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

export interface TransactionFilterParams {
  startDate?: string
  endDate?: string
  accountId?: string
  categoryId?: string
  type?: TransactionType
  source?: TransactionSource
  classificationStatus?: ClassificationStatus
  search?: string
  page?: number
  pageSize?: number
}

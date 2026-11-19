export type DebtType = 'RECEIVABLE' | 'PAYABLE'
export type DebtOriginType = 'TRANSACTION' | 'MANUAL'
export type DebtStatus = 'OPEN' | 'PARTIAL' | 'PAID' | 'CANCELLED'

export interface DebtPayment {
  id: string
  debtId?: string
  transactionId?: string
  amount: number
  paymentDate: string
  note?: string
  createdAt?: string
}

export interface DebtAllocation {
  personId: string
  personName?: string
  allocatedAmount: number
  note?: string
}

export interface Debt {
  id: string
  personId: string
  personName: string
  type: DebtType
  originType: DebtOriginType
  originTransactionId?: string
  principalAmount: number
  remainingAmount: number
  paidAmount: number
  dueDate?: string
  description: string
  status: DebtStatus
  payments: DebtPayment[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateDebtDto {
  personId: string
  type: DebtType
  originType?: DebtOriginType
  originTransactionId?: string
  principalAmount: number
  dueDate?: string
  description: string
}

export interface RecordDebtPaymentDto {
  amount: number
  accountId?: string
  paymentDate?: string
  note?: string
}

export interface DebtFilterParams {
  type?: DebtType
  status?: DebtStatus
  personId?: string
  search?: string
  page?: number
  limit?: number
}

export interface PersonDebtSummary {
  personId: string
  personName: string
  personPhone?: string
  receivableAmount: number
  payableAmount: number
  netAmount: number
  activeDebtsCount: number
}

export interface DebtSummary {
  totalReceivable: number
  totalPayable: number
  netDebt: number
  activeDebtsCount: number
  overdueDebtsCount: number
  personSummaries?: PersonDebtSummary[]
}

export type AccountType = 'BANK' | 'CASH' | 'OTHER'

export interface Account {
  id: string
  name: string
  accountType: AccountType
  bankCode?: string
  accountNumber?: string
  openingBalance: number
  currentBalance: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateAccountDto {
  name: string
  accountType: AccountType
  bankCode?: string
  accountNumber?: string
  openingBalance: number
  isActive?: boolean
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> {}

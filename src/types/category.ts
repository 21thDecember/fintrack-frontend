export type CategoryType = 'INCOME' | 'EXPENSE'

export interface Category {
  id: string
  name: string
  type: CategoryType
  icon: string
  color: string
  parentId?: string
  isActive: boolean
  createdAt?: string
}

export interface CreateCategoryDto {
  name: string
  type: CategoryType
  icon: string
  color: string
  parentId?: string
  isActive?: boolean
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

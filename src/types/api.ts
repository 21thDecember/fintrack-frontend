export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data: T
  timestamp?: string
}

export interface PageResponse<T = any> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  pageSize: number
  hasNext: boolean
}

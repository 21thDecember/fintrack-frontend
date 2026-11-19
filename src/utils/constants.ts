import type { TransactionType, TransactionDirection, TransactionSource, ClassificationStatus } from '@/types/transaction'
import type { DebtType, DebtStatus } from '@/types/debt'
import type { AccountType } from '@/types/account'

export const TRANSACTION_TYPE_CONFIG: Record<
  TransactionType,
  { label: string; direction: TransactionDirection; color: string; badgeType: 'success' | 'danger' | 'warning' | 'info' | 'primary' }
> = {
  INCOME: { label: 'Thu nhập', direction: 'IN', color: '#10B981', badgeType: 'success' },
  EXPENSE: { label: 'Chi tiêu', direction: 'OUT', color: '#EF4444', badgeType: 'danger' },
  TRANSFER: { label: 'Chuyển khoản', direction: 'NONE', color: '#3B82F6', badgeType: 'primary' },
  BORROW_RECEIVED: { label: 'Đi vay (Nhận tiền)', direction: 'IN', color: '#8B5CF6', badgeType: 'info' },
  LOAN_GIVEN: { label: 'Cho vay (Giao tiền)', direction: 'OUT', color: '#F59E0B', badgeType: 'warning' },
  DEBT_REPAYMENT: { label: 'Trả nợ', direction: 'OUT', color: '#EC4899', badgeType: 'warning' },
  DEBT_COLLECTION: { label: 'Thu hồi nợ', direction: 'IN', color: '#06B6D4', badgeType: 'success' },
  ADJUSTMENT: { label: 'Điều chỉnh số dư', direction: 'NONE', color: '#6B7280', badgeType: 'info' }
}

export function getTransactionTypeLabel(type: TransactionType | string): string {
  return TRANSACTION_TYPE_CONFIG[type as TransactionType]?.label || type
}

export function getTransactionDirection(type: TransactionType): TransactionDirection {
  return TRANSACTION_TYPE_CONFIG[type]?.direction || 'NONE'
}

export const DEBT_TYPE_CONFIG: Record<DebtType, { label: string; tagType: 'success' | 'danger'; color: string }> = {
  RECEIVABLE: { label: 'Phải thu (Người khác nợ mình)', tagType: 'success', color: '#10B981' },
  PAYABLE: { label: 'Phải trả (Mình nợ người khác)', tagType: 'danger', color: '#EF4444' }
}

export function getDebtTypeLabel(type: DebtType | string): string {
  return DEBT_TYPE_CONFIG[type as DebtType]?.label || type
}

export const DEBT_STATUS_CONFIG: Record<
  DebtStatus,
  { label: string; badgeType: 'primary' | 'warning' | 'success' | 'info'; color: string }
> = {
  OPEN: { label: 'Chưa trả', badgeType: 'primary', color: '#3B82F6' },
  PARTIAL: { label: 'Trả một phần', badgeType: 'warning', color: '#F59E0B' },
  PAID: { label: 'Đã hoàn tất', badgeType: 'success', color: '#10B981' },
  CANCELLED: { label: 'Đã hủy', badgeType: 'info', color: '#9CA3AF' }
}

export function getDebtStatusLabel(status: DebtStatus | string): string {
  return DEBT_STATUS_CONFIG[status as DebtStatus]?.label || status
}

export function getDebtStatusColor(status: DebtStatus | string): string {
  return DEBT_STATUS_CONFIG[status as DebtStatus]?.color || '#9CA3AF'
}

export const ACCOUNT_TYPE_CONFIG: Record<AccountType, { label: string; icon: string }> = {
  BANK: { label: 'Tài khoản Ngân hàng', icon: 'OfficeBuilding' },
  CASH: { label: 'Tiền mặt', icon: 'Wallet' },
  OTHER: { label: 'Khác', icon: 'CreditCard' }
}

export const SOURCE_CONFIG: Record<TransactionSource, { label: string; tagType: 'info' | 'primary' | 'warning' }> = {
  BANK: { label: 'Ngân hàng', tagType: 'primary' },
  MANUAL: { label: 'Thủ công', tagType: 'info' },
  SYSTEM: { label: 'Hệ thống', tagType: 'warning' }
}

export const CLASSIFICATION_CONFIG: Record<ClassificationStatus, { label: string; tagType: 'warning' | 'success' }> = {
  UNCLASSIFIED: { label: 'Chưa phân loại', tagType: 'warning' },
  CLASSIFIED: { label: 'Đã phân loại', tagType: 'success' }
}

export const PRESET_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EF4444',
  '#F59E0B', '#EC4899', '#6366F1', '#14B8A6',
  '#06B6D4', '#84CC16', '#F97316', '#6B7280'
]

export const PRESET_ICONS = [
  { name: 'briefcase', label: 'Lương / Sự nghiệp' },
  { name: 'gift', label: 'Thưởng / Quà' },
  { name: 'dollar-sign', label: 'Đầu tư' },
  { name: 'utensils', label: 'Ăn uống' },
  { name: 'car', label: 'Di chuyển' },
  { name: 'shopping-bag', label: 'Mua sắm' },
  { name: 'film', label: 'Giải trí' },
  { name: 'heart-pulse', label: 'Sức khỏe' },
  { name: 'graduation-cap', label: 'Giáo dục' },
  { name: 'home', label: 'Nhà ở' },
  { name: 'receipt', label: 'Hóa đơn' },
  { name: 'more-horizontal', label: 'Khác' }
]

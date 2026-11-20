/**
 * Định dạng tiền tệ theo tiêu chuẩn Việt Nam Đồng (VND)
 * Ví dụ: 1000000 -> "1.000.000 ₫"
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0 || Object.is(amount, -0)) {
    return '0 ₫'
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Định dạng tiền tệ có kèm dấu + hoặc -
 * Khi giá trị bằng 0 sẽ trả về "0 ₫" thay vì "-0 ₫" hoặc "+0 ₫"
 */
export function formatSignedCurrency(amount: number | null | undefined, isPositive = true): string {
  if (!amount || isNaN(amount) || amount === 0) {
    return '0 ₫'
  }
  const formatted = formatCurrency(Math.abs(amount))
  return isPositive ? `+${formatted}` : `-${formatted}`
}

/**
 * Định dạng số với dấu chấm phân cách hàng nghìn (không kèm ký hiệu ₫)
 * Ví dụ: 1000000 -> "1.000.000"
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0'
  }
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0
  }).format(num)
}

/**
 * Phân tích chuỗi tiền tệ nhập từ người dùng thành số nguyên
 * Ví dụ: "1.000.000 ₫" hoặc "1000000" -> 1000000
 */
export function parseCurrency(input: string | number): number {
  if (typeof input === 'number') return Math.round(input)
  if (!input) return 0
  const cleanStr = input.toString().replace(/[^0-9-]/g, '')
  const val = parseInt(cleanStr, 10)
  return isNaN(val) ? 0 : val
}

/**
 * Rút gọn số tiền hiển thị trên biểu đồ hoặc màn hình hẹp
 * Ví dụ: 1.500.000 -> "1.5 Tr", 10.000.000.000 -> "10 Tỷ"
 */
export function formatCompactCurrency(amount: number): string {
  if (!amount || isNaN(amount)) return '0 ₫'
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toFixed(1).replace('.0', '')} Tỷ`
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1).replace('.0', '')} Tr`
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(0)}k`
  }
  return `${sign}${abs} ₫`
}

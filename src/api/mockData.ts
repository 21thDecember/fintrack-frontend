import type { Account } from '@/types/account'
import type { Category } from '@/types/category'
import type { Person } from '@/types/person'
import type { Transaction } from '@/types/transaction'
import type { Debt } from '@/types/debt'
import type { DashboardData } from '@/types/dashboard'
import type { WeeklyReportData, MonthlyReportData } from '@/types/report'

export const initialAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Vietcombank Lương',
    accountType: 'BANK',
    bankCode: 'VCB',
    accountNumber: '1012345678',
    openingBalance: 15000000,
    currentBalance: 42500000,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'acc-2',
    name: 'MB Bank Chi Tiêu',
    accountType: 'BANK',
    bankCode: 'MB',
    accountNumber: '9998887776',
    openingBalance: 5000000,
    currentBalance: 8650000,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'acc-3',
    name: 'Tiền mặt trong ví',
    accountType: 'CASH',
    openingBalance: 1000000,
    currentBalance: 1350000,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'acc-4',
    name: 'Techcombank Tiết Kiệm',
    accountType: 'BANK',
    bankCode: 'TCB',
    accountNumber: '1903334445',
    openingBalance: 100000000,
    currentBalance: 150000000,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
]

export const initialCategories: Category[] = [
  // Income
  { id: 'cat-inc-1', name: 'Lương cố định', type: 'INCOME', icon: 'briefcase', color: '#10B981', isActive: true },
  { id: 'cat-inc-2', name: 'Thưởng & Dự án ngoài', type: 'INCOME', icon: 'gift', color: '#3B82F6', isActive: true },
  { id: 'cat-inc-3', name: 'Đầu tư & Lãi suất', type: 'INCOME', icon: 'dollar-sign', color: '#8B5CF6', isActive: true },
  
  // Expense
  { id: 'cat-exp-1', name: 'Ăn uống & Cafe', type: 'EXPENSE', icon: 'utensils', color: '#EF4444', isActive: true },
  { id: 'cat-exp-2', name: 'Di chuyển & Xăng xe', type: 'EXPENSE', icon: 'car', color: '#F59E0B', isActive: true },
  { id: 'cat-exp-3', name: 'Mua sắm & Đồ dùng', type: 'EXPENSE', icon: 'shopping-bag', color: '#EC4899', isActive: true },
  { id: 'cat-exp-4', name: 'Giải trí & Phim ảnh', type: 'EXPENSE', icon: 'film', color: '#6366F1', isActive: true },
  { id: 'cat-exp-5', name: 'Sức khỏe & Y tế', type: 'EXPENSE', icon: 'heart-pulse', color: '#14B8A6', isActive: true },
  { id: 'cat-exp-6', name: 'Giáo dục & Sách vở', type: 'EXPENSE', icon: 'graduation-cap', color: '#06B6D4', isActive: true },
  { id: 'cat-exp-7', name: 'Nhà ở & Tiền thuê', type: 'EXPENSE', icon: 'home', color: '#84CC16', isActive: true },
  { id: 'cat-exp-8', name: 'Hóa đơn Điện/Nước/Mạng', type: 'EXPENSE', icon: 'receipt', color: '#F97316', isActive: true },
  { id: 'cat-exp-9', name: 'Chi phí khác', type: 'EXPENSE', icon: 'more-horizontal', color: '#6B7280', isActive: true }
]

export const initialPersons: Person[] = [
  { id: 'per-1', name: 'Nguyễn Văn An', phone: '0901234567', note: 'Đồng nghiệp team Dev' },
  { id: 'per-2', name: 'Trần Thị Bình', phone: '0912345678', note: 'Bạn đại học' },
  { id: 'per-3', name: 'Lê Hoàng Nam', phone: '0987654321', note: 'Chủ nhà trọ' },
  { id: 'per-4', name: 'Phạm Minh Quân', phone: '0933221100', note: 'Hội bạn đá banh' },
  { id: 'per-5', name: 'Đỗ Thu Trang', phone: '0944556677', note: 'Chị gái' }
]

export const initialDebts: Debt[] = [
  {
    id: 'debt-1',
    personId: 'per-1',
    personName: 'Nguyễn Văn An',
    type: 'RECEIVABLE',
    originType: 'TRANSACTION',
    principalAmount: 1200000,
    remainingAmount: 400000,
    paidAmount: 800000,
    dueDate: '2026-11-25',
    description: 'Tiền share liên hoan ăn lẩu cuối tuần',
    status: 'PARTIAL',
    payments: [
      { id: 'pay-1', amount: 800000, paymentDate: '2026-11-15T10:00:00Z', note: 'Chuyển khoản Vietcombank' }
    ]
  },
  {
    id: 'debt-2',
    personId: 'per-2',
    personName: 'Trần Thị Bình',
    type: 'RECEIVABLE',
    originType: 'MANUAL',
    principalAmount: 3000000,
    remainingAmount: 3000000,
    paidAmount: 0,
    dueDate: '2026-11-30',
    description: 'Mượn tiền mua laptop cũ',
    status: 'OPEN',
    payments: []
  },
  {
    id: 'debt-3',
    personId: 'per-3',
    personName: 'Lê Hoàng Nam',
    type: 'PAYABLE',
    originType: 'MANUAL',
    principalAmount: 4500000,
    remainingAmount: 0,
    paidAmount: 4500000,
    dueDate: '2026-11-05',
    description: 'Tiền phòng trọ tháng 11',
    status: 'PAID',
    payments: [
      { id: 'pay-2', amount: 4500000, paymentDate: '2026-11-04T14:30:00Z', note: 'Đã đóng đủ qua MB Bank' }
    ]
  },
  {
    id: 'debt-4',
    personId: 'per-5',
    personName: 'Đỗ Thu Trang',
    type: 'PAYABLE',
    originType: 'MANUAL',
    principalAmount: 5000000,
    remainingAmount: 2000000,
    paidAmount: 3000000,
    dueDate: '2026-12-15',
    description: 'Mượn mua sắm đồ gia đình',
    status: 'PARTIAL',
    payments: [
      { id: 'pay-3', amount: 3000000, paymentDate: '2026-11-10T09:15:00Z', note: 'Trả trước đợt 1' }
    ]
  }
]

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    accountId: 'acc-1',
    categoryId: 'cat-inc-1',
    type: 'INCOME',
    amount: 35000000,
    direction: 'IN',
    source: 'BANK',
    externalTransactionId: 'VCB-20261105-001',
    originalDescription: 'CTY ABC CHUYEN LUONG THANG 10/2026',
    description: 'Nhận lương tháng 10 từ công ty',
    transactionDate: '2026-11-05T08:30:00Z',
    classificationStatus: 'CLASSIFIED',
    status: 'POSTED'
  },
  {
    id: 'tx-2',
    accountId: 'acc-2',
    categoryId: 'cat-exp-1',
    type: 'EXPENSE',
    amount: 1850000,
    direction: 'OUT',
    source: 'BANK',
    externalTransactionId: 'MB-20261114-042',
    originalDescription: 'POS HAIDILAO HOTPOT SAIGON',
    description: 'Ăn tối liên hoan Haidilao cùng nhóm bạn',
    note: 'An và Bình hứa chia đều tiền',
    transactionDate: '2026-11-14T20:15:00Z',
    classificationStatus: 'CLASSIFIED',
    status: 'POSTED',
    allocations: [
      { personId: 'per-1', personName: 'Nguyễn Văn An', allocatedAmount: 600000, note: 'Phần An' },
      { personId: 'per-2', personName: 'Trần Thị Bình', allocatedAmount: 600000, note: 'Phần Bình' }
    ]
  },
  {
    id: 'tx-3',
    accountId: 'acc-1',
    categoryId: 'cat-exp-8',
    type: 'EXPENSE',
    amount: 1450000,
    direction: 'OUT',
    source: 'BANK',
    externalTransactionId: 'VCB-20261112-888',
    originalDescription: 'THANH TOAN TIEN DIEN EVN HCMC T10',
    description: 'Thanh toán tiền điện EVN',
    transactionDate: '2026-11-12T11:00:00Z',
    classificationStatus: 'CLASSIFIED',
    status: 'POSTED'
  },
  {
    id: 'tx-4',
    accountId: 'acc-2',
    categoryId: 'cat-exp-2',
    type: 'EXPENSE',
    amount: 95000,
    direction: 'OUT',
    source: 'BANK',
    externalTransactionId: 'MB-20261117-101',
    originalDescription: 'GRAB*TRIP-VN-984920',
    description: 'Di chuyển GrabBike đi gặp khách hàng',
    transactionDate: '2026-11-17T09:20:00Z',
    classificationStatus: 'CLASSIFIED',
    status: 'POSTED'
  },
  {
    id: 'tx-5',
    accountId: 'acc-3',
    categoryId: 'cat-exp-1',
    type: 'EXPENSE',
    amount: 45000,
    direction: 'OUT',
    source: 'MANUAL',
    description: 'Cà phê sáng vỉa hè',
    transactionDate: '2026-11-18T07:45:00Z',
    classificationStatus: 'CLASSIFIED',
    status: 'POSTED'
  },
  {
    id: 'tx-6',
    accountId: 'acc-2',
    type: 'EXPENSE',
    amount: 320000,
    direction: 'OUT',
    source: 'BANK',
    externalTransactionId: 'MB-20261118-202',
    originalDescription: 'TIKI CORP VIET NAM GD 883921',
    description: 'Giao dịch chuyển tiền TIKI CORP',
    transactionDate: '2026-11-18T08:10:00Z',
    classificationStatus: 'UNCLASSIFIED',
    status: 'POSTED'
  },
  {
    id: 'tx-7',
    accountId: 'acc-1',
    toAccountId: 'acc-4',
    type: 'TRANSFER',
    amount: 10000000,
    direction: 'NONE',
    source: 'MANUAL',
    description: 'Chuyển tiền tiết kiệm định kỳ tháng 11',
    transactionDate: '2026-11-06T10:00:00Z',
    classificationStatus: 'CLASSIFIED',
    status: 'POSTED'
  },
  {
    id: 'tx-8',
    accountId: 'acc-1',
    categoryId: 'cat-inc-2',
    type: 'INCOME',
    amount: 5500000,
    direction: 'IN',
    source: 'BANK',
    externalTransactionId: 'VCB-20261116-333',
    originalDescription: 'CHUYEN TIEN THIET KE WEBSITE DONG THUONG',
    description: 'Thanh toán dự án freelance làm web',
    transactionDate: '2026-11-16T15:00:00Z',
    classificationStatus: 'CLASSIFIED',
    status: 'POSTED'
  }
]

export function getMockDashboardData(): DashboardData {
  const totalBalance = initialAccounts.reduce((sum, a) => sum + (a.isActive ? a.currentBalance : 0), 0)
  const totalReceivable = initialDebts.filter(d => d.type === 'RECEIVABLE' && d.status !== 'PAID' && d.status !== 'CANCELLED')
    .reduce((sum, d) => sum + d.remainingAmount, 0)
  const totalPayable = initialDebts.filter(d => d.type === 'PAYABLE' && d.status !== 'PAID' && d.status !== 'CANCELLED')
    .reduce((sum, d) => sum + d.remainingAmount, 0)
  const netWorth = totalBalance + totalReceivable - totalPayable
  
  const totalIncome = 40500000
  const totalExpense = 13710000
  const balanceDiff = totalIncome - totalExpense
  const unclassifiedCount = initialTransactions.filter(t => t.classificationStatus === 'UNCLASSIFIED').length

  return {
    summary: {
      totalBalance,
      totalReceivable,
      totalPayable,
      netWorth,
      totalIncome,
      totalExpense,
      balanceDiff,
      unclassifiedCount
    },
    incomeExpenseChart: [
      { label: 'T2', income: 0, expense: 450000 },
      { label: 'T3', income: 35000000, expense: 1200000 },
      { label: 'T4', income: 0, expense: 850000 },
      { label: 'T5', income: 0, expense: 1450000 },
      { label: 'T6', income: 0, expense: 980000 },
      { label: 'T7', income: 5500000, expense: 2350000 },
      { label: 'CN', income: 0, expense: 1100000 }
    ],
    categoryExpenseChart: [
      { name: 'Ăn uống & Cafe', amount: 4850000, color: '#EF4444' },
      { name: 'Nhà ở & Tiền thuê', amount: 4500000, color: '#84CC16' },
      { name: 'Hóa đơn Điện/Nước', amount: 1450000, color: '#F97316' },
      { name: 'Mua sắm & Đồ dùng', amount: 1280000, color: '#EC4899' },
      { name: 'Di chuyển & Xăng', amount: 980000, color: '#F59E0B' },
      { name: 'Giải trí & Khác', amount: 650000, color: '#6366F1' }
    ],
    recentTransactions: initialTransactions.slice(0, 8),
    upcomingDebts: initialDebts.filter(d => d.status !== 'PAID' && d.status !== 'CANCELLED').slice(0, 4)
  }
}

export function getMockWeeklyReport(): WeeklyReportData {
  return {
    week: 46,
    year: 2026,
    startDate: '2026-11-12',
    endDate: '2026-11-18',
    totalIncome: 5500000,
    totalExpense: 3760000,
    personalExpense: 2560000,
    cashFlowIn: 6300000, // + 800k debt collection
    cashFlowOut: 3760000,
    netCashFlow: 2540000,
    categories: [
      { categoryId: 'cat-exp-1', categoryName: 'Ăn uống & Cafe', icon: 'utensils', color: '#EF4444', amount: 1895000, percentage: 50.4, count: 5 },
      { categoryId: 'cat-exp-8', categoryName: 'Hóa đơn Điện/Nước', icon: 'receipt', color: '#F97316', amount: 1450000, percentage: 38.6, count: 1 },
      { categoryId: 'cat-exp-2', categoryName: 'Di chuyển & Xăng xe', icon: 'car', color: '#F59E0B', amount: 220000, percentage: 5.8, count: 3 },
      { categoryId: 'cat-exp-9', categoryName: 'Khác', icon: 'more-horizontal', color: '#6B7280', amount: 195000, percentage: 5.2, count: 2 }
    ],
    debtActivity: {
      receivablesCollected: 800000,
      payablesPaid: 0,
      newReceivables: 1200000,
      newPayables: 0
    }
  }
}

export function getMockMonthlyReport(): MonthlyReportData {
  return {
    month: 11,
    year: 2026,
    totalIncome: 40500000,
    totalExpense: 13710000,
    previousMonthIncome: 36000000,
    previousMonthExpense: 15200000,
    comparison: {
      incomeChangePercentage: 12.5,
      expenseChangePercentage: -9.8,
      netWorthChangePercentage: 15.2,
      savingsRate: 66.1,
      previousMonthSavingsRate: 57.7
    },
    topExpenseCategories: [
      { categoryId: 'cat-exp-1', categoryName: 'Ăn uống & Cafe', icon: 'utensils', color: '#EF4444', amount: 4850000, percentage: 35.4, count: 18 },
      { categoryId: 'cat-exp-7', categoryName: 'Nhà ở & Tiền thuê', icon: 'home', color: '#84CC16', amount: 4500000, percentage: 32.8, count: 1 },
      { categoryId: 'cat-exp-8', categoryName: 'Hóa đơn & Tiện ích', icon: 'receipt', color: '#F97316', amount: 1450000, percentage: 10.6, count: 2 },
      { categoryId: 'cat-exp-3', categoryName: 'Mua sắm & Đồ dùng', icon: 'shopping-bag', color: '#EC4899', amount: 1280000, percentage: 9.3, count: 4 },
      { categoryId: 'cat-exp-2', categoryName: 'Di chuyển & Xăng xe', icon: 'car', color: '#F59E0B', amount: 980000, percentage: 7.1, count: 12 },
      { categoryId: 'cat-exp-4', categoryName: 'Giải trí & Phim ảnh', icon: 'film', color: '#6366F1', amount: 650000, percentage: 4.8, count: 3 }
    ],
    savingsRate: 66.1,
    netWorthTrend: [
      { period: 'T6', income: 33000000, expense: 14000000, netWorth: 165000000 },
      { period: 'T7', income: 34000000, expense: 16500000, netWorth: 172500000 },
      { period: 'T8', income: 38000000, expense: 15000000, netWorth: 185500000 },
      { period: 'T9', income: 35000000, expense: 14200000, netWorth: 196300000 },
      { period: 'T10', income: 36000000, expense: 15200000, netWorth: 207100000 },
      { period: 'T11', income: 40500000, expense: 13710000, netWorth: 222500000 }
    ]
  }
}

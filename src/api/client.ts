import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import {
  initialAccounts,
  initialCategories,
  initialTransactions,
  initialDebts,
  initialPersons,
  getMockDashboardData,
  getMockWeeklyReport,
  getMockMonthlyReport
} from './mockData'

function getBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  if (!envUrl) {
    return '/api'
  }
  const cleanUrl = envUrl.replace(/\/+$/, '')
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`
}

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// In-memory state for mock fallback when backend is unavailable
let mockAccounts = [...initialAccounts]
let mockCategories = [...initialCategories]
let mockTransactions = [...initialTransactions]
let mockDebts = [...initialDebts]
let mockPersons = [...initialPersons]

function handleMockFallback(config: AxiosRequestConfig): AxiosResponse<any> {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()
  let data: any = null

  // 1. Auth
  if (url.includes('/auth/login')) {
    data = {
      token: 'mock-jwt-token-vietnam-personal-finance-2026',
      user: { id: 'usr-1', username: 'admin', fullName: 'Nguyễn Quản Trị', role: 'USER' }
    }
  }
  // 2. Accounts
  else if (url.startsWith('/accounts')) {
    if (method === 'get') {
      data = mockAccounts
    } else if (method === 'post') {
      const newAcc = { id: `acc-${Date.now()}`, currentBalance: 0, isActive: true, ...JSON.parse(config.data || '{}') }
      newAcc.currentBalance = newAcc.openingBalance || 0
      mockAccounts.push(newAcc)
      data = newAcc
    } else if (method === 'put') {
      const body = JSON.parse(config.data || '{}')
      const id = url.split('/').pop()
      const idx = mockAccounts.findIndex(a => a.id === id)
      if (idx !== -1) {
        mockAccounts[idx] = { ...mockAccounts[idx], ...body }
        data = mockAccounts[idx]
      }
    }
  }
  // 3. Categories
  else if (url.startsWith('/categories')) {
    if (method === 'get') {
      data = mockCategories
    } else if (method === 'post') {
      const newCat = { id: `cat-${Date.now()}`, isActive: true, ...JSON.parse(config.data || '{}') }
      mockCategories.push(newCat)
      data = newCat
    } else if (method === 'put') {
      const body = JSON.parse(config.data || '{}')
      const id = url.split('/').pop()
      const idx = mockCategories.findIndex(c => c.id === id)
      if (idx !== -1) {
        mockCategories[idx] = { ...mockCategories[idx], ...body }
        data = mockCategories[idx]
      }
    }
  }
  // 4. Persons
  else if (url.startsWith('/persons')) {
    if (method === 'get') {
      data = mockPersons
    } else if (method === 'post') {
      const newP = { id: `per-${Date.now()}`, ...JSON.parse(config.data || '{}') }
      mockPersons.push(newP)
      data = newP
    }
  }
  // 5. Debts
  else if (url.startsWith('/debts')) {
    const parts = url.split('/')
    if (parts.length > 2 && parts[2] !== '') {
      const debtId = parts[2]
      if (url.includes('/payments') && method === 'post') {
        const body = JSON.parse(config.data || '{}')
        const debt = mockDebts.find(d => d.id === debtId)
        if (debt) {
          const payment = {
            id: `pay-${Date.now()}`,
            debtId,
            amount: body.amount,
            paymentDate: body.paymentDate || new Date().toISOString(),
            note: body.note
          }
          debt.paidAmount += body.amount
          debt.remainingAmount = Math.max(0, debt.principalAmount - debt.paidAmount)
          debt.status = debt.remainingAmount === 0 ? 'PAID' : 'PARTIAL'
          debt.payments.unshift(payment)
          data = debt
        }
      } else if (url.includes('/cancel') && method === 'post') {
        const debt = mockDebts.find(d => d.id === debtId)
        if (debt) {
          debt.status = 'CANCELLED'
          data = debt
        }
      } else {
        data = mockDebts.find(d => d.id === debtId)
      }
    } else {
      if (method === 'get') {
        data = {
          content: mockDebts,
          totalElements: mockDebts.length,
          totalPages: 1,
          page: 0,
          pageSize: 20
        }
      } else if (method === 'post') {
        const body = JSON.parse(config.data || '{}')
        const person = mockPersons.find(p => p.id === body.personId)
        const newDebt = {
          id: `debt-${Date.now()}`,
          personName: person?.name || 'Người quen',
          remainingAmount: body.principalAmount,
          paidAmount: 0,
          status: 'OPEN' as const,
          payments: [],
          ...body
        }
        mockDebts.unshift(newDebt)
        data = newDebt
      }
    }
  }
  // 6. Transactions
  else if (url.startsWith('/transactions')) {
    const parts = url.split('/')
    if (parts.length > 2 && parts[2] !== '') {
      const id = parts[2]
      if (method === 'get') {
        data = mockTransactions.find(t => t.id === id)
      } else if (method === 'put') {
        const body = JSON.parse(config.data || '{}')
        const idx = mockTransactions.findIndex(t => t.id === id)
        if (idx !== -1) {
          mockTransactions[idx] = { ...mockTransactions[idx], ...body }
          data = mockTransactions[idx]
        }
      } else if (method === 'delete') {
        mockTransactions = mockTransactions.filter(t => t.id !== id)
        data = { success: true }
      }
    } else {
      if (method === 'get') {
        data = {
          content: mockTransactions,
          totalElements: mockTransactions.length,
          totalPages: 1,
          page: 0,
          pageSize: 20
        }
      } else if (method === 'post') {
        const body = JSON.parse(config.data || '{}')
        const newTx = {
          id: `tx-${Date.now()}`,
          status: 'POSTED' as const,
          classificationStatus: body.categoryId ? ('CLASSIFIED' as const) : ('UNCLASSIFIED' as const),
          source: 'MANUAL' as const,
          direction: body.type === 'INCOME' ? 'IN' as const : body.type === 'EXPENSE' ? 'OUT' as const : 'NONE' as const,
          ...body
        }
        mockTransactions.unshift(newTx)
        data = newTx
      }
    }
  }
  // 7. Dashboard
  else if (url.startsWith('/dashboard')) {
    data = getMockDashboardData()
  }
  // 8. Reports
  else if (url.startsWith('/reports/weekly')) {
    data = getMockWeeklyReport()
  } else if (url.startsWith('/reports/monthly')) {
    data = getMockMonthlyReport()
  } else {
    data = { success: true }
  }

  return {
    data: { success: true, data },
    status: 200,
    statusText: 'OK',
    headers: {},
    config
  } as AxiosResponse
}

// Response Interceptor with Fallback Graceful Recovery
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const status = error?.response?.status
    
    // Unauthorized: clear token and redirect
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    // Network error or backend offline: Use fallback mock
    if (!error.response || status >= 500 || status === 404) {
      console.warn(`[Backend Offline Fallback] Handling ${error.config?.url} with local state`)
      return handleMockFallback(error.config)
    }

    const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default apiClient

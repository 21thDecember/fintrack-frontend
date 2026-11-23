import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { transactionApi } from '@/api/transactionApi'
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilterParams
} from '@/types/transaction'
import { ElMessage } from 'element-plus'

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<Transaction[]>([])
  const totalElements = ref(0)
  const totalPages = ref(1)
  const currentPage = ref(1)
  const pageSize = ref(15)
  const loading = ref(false)

  const filters = ref<TransactionFilterParams>({
    startDate: undefined,
    endDate: undefined,
    accountId: undefined,
    categoryId: undefined,
    type: undefined,
    source: undefined,
    classificationStatus: undefined,
    search: undefined
  })

  // Summary row totals for filtered items
  const totalIn = computed(() =>
    transactions.value
      .filter(t => t.direction === 'IN')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
  )

  const totalOut = computed(() =>
    transactions.value
      .filter(t => t.direction === 'OUT')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
  )

  const balanceDiff = computed(() => totalIn.value - totalOut.value)

  async function fetchTransactions(page = currentPage.value) {
    loading.value = true
    currentPage.value = page
    try {
      const res = await transactionApi.getTransactions({
        ...filters.value,
        page: currentPage.value - 1,
        pageSize: pageSize.value
      })
      transactions.value = (res.content || []).map(t => {
        if (t.note && t.note.startsWith('Cổng:') && t.note.includes('Tích lũy:')) {
          return { ...t, note: '' }
        }
        return t
      })
      totalElements.value = res.totalElements || 0
      totalPages.value = res.totalPages || 1
    } catch (err) {
      console.error('Failed to fetch transactions', err)
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters: Partial<TransactionFilterParams>) {
    filters.value = { ...filters.value, ...newFilters }
    currentPage.value = 1
    fetchTransactions(1)
  }

  function resetFilters() {
    filters.value = {
      startDate: undefined,
      endDate: undefined,
      accountId: undefined,
      categoryId: undefined,
      type: undefined,
      source: undefined,
      classificationStatus: undefined,
      search: undefined
    }
    currentPage.value = 1
    fetchTransactions(1)
  }

  async function createTransaction(data: CreateTransactionDto) {
    loading.value = true
    try {
      const created = await transactionApi.createTransaction(data)
      transactions.value.unshift(created)
      totalElements.value++
      ElMessage.success('Đã ghi nhận giao dịch mới!')
      return created
    } catch (err) {
      console.error('Failed to create transaction', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTransaction(id: string, data: UpdateTransactionDto) {
    loading.value = true
    try {
      const updated = await transactionApi.updateTransaction(id, data)
      const idx = transactions.value.findIndex(t => t.id === id)
      if (idx !== -1) transactions.value[idx] = updated
      ElMessage.success('Đã cập nhật thông tin giao dịch')
      return updated
    } catch (err) {
      console.error('Failed to update transaction', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function quickClassify(id: string, categoryId: string) {
    try {
      const updated = await transactionApi.updateClassification(id, categoryId, 'CLASSIFIED')
      const idx = transactions.value.findIndex(t => t.id === id)
      if (idx !== -1) transactions.value[idx] = updated
      ElMessage.success('Đã gắn danh mục cho giao dịch!')
      return updated
    } catch (err) {
      console.error('Failed to classify transaction', err)
      throw err
    }
  }

  async function quickUpdateNote(id: string, note?: string) {
    try {
      const updated = await transactionApi.updateNote(id, note)
      const idx = transactions.value.findIndex(t => t.id === id)
      if (idx !== -1) {
        transactions.value[idx] = {
          ...transactions.value[idx],
          note: updated.note
        }
      }
      ElMessage.success('Đã cập nhật ghi chú!')
      return updated
    } catch (err) {
      console.error('Failed to update note', err)
      ElMessage.error('Không thể cập nhật ghi chú')
      throw err
    }
  }

  async function deleteTransaction(id: string) {
    loading.value = true
    try {
      await transactionApi.deleteTransaction(id)
      transactions.value = transactions.value.filter(t => t.id !== id)
      totalElements.value = Math.max(0, totalElements.value - 1)
      ElMessage.success('Đã xóa giao dịch')
    } catch (err) {
      console.error('Failed to delete transaction', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    transactions,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    loading,
    filters,
    totalIn,
    totalOut,
    balanceDiff,
    fetchTransactions,
    setFilters,
    resetFilters,
    createTransaction,
    updateTransaction,
    quickClassify,
    quickUpdateNote,
    deleteTransaction
  }
})

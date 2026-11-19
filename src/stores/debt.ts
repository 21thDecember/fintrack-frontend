import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { debtApi } from '@/api/debtApi'
import type { Debt, CreateDebtDto, RecordDebtPaymentDto, DebtFilterParams } from '@/types/debt'
import { ElMessage } from 'element-plus'

export const useDebtStore = defineStore('debt', () => {
  const debts = ref<Debt[]>([])
  const loading = ref(false)

  const receivables = computed(() => debts.value.filter(d => d.type === 'RECEIVABLE'))
  const payables = computed(() => debts.value.filter(d => d.type === 'PAYABLE'))

  const totalReceivable = computed(() =>
    receivables.value
      .filter(d => d.status !== 'PAID' && d.status !== 'CANCELLED')
      .reduce((sum, d) => sum + (d.remainingAmount || 0), 0)
  )

  const totalPayable = computed(() =>
    payables.value
      .filter(d => d.status !== 'PAID' && d.status !== 'CANCELLED')
      .reduce((sum, d) => sum + (d.remainingAmount || 0), 0)
  )

  const openCount = computed(() =>
    debts.value.filter(d => d.status === 'OPEN' || d.status === 'PARTIAL').length
  )

  async function fetchDebts(params?: DebtFilterParams) {
    loading.value = true
    try {
      const res = await debtApi.getDebts(params)
      debts.value = res.content || []
    } catch (err) {
      console.error('Failed to fetch debts', err)
    } finally {
      loading.value = false
    }
  }

  async function getDebtById(id: string): Promise<Debt> {
    loading.value = true
    try {
      return await debtApi.getDebtById(id)
    } finally {
      loading.value = false
    }
  }

  async function createDebt(data: CreateDebtDto) {
    loading.value = true
    try {
      const created = await debtApi.createDebt(data)
      debts.value.unshift(created)
      ElMessage.success('Đã thêm khoản nợ mới')
      return created
    } catch (err) {
      console.error('Failed to create debt', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function recordPayment(debtId: string, data: RecordDebtPaymentDto) {
    loading.value = true
    try {
      const updated = await debtApi.recordPayment(debtId, data)
      const idx = debts.value.findIndex(d => d.id === debtId)
      if (idx !== -1) debts.value[idx] = updated
      ElMessage.success('Đã ghi nhận thanh toán nợ thành công!')
      return updated
    } catch (err) {
      console.error('Failed to record debt payment', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelDebt(debtId: string) {
    loading.value = true
    try {
      const updated = await debtApi.cancelDebt(debtId)
      const idx = debts.value.findIndex(d => d.id === debtId)
      if (idx !== -1) debts.value[idx] = updated
      ElMessage.success('Đã hủy khoản nợ')
      return updated
    } catch (err) {
      console.error('Failed to cancel debt', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    debts,
    receivables,
    payables,
    totalReceivable,
    totalPayable,
    openCount,
    loading,
    fetchDebts,
    getDebtById,
    createDebt,
    recordPayment,
    cancelDebt
  }
})

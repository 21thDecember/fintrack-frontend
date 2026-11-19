import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { accountApi } from '@/api/accountApi'
import type { Account, CreateAccountDto, UpdateAccountDto } from '@/types/account'
import { ElMessage } from 'element-plus'

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<Account[]>([])
  const loading = ref(false)

  const activeAccounts = computed(() => accounts.value.filter(a => a.isActive))
  const totalBalance = computed(() =>
    activeAccounts.value.reduce((sum, a) => sum + (a.currentBalance || 0), 0)
  )

  async function fetchAccounts(activeOnly = false) {
    loading.value = true
    try {
      const data = await accountApi.getAccounts(activeOnly)
      accounts.value = data || []
    } catch (err) {
      console.error('Failed to fetch accounts', err)
    } finally {
      loading.value = false
    }
  }

  async function createAccount(data: CreateAccountDto) {
    loading.value = true
    try {
      const created = await accountApi.createAccount(data)
      accounts.value.push(created)
      ElMessage.success('Đã thêm tài khoản thành công')
      return created
    } catch (err) {
      console.error('Failed to create account', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAccount(id: string, data: UpdateAccountDto) {
    loading.value = true
    try {
      const updated = await accountApi.updateAccount(id, data)
      const idx = accounts.value.findIndex(a => a.id === id)
      if (idx !== -1) accounts.value[idx] = updated
      ElMessage.success('Đã cập nhật tài khoản')
      return updated
    } catch (err) {
      console.error('Failed to update account', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const updated = await accountApi.toggleActive(id, isActive)
      const idx = accounts.value.findIndex(a => a.id === id)
      if (idx !== -1) accounts.value[idx] = updated
      ElMessage.success(isActive ? 'Đã kích hoạt tài khoản' : 'Đã tạm ngưng tài khoản')
    } catch (err) {
      console.error('Failed to toggle account active status', err)
      throw err
    }
  }

  return {
    accounts,
    activeAccounts,
    totalBalance,
    loading,
    fetchAccounts,
    createAccount,
    updateAccount,
    toggleActive
  }
})

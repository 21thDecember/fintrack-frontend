<template>
  <div class="accounts-view">
    <!-- Top Summary Card: Total Balance across all accounts -->
    <el-card class="total-balance-card" shadow="never">
      <div class="balance-card-inner">
        <div class="info">
          <span class="card-subtitle">Tổng tài sản thanh khoản</span>
          <h1 class="total-balance-text">{{ formatCurrency(accountStore.totalBalance) }}</h1>
          <p class="account-count-desc">Đang quản lý {{ accountStore.activeAccounts.length }} tài khoản đang hoạt động</p>
        </div>
        <div class="actions">
          <el-button class="add-account-btn" size="large" :icon="Plus" @click="openCreateDialog">
            Thêm tài khoản mới
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- Accounts Cards Grid -->
    <div class="accounts-grid" v-loading="accountStore.loading">
      <el-card
        v-for="account in accountStore.accounts"
        :key="account.id"
        class="account-card"
        :class="{ 'is-inactive': !account.isActive }"
        shadow="hover"
      >
        <div class="account-card-header">
          <div class="acc-badge-icon" :class="account.accountType.toLowerCase()">
            <el-icon :size="24">
              <OfficeBuilding v-if="account.accountType === 'BANK'" />
              <Wallet v-else-if="account.accountType === 'CASH'" />
              <CreditCard v-else />
            </el-icon>
          </div>
          <div class="acc-meta">
            <h3 class="acc-name">{{ account.name }}</h3>
            <span v-if="account.bankCode" class="bank-tag">{{ account.bankCode }} • {{ account.accountNumber }}</span>
            <span v-else class="acc-type-label">{{ getAccountTypeLabel(account.accountType) }}</span>
          </div>

          <div class="acc-switch">
            <el-switch
              v-model="account.isActive"
              @change="(val: boolean | string | number) => handleToggleStatus(account.id, Boolean(val))"
            />
          </div>
        </div>

        <div class="account-card-body">
          <span class="balance-label">Số dư hiện tại</span>
          <strong class="balance-value" :class="account.currentBalance >= 0 ? 'text-income' : 'text-expense'">
            {{ formatCurrency(account.currentBalance) }}
          </strong>
        </div>

        <div class="account-card-footer">
          <span class="opening-balance">Số dư ban đầu: {{ formatCurrency(account.openingBalance) }}</span>
          <el-button link type="primary" size="small" @click="openEditDialog(account)">
            Chỉnh sửa
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'"
      width="480px"
      append-to-body
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Tên tài khoản / Ví" prop="name">
          <el-input v-model="form.name" placeholder="Ví dụ: Vietcombank Lương, Ví tiền mặt..." />
        </el-form-item>

        <el-form-item label="Loại tài khoản" prop="accountType">
          <el-select v-model="form.accountType" style="width: 100%">
            <el-option label="Tài khoản Ngân hàng" value="BANK" />
            <el-option label="Tiền mặt" value="CASH" />
            <el-option label="Khác / Thẻ tín dụng" value="OTHER" />
          </el-select>
        </el-form-item>

        <div v-if="form.accountType === 'BANK'" class="bank-fields">
          <el-form-item label="Mã ngân hàng (VietinBank, VCB, MB, TCB...)">
            <el-input v-model="form.bankCode" placeholder="Ví dụ: VCB, MB, TCB..." />
          </el-form-item>
          <el-form-item label="Số tài khoản">
            <el-input v-model="form.accountNumber" placeholder="Số tài khoản ngân hàng" />
          </el-form-item>
        </div>

        <el-form-item label="Số dư ban đầu (VND)" prop="openingBalance">
          <el-input-number
            v-model="form.openingBalance"
            :min="0"
            :max="100000000000"
            :step="500000"
            :disabled="!!editingId"
            controls-position="right"
            style="width: 100%"
          />
          <span v-if="editingId" class="text-xs text-muted mt-1">
            Số dư ban đầu chỉ có thể cài đặt khi tạo mới tài khoản.
          </span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="accountStore.loading" @click="handleSubmit">
          Lưu tài khoản
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, OfficeBuilding, Wallet, CreditCard } from '@element-plus/icons-vue'
import { useAccountStore } from '@/stores/account'
import type { Account, AccountType, CreateAccountDto } from '@/types/account'
import { formatCurrency } from '@/utils/currency'
import { ACCOUNT_TYPE_CONFIG } from '@/utils/constants'

const accountStore = useAccountStore()
const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const editingId = ref<string | null>(null)

const form = reactive<CreateAccountDto>({
  name: '',
  accountType: 'BANK',
  bankCode: '',
  accountNumber: '',
  openingBalance: 0
})

const rules: FormRules = {
  name: [{ required: true, message: 'Vui lòng nhập tên tài khoản', trigger: 'blur' }],
  accountType: [{ required: true, message: 'Vui lòng chọn loại tài khoản', trigger: 'change' }],
  openingBalance: [{ required: true, message: 'Vui lòng nhập số dư ban đầu', trigger: 'blur' }]
}

function getAccountTypeLabel(type: AccountType) {
  return ACCOUNT_TYPE_CONFIG[type]?.label || type
}

function openCreateDialog() {
  editingId.value = null
  form.name = ''
  form.accountType = 'BANK'
  form.bankCode = ''
  form.accountNumber = ''
  form.openingBalance = 0
  dialogVisible.value = true
}

function openEditDialog(acc: Account) {
  editingId.value = acc.id
  form.name = acc.name
  form.accountType = acc.accountType
  form.bankCode = acc.bankCode || ''
  form.accountNumber = acc.accountNumber || ''
  form.openingBalance = acc.openingBalance
  dialogVisible.value = true
}

async function handleToggleStatus(id: string, active: boolean) {
  try {
    await accountStore.toggleActive(id, active)
  } catch (err) {
    const acc = accountStore.accounts.find(a => a.id === id)
    if (acc) acc.isActive = !active
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (editingId.value) {
        await accountStore.updateAccount(editingId.value, form)
      } else {
        await accountStore.createAccount(form)
      }
      dialogVisible.value = false
    }
  })
}

onMounted(() => {
  accountStore.fetchAccounts()
})
</script>

<style scoped lang="scss">
.accounts-view {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .total-balance-card {
    border-radius: 16px;
    background: linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%);
    color: #FFFFFF;

    .balance-card-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .card-subtitle {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .total-balance-text {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 4px 0;
    }

    .account-count-desc {
      font-size: 0.8125rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .add-account-btn {
      background: #FFFFFF;
      color: #065F46;
      border: none;
      font-weight: 700;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;

      &:hover, &:focus {
        background: #F0FDF4;
        color: #047857;
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
      }

      &:active {
        transform: scale(0.96);
      }
    }
  }

  .accounts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .account-card {
    border-radius: 14px;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
    will-change: transform;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);

      .acc-badge-icon {
        transform: scale(1.08);
      }
    }

    &.is-inactive {
      opacity: 0.6;
      filter: grayscale(0.6);
    }

    .account-card-header {
      display: flex;
      align-items: center;
      gap: 12px;

      .acc-badge-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

        &.bank { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
        &.cash { background: rgba(16, 185, 129, 0.12); color: #10B981; }
        &.other { background: rgba(139, 92, 246, 0.12); color: #8B5CF6; }
      }

      .acc-meta {
        flex: 1;
        min-width: 0;

        .acc-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--app-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bank-tag, .acc-type-label {
          font-size: 0.75rem;
          color: var(--app-text-muted);
        }
      }
    }

    .account-card-body {
      margin: 16px 0 12px;
      display: flex;
      flex-direction: column;

      .balance-label {
        font-size: 0.75rem;
        color: var(--app-text-muted);
      }

      .balance-value {
        font-size: 1.5rem;
        font-weight: 800;
        margin-top: 2px;
      }
    }

    .account-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid var(--app-card-border);
      font-size: 0.75rem;

      .opening-balance {
        color: var(--app-text-muted);
      }
    }
  }
}
</style>

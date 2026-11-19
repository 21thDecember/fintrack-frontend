<template>
  <div class="transaction-form-view">
    <div class="form-container">
      <div class="form-header">
        <el-button link :icon="ArrowLeft" @click="router.back()">Quay lại</el-button>
        <h2 class="form-title">{{ isEdit ? 'Chỉnh sửa giao dịch' : 'Thêm mới giao dịch' }}</h2>
        <span class="spacer"></span>
      </div>

      <!-- Bank Source Warning Tooltip -->
      <el-alert
        v-if="isBankTransaction"
        type="info"
        show-icon
        :closable="false"
        class="bank-notice-alert"
      >
        <template #title>
          <span>Giao dịch này được đồng bộ từ sao kê Ngân hàng. Các trường số tiền, tài khoản và thời gian được khóa để đảm bảo toàn vẹn dữ liệu sổ cái.</span>
        </template>
      </el-alert>

      <el-card class="form-card" shadow="never">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          size="large"
          @submit.prevent="handleSubmit"
        >
          <!-- 1. Transaction Type Selector -->
          <el-form-item label="Loại giao dịch" prop="type">
            <el-radio-group
              v-model="form.type"
              :disabled="isBankTransaction"
              class="type-radio-group"
              @change="handleTypeChange"
            >
              <el-radio-button label="EXPENSE">
                <el-icon class="mr-1"><Top /></el-icon> Chi tiêu
              </el-radio-button>
              <el-radio-button label="INCOME">
                <el-icon class="mr-1"><Bottom /></el-icon> Thu nhập
              </el-radio-button>
              <el-radio-button label="TRANSFER">
                <el-icon class="mr-1"><Switch /></el-icon> Chuyển khoản
              </el-radio-button>
              <el-radio-button label="LOAN_GIVEN">Cho vay</el-radio-button>
              <el-radio-button label="BORROW_RECEIVED">Đi vay</el-radio-button>
              <el-radio-button label="DEBT_COLLECTION">Thu hồi nợ</el-radio-button>
              <el-radio-button label="DEBT_REPAYMENT">Trả nợ</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <!-- 2. Large Amount Input -->
          <div class="amount-input-section">
            <el-form-item label="Số tiền giao dịch (VND)" prop="amount">
              <div class="amount-wrapper">
                <el-input-number
                  v-model="form.amount"
                  :min="1000"
                  :max="100000000000"
                  :step="50000"
                  :disabled="isBankTransaction"
                  controls-position="right"
                  class="prominent-amount-input"
                  style="width: 100%"
                />
                <div class="amount-preview">
                  {{ formatCurrency(form.amount) }}
                </div>
              </div>
            </el-form-item>
          </div>

          <!-- 3. Account Selectors -->
          <div class="row-2-cols">
            <!-- Account (From Account) -->
            <el-form-item
              :label="form.type === 'TRANSFER' ? 'Tài khoản nguồn (Chuyển đi)' : 'Tài khoản thanh toán'"
              prop="accountId"
            >
              <el-select
                v-model="form.accountId"
                placeholder="Chọn tài khoản"
                :disabled="isBankTransaction"
                style="width: 100%"
              >
                <el-option
                  v-for="acc in accountStore.activeAccounts"
                  :key="acc.id"
                  :label="`${acc.name} (${formatCurrency(acc.currentBalance)})`"
                  :value="acc.id"
                />
              </el-select>
            </el-form-item>

            <!-- Destination Account (Only for TRANSFER) -->
            <el-form-item
              v-if="form.type === 'TRANSFER'"
              label="Tài khoản đích (Nhận tiền)"
              prop="toAccountId"
            >
              <el-select
                v-model="form.toAccountId"
                placeholder="Chọn tài khoản nhận"
                style="width: 100%"
              >
                <el-option
                  v-for="acc in accountStore.activeAccounts.filter(a => a.id !== form.accountId)"
                  :key="acc.id"
                  :label="`${acc.name} (${formatCurrency(acc.currentBalance)})`"
                  :value="acc.id"
                />
              </el-select>
            </el-form-item>

            <!-- Category (Only for INCOME or EXPENSE) -->
            <el-form-item
              v-else-if="form.type === 'INCOME' || form.type === 'EXPENSE'"
              label="Danh mục thu chi"
              prop="categoryId"
            >
              <el-select
                v-model="form.categoryId"
                placeholder="Chọn danh mục"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="cat in availableCategories"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.id"
                >
                  <span
                    class="category-color-dot"
                    :style="{ backgroundColor: cat.color }"
                  ></span>
                  <span>{{ cat.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>

            <!-- Related Debt Selector (For debt repayment / collection) -->
            <el-form-item
              v-else-if="isDebtRelatedType"
              label="Khoản nợ liên quan"
              prop="debtId"
            >
              <el-select
                v-model="form.debtId"
                placeholder="Chọn khoản nợ liên kết"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="d in availableDebts"
                  :key="d.id"
                  :label="`${d.personName} - Còn: ${formatCurrency(d.remainingAmount)} (${d.description})`"
                  :value="d.id"
                />
              </el-select>
            </el-form-item>
          </div>

          <!-- 4. Date & Time Picker -->
          <el-form-item label="Thời gian giao dịch" prop="transactionDate">
            <el-date-picker
              v-model="form.transactionDate"
              type="datetime"
              placeholder="Chọn ngày và giờ"
              :disabled="isBankTransaction"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>

          <!-- 5. Description -->
          <el-form-item label="Nội dung mô tả" prop="description">
            <el-input
              v-model="form.description"
              placeholder="Ví dụ: Mua sắm siêu thị, Ăn tối cùng bạn..."
            />
          </el-form-item>

          <!-- Original Bank Description (Readonly if Bank) -->
          <el-form-item
            v-if="isBankTransaction && form.originalDescription"
            label="Mô tả gốc ngân hàng (Sao kê)"
          >
            <el-input
              :model-value="form.originalDescription"
              disabled
              type="textarea"
              :rows="2"
            />
          </el-form-item>

          <!-- 6. Expense Debt Allocation (Cost Sharing) -->
          <DebtAllocationInput
            v-if="form.type === 'EXPENSE'"
            v-model="form.allocations"
            :transaction-amount="form.amount"
          />

          <!-- 7. Note -->
          <el-form-item label="Ghi chú thêm">
            <el-input
              v-model="form.note"
              type="textarea"
              :rows="3"
              placeholder="Ghi chú chi tiết, số hóa đơn hoặc lưu ý thêm..."
            />
          </el-form-item>

          <!-- Form Submit Actions -->
          <div class="form-actions">
            <el-button size="large" @click="router.back()">Hủy bỏ</el-button>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              native-type="submit"
              class="submit-button"
            >
              {{ isEdit ? 'Lưu thay đổi' : 'Ghi nhận giao dịch' }}
            </el-button>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowLeft, Top, Bottom, Switch } from '@element-plus/icons-vue'
import { useTransactionStore } from '@/stores/transaction'
import { useAccountStore } from '@/stores/account'
import { useCategoryStore } from '@/stores/category'
import { useDebtStore } from '@/stores/debt'
import type { CreateTransactionDto } from '@/types/transaction'
import type { DebtAllocation } from '@/types/debt'
import { formatCurrency } from '@/utils/currency'
import { ElMessage } from 'element-plus'
import DebtAllocationInput from '@/components/transactions/DebtAllocationInput.vue'

const route = useRoute()
const router = useRouter()

const transactionStore = useTransactionStore()
const accountStore = useAccountStore()
const categoryStore = useCategoryStore()
const debtStore = useDebtStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const isEdit = computed(() => !!route.params.id && route.params.id !== 'create')
const isBankTransaction = ref(false)

interface FormState extends CreateTransactionDto {
  originalDescription?: string
  allocations: DebtAllocation[]
}

const form = reactive<FormState>({
  type: 'EXPENSE',
  amount: 100000,
  accountId: '',
  toAccountId: '',
  categoryId: '',
  debtId: '',
  transactionDate: new Date().toISOString().slice(0, 19),
  description: '',
  originalDescription: '',
  note: '',
  allocations: [] as DebtAllocation[]
})

const rules: FormRules = {
  type: [{ required: true, message: 'Vui lòng chọn loại giao dịch', trigger: 'change' }],
  amount: [
    { required: true, message: 'Vui lòng nhập số tiền', trigger: 'blur' },
    {
      validator: (_rule, val, callback) => {
        if (!val || val <= 0) callback(new Error('Số tiền phải lớn hơn 0'))
        else callback()
      },
      trigger: 'blur'
    }
  ],
  accountId: [{ required: true, message: 'Vui lòng chọn tài khoản', trigger: 'change' }],
  toAccountId: [
    {
      validator: (_rule, val, callback) => {
        if (form.type === 'TRANSFER' && !val) {
          callback(new Error('Vui lòng chọn tài khoản nhận'))
        } else if (form.type === 'TRANSFER' && val === form.accountId) {
          callback(new Error('Tài khoản nhận phải khác tài khoản nguồn'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  transactionDate: [{ required: true, message: 'Vui lòng chọn ngày giờ', trigger: 'change' }],
  description: [{ required: true, message: 'Vui lòng nhập nội dung mô tả', trigger: 'blur' }]
}

const availableCategories = computed(() => {
  if (form.type === 'INCOME') return categoryStore.incomeCategories
  if (form.type === 'EXPENSE') return categoryStore.expenseCategories
  return []
})

const isDebtRelatedType = computed(() => {
  return ['BORROW_RECEIVED', 'LOAN_GIVEN', 'DEBT_REPAYMENT', 'DEBT_COLLECTION'].includes(form.type)
})

const availableDebts = computed(() => {
  if (form.type === 'DEBT_COLLECTION') {
    return debtStore.receivables.filter(d => d.status !== 'PAID' && d.status !== 'CANCELLED')
  }
  if (form.type === 'DEBT_REPAYMENT') {
    return debtStore.payables.filter(d => d.status !== 'PAID' && d.status !== 'CANCELLED')
  }
  return debtStore.debts
})

function handleTypeChange(val: any) {
  if (val !== 'EXPENSE') {
    form.allocations = []
  }
  if (val === 'TRANSFER') {
    form.categoryId = undefined
  }
}

async function loadTransaction() {
  if (!isEdit.value) {
    if (accountStore.activeAccounts.length > 0) {
      form.accountId = accountStore.activeAccounts[0].id
    }
    return
  }

  const id = route.params.id as string
  try {
    const tx = transactionStore.transactions.find(t => t.id === id)
    if (tx) {
      form.type = tx.type
      form.amount = tx.amount
      form.accountId = tx.accountId
      form.toAccountId = tx.toAccountId || ''
      form.categoryId = tx.categoryId || ''
      form.description = tx.description
      form.originalDescription = tx.originalDescription
      form.note = tx.note || ''
      form.transactionDate = tx.transactionDate
      form.allocations = tx.allocations || []
      isBankTransaction.value = tx.source === 'BANK'
    }
  } catch (err) {
    console.error('Failed to load transaction detail', err)
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // Validate allocations total <= amount
      if (form.type === 'EXPENSE' && form.allocations && form.allocations.length > 0) {
        const totalAlloc = form.allocations.reduce((sum, a) => sum + (a.allocatedAmount || 0), 0)
        if (totalAlloc > form.amount) {
          ElMessage.error('Tổng số tiền phân chia người khác nợ không được vượt quá số tiền chi tiêu!')
          return
        }
      }

      loading.value = true
      try {
        if (isEdit.value) {
          await transactionStore.updateTransaction(route.params.id as string, form)
        } else {
          await transactionStore.createTransaction(form)
        }
        router.push('/transactions')
      } catch (err) {
        // Handled in store
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(async () => {
  await Promise.all([
    accountStore.fetchAccounts(),
    categoryStore.fetchCategories(),
    debtStore.fetchDebts()
  ])
  loadTransaction()
})
</script>

<style scoped lang="scss">
.transaction-form-view {
  display: flex;
  justify-content: center;
  padding-bottom: 40px;

  .form-container {
    width: 100%;
    max-width: 760px;
  }

  .form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .form-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--app-text);
    }
  }

  .bank-notice-alert {
    margin-bottom: 16px;
    border-radius: 10px;
  }

  .form-card {
    border-radius: 16px;
    padding: 10px;
  }

  .type-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
  }

  .amount-input-section {
    margin: 16px 0;
    padding: 16px;
    background: var(--el-table-header-bg-color);
    border-radius: 12px;
    border: 1px solid var(--app-card-border);

    .amount-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .amount-preview {
      font-size: 1.5rem;
      font-weight: 800;
      color: #10B981;
    }
  }

  .row-2-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
      gap: 0;
    }
  }

  .category-color-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 8px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--app-card-border);

    .submit-button {
      min-width: 160px;
      font-weight: 600;
    }
  }
}
</style>

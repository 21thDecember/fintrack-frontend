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
          <span>Giao dịch đồng bộ từ sao kê Ngân hàng. Số tiền, tài khoản và thời gian được cố định. Bạn có thể thay đổi loại giao dịch ({{ bankDirection === 'IN' ? 'Thu nhập, Thu hồi nợ, Đi vay' : 'Chi tiêu, Trả nợ, Cho vay' }}), gắn khoản nợ hoặc cập nhật nội dung.</span>
        </template>
      </el-alert>

      <el-card class="form-card" shadow="never">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          size="large"
          novalidate
          @submit.prevent="handleSubmit"
        >
          <!-- 1. Transaction Type Selector -->
          <el-form-item label="Loại giao dịch" prop="type">
            <el-radio-group
              v-model="form.type"
              class="type-radio-group"
              @change="handleTypeChange"
            >
              <div class="type-section-group">
                <span class="type-group-label">Thu chi thường ngày:</span>
                <div class="type-btn-row">
                  <el-radio-button label="EXPENSE" :disabled="isTypeDisabled('EXPENSE')">
                    <el-icon class="mr-1"><Top /></el-icon> Chi tiêu
                  </el-radio-button>
                  <el-radio-button label="INCOME" :disabled="isTypeDisabled('INCOME')">
                    <el-icon class="mr-1"><Bottom /></el-icon> Thu nhập
                  </el-radio-button>
                  <el-radio-button label="TRANSFER" :disabled="isTypeDisabled('TRANSFER')">
                    <el-icon class="mr-1"><Switch /></el-icon> Chuyển khoản
                  </el-radio-button>
                </div>
              </div>

              <div class="type-section-group mt-3">
                <span class="type-group-label">Nghiệp vụ công nợ:</span>
                <div class="type-btn-row">
                  <el-radio-button label="LOAN_GIVEN" :disabled="isTypeDisabled('LOAN_GIVEN')">
                    <el-icon class="mr-1"><Promotion /></el-icon> Cho vay
                  </el-radio-button>
                  <el-radio-button label="BORROW_RECEIVED" :disabled="isTypeDisabled('BORROW_RECEIVED')">
                    <el-icon class="mr-1"><Download /></el-icon> Đi vay
                  </el-radio-button>
                  <el-radio-button label="DEBT_COLLECTION" :disabled="isTypeDisabled('DEBT_COLLECTION')">
                    <el-icon class="mr-1"><CircleCheck /></el-icon> Thu hồi nợ
                  </el-radio-button>
                  <el-radio-button label="DEBT_REPAYMENT" :disabled="isTypeDisabled('DEBT_REPAYMENT')">
                    <el-icon class="mr-1"><CreditCard /></el-icon> Trả nợ
                  </el-radio-button>
                </div>
              </div>
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
                  :step="1"
                  :disabled="isBankTransaction"
                  controls-position="right"
                  class="prominent-amount-input"
                  style="width: 100%"
                />
                <div
                  class="amount-preview"
                  :class="form.type === 'TRANSFER' ? 'text-transfer' : (isExpenseType ? 'text-expense' : 'text-income')"
                >
                  {{ form.type === 'TRANSFER' ? '' : (isExpenseType ? '-' : '+') }}{{ formatCurrency(form.amount) }}
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
              v-else-if="isDebtSettlementType"
              label="Khoản nợ liên quan trong Sổ nợ"
              prop="debtIds"
            >
              <el-select
                v-model="form.debtIds"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="Chọn một hoặc nhiều khoản nợ cần thanh toán/thu hồi"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="d in availableDebts"
                  :key="d.id"
                  :label="`${d.personName} - Còn: ${formatCurrency(d.remainingAmount)} (${d.description})`"
                  :value="d.id"
                >
                  <div class="flex justify-between items-center w-full">
                    <span>
                      <strong class="text-gray-900">{{ d.personName }}</strong>: {{ d.description }}
                    </span>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                      Còn: {{ formatCurrency(d.remainingAmount) }}
                    </span>
                  </div>
                </el-option>
              </el-select>
              <div v-if="selectedDebtsTotalRemaining > 0" class="mt-2 text-xs flex flex-wrap gap-2 items-center justify-between p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-blue-900">
                <span>Tổng nợ còn lại của các khoản đã chọn: <strong>{{ formatCurrency(selectedDebtsTotalRemaining) }}</strong></span>
                <span v-if="form.amount < selectedDebtsTotalRemaining" class="text-amber-700 font-medium">
                  (Giao dịch sẽ thanh toán tuần tự một phần)
                </span>
                <span v-else-if="form.amount === selectedDebtsTotalRemaining" class="text-emerald-700 font-medium">
                  (Đủ thanh toán trọn gói các khoản nợ đã chọn)
                </span>
              </div>
            </el-form-item>

            <!-- Person Selector for LOAN_GIVEN (Cho vay) or BORROW_RECEIVED (Đi vay) -->
            <el-form-item
              v-else-if="isLoanOrBorrowType"
              :label="form.type === 'LOAN_GIVEN' ? 'Người vay tiền (Ghi nợ phải thu)' : 'Người cho vay (Ghi nợ phải trả)'"
              prop="personId"
            >
              <div style="display: flex; gap: 8px; width: 100%;">
                <el-select
                  v-model="form.personId"
                  :placeholder="form.type === 'LOAN_GIVEN' ? 'Chọn người vay tiền...' : 'Chọn người cho vay...'"
                  filterable
                  clearable
                  style="flex: 1;"
                >
                  <el-option
                    v-for="p in personStore.persons"
                    :key="p.id"
                    :label="p.name"
                    :value="p.id"
                  >
                    <span>{{ p.name }}</span>
                    <span v-if="p.phone" style="float: right; color: #8492a6; font-size: 12px">{{ p.phone }}</span>
                  </el-option>
                  <template #empty>
                    <div style="padding: 12px; text-align: center;">
                      <p style="color: var(--app-text-muted); font-size: 13px; margin-bottom: 6px;">Chưa có người liên hệ nào</p>
                      <el-button type="primary" size="small" :icon="Plus" @click="showQuickCreatePerson = true">Thêm người mới</el-button>
                    </div>
                  </template>
                </el-select>
                <el-button type="primary" plain :icon="Plus" @click="showQuickCreatePerson = true">
                  Thêm mới
                </el-button>
              </div>
              <div class="mt-2 text-xs p-2.5 rounded-lg" :class="form.type === 'LOAN_GIVEN' ? 'bg-emerald-50/70 border border-emerald-100 text-emerald-900' : 'bg-rose-50/70 border border-rose-100 text-rose-900'">
                <span v-if="form.type === 'LOAN_GIVEN'">
                  💡 Hệ thống sẽ tự động tạo khoản nợ <strong>Phải thu (Họ nợ mình)</strong> với số tiền <strong>{{ formatCurrency(form.amount) }}</strong> trong Sổ nợ.
                </span>
                <span v-else>
                  💡 Hệ thống sẽ tự động tạo khoản nợ <strong>Phải trả (Mình nợ họ)</strong> với số tiền <strong>{{ formatCurrency(form.amount) }}</strong> trong Sổ nợ.
                </span>
              </div>
            </el-form-item>
          </div>

          <!-- Loan Due Date (If Loan or Borrow) -->
          <el-form-item v-if="isLoanOrBorrowType" label="Hạn trả nợ (tùy chọn)">
            <el-date-picker
              v-model="form.dueDate"
              type="date"
              placeholder="Chọn ngày hẹn trả nợ"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>

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

    <!-- Quick Create Person Dialog -->
    <el-dialog
      v-model="showQuickCreatePerson"
      title="Thêm người liên hệ mới"
      width="420px"
      append-to-body
      destroy-on-close
    >
      <el-form :model="newPersonForm" label-position="top">
        <el-form-item label="Họ và tên" required>
          <el-input
            v-model="newPersonForm.name"
            placeholder="Ví dụ: Nguyễn Văn A, Anh Minh..."
            autofocus
            @keyup.enter="handleQuickCreatePerson"
          />
        </el-form-item>
        <el-form-item label="Số điện thoại">
          <el-input
            v-model="newPersonForm.phone"
            placeholder="Ví dụ: 0912345678"
            @keyup.enter="handleQuickCreatePerson"
          />
        </el-form-item>
        <el-form-item label="Ghi chú">
          <el-input
            v-model="newPersonForm.note"
            type="textarea"
            :rows="2"
            placeholder="Ví dụ: Bạn đại học, đồng nghiệp công ty..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <el-button @click="showQuickCreatePerson = false">Hủy</el-button>
          <el-button type="primary" :loading="creatingPerson" @click="handleQuickCreatePerson">
            Lưu người này
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowLeft, Top, Bottom, Switch, Plus, Promotion, Download, CircleCheck, CreditCard } from '@element-plus/icons-vue'
import { transactionApi } from '@/api/transactionApi'
import { useTransactionStore } from '@/stores/transaction'
import { useAccountStore } from '@/stores/account'
import { useCategoryStore } from '@/stores/category'
import { useDebtStore } from '@/stores/debt'
import { usePersonStore } from '@/stores/person'
import type { CreateTransactionDto, TransactionDirection } from '@/types/transaction'
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
const personStore = usePersonStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const isEdit = computed(() => !!route.params.id && route.params.id !== 'create')
const isBankTransaction = ref(false)
const bankDirection = ref<TransactionDirection | null>(null)

const isExpenseType = computed(() => {
  return ['EXPENSE', 'LOAN_GIVEN', 'DEBT_REPAYMENT'].includes(form.type)
})

const showQuickCreatePerson = ref(false)
const creatingPerson = ref(false)
const newPersonForm = reactive({
  name: '',
  phone: '',
  note: ''
})

async function handleQuickCreatePerson() {
  if (!newPersonForm.name.trim()) {
    ElMessage.warning('Vui lòng nhập họ và tên người liên hệ')
    return
  }
  creatingPerson.value = true
  try {
    const created = await personStore.createPerson({
      name: newPersonForm.name.trim(),
      phone: newPersonForm.phone.trim() || undefined,
      note: newPersonForm.note.trim() || undefined
    })
    form.personId = created.id
    showQuickCreatePerson.value = false
    newPersonForm.name = ''
    newPersonForm.phone = ''
    newPersonForm.note = ''
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || 'Không thể tạo người liên hệ')
  } finally {
    creatingPerson.value = false
  }
}

interface FormState extends CreateTransactionDto {
  originalDescription?: string
  allocations: DebtAllocation[]
}

function isTypeDisabled(type: string): boolean {
  if (!isBankTransaction.value) return false
  if (bankDirection.value === 'IN') {
    return !['INCOME', 'DEBT_COLLECTION', 'BORROW_RECEIVED'].includes(type)
  }
  if (bankDirection.value === 'OUT') {
    return !['EXPENSE', 'DEBT_REPAYMENT', 'LOAN_GIVEN'].includes(type)
  }
  return false
}

const form = reactive<FormState>({
  type: 'EXPENSE',
  amount: 100000,
  accountId: '',
  toAccountId: '',
  categoryId: '',
  personId: '',
  dueDate: undefined,
  debtId: '',
  debtIds: [] as string[],
  debtAllocations: [] as DebtAllocation[],
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
  personId: [
    {
      validator: (_rule, val, callback) => {
        if (isLoanOrBorrowType.value && !val) {
          callback(new Error(form.type === 'LOAN_GIVEN' ? 'Vui lòng chọn người vay tiền' : 'Vui lòng chọn người cho vay'))
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
  if (form.type === 'INCOME') return categoryStore.activeIncomeCategories
  if (form.type === 'EXPENSE') return categoryStore.activeExpenseCategories
  return []
})

const isDebtSettlementType = computed(() => {
  return ['DEBT_REPAYMENT', 'DEBT_COLLECTION'].includes(form.type)
})

const isLoanOrBorrowType = computed(() => {
  return ['LOAN_GIVEN', 'BORROW_RECEIVED'].includes(form.type)
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

const selectedDebtsTotalRemaining = computed(() => {
  if (!form.debtIds || form.debtIds.length === 0) return 0
  return debtStore.debts
    .filter(d => form.debtIds?.includes(d.id))
    .reduce((sum, d) => sum + (d.remainingAmount || 0), 0)
})

function handleTypeChange(val: any) {
  if (val !== 'EXPENSE') {
    form.allocations = []
    form.debtAllocations = []
  }
  if (val !== 'INCOME' && val !== 'EXPENSE') {
    form.categoryId = undefined
  }
  if (val !== 'TRANSFER') {
    form.toAccountId = ''
  }
  if (!isDebtSettlementType.value) {
    form.debtId = ''
    form.debtIds = []
  }
  if (!isLoanOrBorrowType.value) {
    form.personId = ''
    form.dueDate = undefined
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
    const tx = await transactionApi.getTransactionById(id)
    if (tx) {
      form.type = tx.type
      form.amount = tx.amount
      form.accountId = tx.accountId
      form.toAccountId = tx.toAccountId || ''
      form.categoryId = tx.categoryId || ''
      form.debtIds = (tx as any).debtIds || ((tx as any).debtId ? [(tx as any).debtId] : [])
      form.debtId = form.debtIds && form.debtIds.length > 0 ? form.debtIds[0] : ''
      form.personId = (tx as any).personId || ''
      form.dueDate = (tx as any).dueDate || undefined
      form.description = tx.description
      form.originalDescription = tx.originalDescription
      form.note = (tx.note && tx.note.startsWith('Cổng:') && tx.note.includes('Tích lũy:')) ? '' : (tx.note || '')
      form.transactionDate = tx.transactionDate
      form.allocations = tx.debtAllocations?.map((a: any) => ({
        id: a.id,
        debtId: a.debtId,
        personId: a.personId,
        personName: a.personName,
        allocatedAmount: a.allocatedAmount,
        note: a.note || ''
      })) || []
      isBankTransaction.value = tx.source === 'BANK'
      bankDirection.value = tx.direction || (tx.type === 'INCOME' ? 'IN' : 'OUT')
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
        const validAllocations = form.allocations.filter(a => a.personId && (a.allocatedAmount || 0) > 0)
        const totalAlloc = validAllocations.reduce((sum, a) => sum + (a.allocatedAmount || 0), 0)
        if (totalAlloc > form.amount) {
          ElMessage.error('Tổng số tiền phân chia người khác nợ không được vượt quá số tiền chi tiêu!')
          return
        }
        form.debtAllocations = validAllocations.map(a => ({
          personId: a.personId,
          allocatedAmount: a.allocatedAmount,
          note: a.note || undefined,
          dueDate: a.dueDate || undefined
        }))
      } else {
        form.debtAllocations = []
      }

      if (form.type !== 'LOAN_GIVEN' && form.type !== 'BORROW_RECEIVED') {
        form.personId = undefined
        form.dueDate = undefined
      }

      if (form.debtIds && form.debtIds.length > 0) {
        form.debtId = form.debtIds[0]
      } else {
        form.debtId = undefined
      }

      loading.value = true
      try {
        if (form.type !== 'INCOME' && form.type !== 'EXPENSE') {
          form.categoryId = undefined
        }
        if (form.transactionDate && !isBankTransaction.value) {
          const d = new Date(form.transactionDate)
          if (!isNaN(d.getTime())) {
            form.transactionDate = d.toISOString()
          }
        }
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
    debtStore.fetchDebts(),
    personStore.fetchPersons()
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
    border-radius: 12px;
    border: 1px solid var(--app-card-border);
    box-shadow: none;
    padding: 10px;
  }

  .type-radio-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;

    .type-section-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .type-group-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--app-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .type-btn-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  }

  .amount-input-section {
    margin: 16px 0;
    padding: 16px;
    background: var(--app-bg);
    border-radius: 10px;
    border: 1px solid var(--app-card-border);

    .amount-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .amount-preview {
      font-size: 1.5rem;
      font-weight: 800;
      transition: color 0.2s ease;

      &.text-expense {
        color: #EF4444;
      }
      &.text-income {
        color: #10B981;
      }
      &.text-transfer {
        color: #3B82F6;
      }
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

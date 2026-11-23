<template>
  <el-dialog
    v-model="visible"
    :title="`Ghi nhận thanh toán: ${debt?.personName}`"
    width="480px"
    destroy-on-close
    append-to-body
  >
    <div v-if="debt" class="debt-quick-info">
      <div class="info-row">
        <span>Loại nợ:</span>
        <el-tag :type="debt.type === 'RECEIVABLE' ? 'success' : 'danger'" size="small">
          {{ debt.type === 'RECEIVABLE' ? 'Phải thu' : 'Phải trả' }}
        </el-tag>
      </div>
      <div class="info-row">
        <span>Còn lại phải thanh toán:</span>
        <strong class="text-income">{{ formatCurrency(debt.remainingAmount) }}</strong>
      </div>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" novalidate>
      <el-form-item label="Số tiền thanh toán" prop="amount">
        <el-input-number
          v-model="form.amount"
          :min="1000"
          :max="debt?.remainingAmount || 1000000000"
          :step="1"
          controls-position="right"
          style="width: 100%"
        />
        <div class="quick-amount-buttons">
          <el-button size="small" text @click="form.amount = debt?.remainingAmount || 0">
            Toàn bộ còn lại ({{ formatCurrency(debt?.remainingAmount) }})
          </el-button>
          <el-button
            v-if="debt && debt.remainingAmount > 1000000"
            size="small"
            text
            @click="form.amount = Math.round(debt.remainingAmount / 2)"
          >
            50% ({{ formatCurrency(Math.round(debt.remainingAmount / 2)) }})
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="Tài khoản giao dịch" prop="accountId">
        <el-select v-model="form.accountId" placeholder="Chọn tài khoản biến động tiền" style="width: 100%">
          <el-option
            v-for="acc in accountStore.activeAccounts"
            :key="acc.id"
            :label="`${acc.name} (${formatCurrency(acc.currentBalance)})`"
            :value="acc.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Ngày thanh toán" prop="paymentDate">
        <el-date-picker
          v-model="form.paymentDate"
          type="datetime"
          placeholder="Chọn ngày giờ"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Ghi chú">
        <el-input
          v-model="form.note"
          type="textarea"
          :rows="2"
          placeholder="Ghi chú thêm (ví dụ: Chuyển khoản VCB đợt 2...)"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">Hủy</el-button>
        <el-button type="primary" :loading="loading" @click="submitPayment">
          Xác nhận thanh toán
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Debt } from '@/types/debt'
import { useDebtStore } from '@/stores/debt'
import { useAccountStore } from '@/stores/account'
import { formatCurrency } from '@/utils/currency'
import { ElMessage } from 'element-plus'

interface Props {
  modelValue: boolean
  debt: Debt | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const debtStore = useDebtStore()
const accountStore = useAccountStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const visible = ref(props.modelValue)
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.debt) {
    form.amount = props.debt.remainingAmount
    form.paymentDate = new Date().toISOString()
  }
})
watch(visible, (val) => emit('update:modelValue', val))

const form = reactive({
  amount: 0,
  accountId: '',
  paymentDate: new Date().toISOString(),
  note: ''
})

const rules: FormRules = {
  amount: [
    { required: true, message: 'Vui lòng nhập số tiền', trigger: 'blur' },
    {
      validator: (_rule, val, callback) => {
        if (!val || val <= 0) {
          callback(new Error('Số tiền phải lớn hơn 0'))
        } else if (props.debt && val > props.debt.remainingAmount) {
          callback(new Error('Số tiền không được vượt quá số còn lại'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  paymentDate: [{ required: true, message: 'Vui lòng chọn ngày thanh toán', trigger: 'change' }]
}

async function submitPayment() {
  if (!formRef.value || !props.debt) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await debtStore.recordPayment(props.debt!.id, {
          amount: form.amount,
          accountId: form.accountId || undefined,
          paymentDate: form.paymentDate,
          note: form.note
        })
        emit('success')
        visible.value = false
      } catch (err) {
        ElMessage.error('Có lỗi xảy ra khi ghi nhận thanh toán')
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  if (accountStore.accounts.length === 0) {
    accountStore.fetchAccounts()
  }
})
</script>

<style scoped lang="scss">
.debt-quick-info {
  background-color: var(--el-fill-color-light);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
  }
}

.quick-amount-buttons {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
</style>

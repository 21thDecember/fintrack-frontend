<template>
  <div class="debt-allocation-section">
    <div class="section-header" @click="isExpanded = !isExpanded">
      <div class="header-title">
        <el-icon :size="18" class="header-icon"><Share /></el-icon>
        <span class="font-semibold">Chia sẻ chi phí / Ghi nợ bạn bè (Split Bill)</span>
        <el-tag v-if="allocations.length > 0" size="small" type="success" effect="plain" round>
          {{ allocations.length }} người nợ ({{ formatCurrency(totalAllocated) }})
        </el-tag>
        <span v-if="allocations.length > 0 && yourShare >= 0" class="your-share-badge">
          • Thực chi của bạn: <strong>{{ formatCurrency(yourShare) }}</strong>
        </span>
      </div>
      <el-icon class="toggle-icon" :class="{ 'is-active': isExpanded }">
        <ArrowDown />
      </el-icon>
    </div>

    <div v-show="isExpanded" class="section-body">
      <p class="description-text">
        Khi bạn thanh toán giùm cả nhóm (ví dụ ăn uống, mua sắm...), hệ thống sẽ tự động ghi nhận các khoản nợ <strong>Phải thu (RECEIVABLE)</strong> tương ứng cho bạn bè trong Sổ nợ.
      </p>

      <!-- Allocation Rows -->
      <div class="allocation-list">
        <div v-if="allocations.length === 0" class="empty-allocation-notice">
          <span>Chưa có người nào được phân bổ chia tiền. Bấm nút <strong>"⚡ Chia đều hóa đơn"</strong> hoặc <strong>"Thêm người chia"</strong> bên dưới.</span>
        </div>
        <div v-for="(item, index) in allocations" :key="index" class="allocation-item">
          <div class="item-grid">
            <!-- Person Select -->
            <div class="person-col">
              <el-select
                v-model="item.personId"
                placeholder="Chọn người nợ..."
                filterable
                style="width: 100%"
                @change="handlePersonChange(item)"
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
              </el-select>
            </div>

            <!-- Amount Input -->
            <div class="amount-col">
              <el-input-number
                v-model="item.allocatedAmount"
                :min="0"
                :max="transactionAmount"
                :step="1"
                controls-position="right"
                placeholder="Số tiền chia"
                style="width: 100%"
              />
            </div>

            <!-- Note Input -->
            <div class="note-col">
              <el-input
                v-model="item.note"
                placeholder="Ghi chú (tùy chọn)"
                maxlength="100"
              />
            </div>

            <!-- Remove Button -->
            <div class="action-col">
              <el-button
                type="danger"
                link
                :icon="Delete"
                @click="removeAllocation(index)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Actions & Quick Add -->
      <div class="allocation-actions">
        <el-button type="success" plain size="small" :icon="Operation" @click="openSplitDialog">
          ⚡ Chia đều hóa đơn
        </el-button>
        <el-button type="primary" plain size="small" :icon="Plus" @click="addAllocation">
          Thêm người chia
        </el-button>
        <el-button text size="small" :icon="User" @click="showQuickCreatePerson = true">
          Tạo nhanh người mới
        </el-button>
      </div>

      <!-- Summary Balance Bar -->
      <div class="allocation-summary" :class="{ 'is-overflow': totalAllocated > transactionAmount }">
        <div class="summary-item">
          <span>Tổng hóa đơn:</span>
          <strong>{{ formatCurrency(transactionAmount) }}</strong>
        </div>
        <div class="summary-item">
          <span>Bạn bè nợ lại:</span>
          <strong style="color: #3B82F6;">+{{ formatCurrency(totalAllocated) }}</strong>
        </div>
        <div class="summary-item your-share">
          <span>Thực tế bạn chi:</span>
          <strong :class="yourShare >= 0 ? 'text-income' : 'text-expense'">
            {{ formatCurrency(yourShare) }}
          </strong>
        </div>
      </div>

      <div v-if="totalAllocated > transactionAmount" class="error-warning">
        <el-icon><Warning /></el-icon>
        <span>Tổng số tiền phân bổ vượt quá tổng hóa đơn!</span>
      </div>
    </div>

    <!-- Quick Split Equal Dialog -->
    <el-dialog
      v-model="showSplitDialog"
      title="⚡ Chia đều hóa đơn (Split Bill)"
      width="460px"
      append-to-body
    >
      <div style="font-size: 13px; color: var(--app-text-muted); margin-bottom: 16px;">
        Chọn danh sách bạn bè cùng ăn uống / chi tiêu. Hệ thống sẽ tự động tính phần tiền đều nhau cho mỗi người.
      </div>

      <el-form label-position="top">
        <el-form-item label="Chọn bạn bè cùng chia tiền">
          <el-select
            v-model="splitSelectedPersonIds"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="Chọn những người bạn cùng chia..."
            style="width: 100%"
          >
            <el-option
              v-for="p in personStore.persons"
              :key="p.id"
              :label="p.name"
              :value="p.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="splitIncludeMyself">
            <strong>Bao gồm cả tôi (Người thanh toán hóa đơn)</strong>
          </el-checkbox>
        </el-form-item>

        <!-- Preview Calculation -->
        <div v-if="splitTotalPeople > 0" class="split-preview-box">
          <div class="preview-row">
            <span>Tổng hóa đơn:</span>
            <strong>{{ formatCurrency(transactionAmount) }}</strong>
          </div>
          <div class="preview-row">
            <span>Số người chia:</span>
            <strong>{{ splitTotalPeople }} người {{ splitIncludeMyself ? '(Bạn + ' + splitSelectedPersonIds.length + ' bạn)' : '' }}</strong>
          </div>
          <div class="preview-row highlight">
            <span>Mỗi người chịu:</span>
            <span class="text-primary font-bold">{{ formatCurrency(splitAmountPerPerson) }}</span>
          </div>
          <div v-if="splitIncludeMyself" class="preview-row text-success">
            <span>Thực tế bạn chi:</span>
            <strong>{{ formatCurrency(splitAmountPerPerson) }}</strong>
          </div>
          <div class="preview-row text-danger">
            <span>Ghi nợ bạn bè ({{ splitSelectedPersonIds.length }} người):</span>
            <strong>+{{ formatCurrency(splitAmountPerPerson * splitSelectedPersonIds.length) }}</strong>
          </div>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="showSplitDialog = false">Hủy</el-button>
        <el-button
          type="primary"
          :disabled="splitSelectedPersonIds.length === 0"
          @click="applySplitEqual"
        >
          Áp dụng chia đều
        </el-button>
      </template>
    </el-dialog>

    <!-- Quick Create Person Dialog -->
    <el-dialog
      v-model="showQuickCreatePerson"
      title="Thêm nhanh người liên hệ"
      width="400px"
      append-to-body
    >
      <el-form :model="newPersonForm" label-position="top">
        <el-form-item label="Họ và tên" required>
          <el-input v-model="newPersonForm.name" placeholder="Ví dụ: Nguyễn Văn An" />
        </el-form-item>
        <el-form-item label="Số điện thoại">
          <el-input v-model="newPersonForm.phone" placeholder="Ví dụ: 0901234567" />
        </el-form-item>
        <el-form-item label="Ghi chú">
          <el-input v-model="newPersonForm.note" placeholder="Bạn bè, đồng nghiệp..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showQuickCreatePerson = false">Hủy</el-button>
        <el-button type="primary" :loading="personStore.loading" @click="handleCreatePerson">
          Lưu liên hệ
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Delete, Share, ArrowDown, User, Warning, Operation } from '@element-plus/icons-vue'
import { usePersonStore } from '@/stores/person'
import type { DebtAllocation } from '@/types/debt'
import { formatCurrency } from '@/utils/currency'
import { ElMessage } from 'element-plus'

interface Props {
  modelValue: DebtAllocation[]
  transactionAmount: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: DebtAllocation[]): void
}>()

const personStore = usePersonStore()
const isExpanded = ref(true)
const showQuickCreatePerson = ref(false)

const showSplitDialog = ref(false)
const splitSelectedPersonIds = ref<string[]>([])
const splitIncludeMyself = ref(true)

const allocations = computed({
  get: () => props.modelValue || [],
  set: (val) => emit('update:modelValue', val)
})

const totalAllocated = computed(() => {
  return allocations.value.reduce((sum, item) => sum + (item.allocatedAmount || 0), 0)
})

const yourShare = computed(() => {
  return props.transactionAmount - totalAllocated.value
})

const splitTotalPeople = computed(() => {
  return splitSelectedPersonIds.value.length + (splitIncludeMyself.value ? 1 : 0)
})

const splitAmountPerPerson = computed(() => {
  if (splitTotalPeople.value === 0) return 0
  return Math.round(props.transactionAmount / splitTotalPeople.value)
})

const newPersonForm = reactive({
  name: '',
  phone: '',
  note: ''
})

function openSplitDialog() {
  splitSelectedPersonIds.value = allocations.value.map(a => a.personId).filter(Boolean)
  showSplitDialog.value = true
}

function applySplitEqual() {
  if (splitSelectedPersonIds.value.length === 0) return

  const perPerson = splitAmountPerPerson.value
  const newAllocations: DebtAllocation[] = splitSelectedPersonIds.value.map(pId => {
    const p = personStore.persons.find(x => x.id === pId)
    return {
      personId: pId,
      personName: p?.name || '',
      allocatedAmount: perPerson,
      note: 'Chia đều hóa đơn'
    }
  })

  allocations.value = newAllocations
  isExpanded.value = true
  showSplitDialog.value = false
  ElMessage.success(`Đã chia đều cho ${newAllocations.length} người (${formatCurrency(perPerson)}/người)`)
}

function addAllocation() {
  const current = [...allocations.value]
  current.push({
    personId: '',
    personName: '',
    allocatedAmount: 0,
    note: ''
  })
  allocations.value = current
  isExpanded.value = true
}

function removeAllocation(index: number) {
  const current = [...allocations.value]
  current.splice(index, 1)
  allocations.value = current
}

function handlePersonChange(item: DebtAllocation) {
  const person = personStore.persons.find(p => p.id === item.personId)
  if (person) {
    item.personName = person.name
  }
}

async function handleCreatePerson() {
  if (!newPersonForm.name.trim()) {
    ElMessage.warning('Vui lòng nhập họ và tên')
    return
  }
  try {
    const created = await personStore.createPerson(newPersonForm)
    showQuickCreatePerson.value = false
    newPersonForm.name = ''
    newPersonForm.phone = ''
    newPersonForm.note = ''

    // Automatically set the new person to the latest empty allocation row
    const emptyRow = allocations.value.find(a => !a.personId)
    if (emptyRow) {
      emptyRow.personId = created.id
      emptyRow.personName = created.name
    } else {
      allocations.value = [
        ...allocations.value,
        {
          personId: created.id,
          personName: created.name,
          allocatedAmount: 0,
          note: ''
        }
      ]
    }
  } catch (err) {
    // Handled in store
  }
}

onMounted(() => {
  if (personStore.persons.length === 0) {
    personStore.fetchPersons()
  }
})
</script>

<style scoped lang="scss">
.debt-allocation-section {
  border: 1px solid var(--app-card-border);
  border-radius: 10px;
  background-color: var(--el-fill-color-blank);
  margin: 16px 0;
  overflow: hidden;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background-color: var(--el-table-header-bg-color);
    cursor: pointer;
    user-select: none;

    .header-title {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 0.9375rem;

      .header-icon {
        color: #3B82F6;
      }

      .your-share-badge {
        font-size: 0.8125rem;
        color: #10B981;
      }
    }

    .toggle-icon {
      transition: transform 0.25s ease;
      &.is-active {
        transform: rotate(180deg);
      }
    }
  }

  .section-body {
    padding: 16px;

    .description-text {
      font-size: 0.8125rem;
      color: var(--app-text-muted);
      margin-bottom: 14px;
    }

    .empty-allocation-notice {
      padding: 12px 14px;
      background: rgba(0, 0, 0, 0.02);
      border: 1px dashed var(--app-card-border);
      border-radius: 8px;
      font-size: 0.8125rem;
      color: var(--app-text-muted);
      margin-bottom: 12px;
    }
  }

  .allocation-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .allocation-item {
    background: var(--app-bg);
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--app-card-border);

    .item-grid {
      display: grid;
      grid-template-columns: 2fr 1.5fr 2fr 40px;
      gap: 10px;
      align-items: center;

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
        gap: 8px;

        .action-col {
          text-align: right;
        }
      }
    }
  }

  .allocation-actions {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .allocation-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    background-color: var(--el-fill-color-light);
    margin-top: 14px;
    font-size: 0.875rem;

    &.is-overflow {
      border: 1px solid #EF4444;
      background-color: rgba(239, 68, 68, 0.05);
    }
  }

  .error-warning {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #EF4444;
    font-size: 0.8125rem;
    margin-top: 8px;
    font-weight: 500;
  }
}

.split-preview-box {
  margin-top: 14px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.15);
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;

  .preview-row {
    display: flex;
    justify-content: space-between;

    &.highlight {
      padding-top: 6px;
      border-top: 1px dashed rgba(59, 130, 246, 0.2);
      font-size: 14px;
    }
    &.text-success {
      color: #10B981;
    }
    &.text-danger {
      color: #EF4444;
    }
  }
}
</style>

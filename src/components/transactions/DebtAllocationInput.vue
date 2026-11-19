<template>
  <div class="debt-allocation-section">
    <div class="section-header" @click="isExpanded = !isExpanded">
      <div class="header-title">
        <el-icon :size="18" class="header-icon"><Share /></el-icon>
        <span class="font-semibold">Phân chia chi phí / Người nợ tiền</span>
        <el-tag v-if="allocations.length > 0" size="small" type="success" effect="plain" round>
          {{ allocations.length }} người
        </el-tag>
      </div>
      <el-icon class="toggle-icon" :class="{ 'is-active': isExpanded }">
        <ArrowDown />
      </el-icon>
    </div>

    <div v-show="isExpanded" class="section-body">
      <p class="description-text">
        Chia sẻ hóa đơn này với bạn bè hoặc đồng nghiệp. Hệ thống sẽ tự động tạo khoản phải thu (RECEIVABLE) tương ứng.
      </p>

      <!-- Allocation Rows -->
      <div class="allocation-list">
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
                :step="50000"
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
          <span>Tổng phân bổ:</span>
          <strong>{{ formatCurrency(totalAllocated) }}</strong>
        </div>
        <div class="summary-item your-share">
          <span>Phần của bạn:</span>
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
import { Plus, Delete, Share, ArrowDown, User, Warning } from '@element-plus/icons-vue'
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
const isExpanded = ref(props.modelValue && props.modelValue.length > 0)
const showQuickCreatePerson = ref(false)

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

const newPersonForm = reactive({
  name: '',
  phone: '',
  note: ''
})

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
      gap: 8px;
      font-size: 0.9375rem;

      .header-icon {
        color: #3B82F6;
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
  }

  .allocation-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
</style>

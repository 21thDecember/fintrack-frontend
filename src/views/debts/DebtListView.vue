<template>
  <div class="debt-list-view">
    <!-- Summary Cards Row -->
    <div class="summary-cards-grid">
      <StatCard
        title="Tổng phải thu (Người nợ mình)"
        :value="debtStore.totalReceivable"
        subtitle="Cần thu hồi sớm"
        :icon="Money"
        icon-bg="rgba(16, 185, 129, 0.12)"
        icon-color="#10B981"
      />

      <StatCard
        title="Tổng phải trả (Mình nợ người)"
        :value="debtStore.totalPayable"
        subtitle="Cần sắp xếp dòng tiền"
        :icon="CreditCard"
        icon-bg="rgba(239, 68, 68, 0.12)"
        icon-color="#EF4444"
      />

      <StatCard
        title="Số khoản nợ đang mở"
        :value="`${debtStore.openCount} khoản`"
        :is-currency="false"
        subtitle="Chưa tất toán xong"
        :icon="Document"
        icon-bg="rgba(59, 130, 246, 0.12)"
        icon-color="#3B82F6"
      />
    </div>

    <!-- Main Tabs & Action Card -->
    <el-card class="debts-main-card" shadow="never">
      <div class="debts-header-row">
        <!-- Tabs -->
        <el-tabs v-model="activeTab" class="debt-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="Phải thu (RECEIVABLE)" name="RECEIVABLE" />
          <el-tab-pane label="Phải trả (PAYABLE)" name="PAYABLE" />
        </el-tabs>

        <!-- Right Action Button -->
        <div class="action-buttons">
          <el-button plain :icon="User" @click="showPersonManagement = true">
            Danh bạ người liên hệ ({{ personStore.persons.length }})
          </el-button>
          <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
            Tạo khoản nợ mới
          </el-button>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="filters-row">
        <el-select
          v-model="statusFilter"
          placeholder="Lọc theo trạng thái"
          clearable
          style="width: 180px"
        >
          <el-option label="Chưa trả (OPEN)" value="OPEN" />
          <el-option label="Trả một phần (PARTIAL)" value="PARTIAL" />
          <el-option label="Đã hoàn tất (PAID)" value="PAID" />
          <el-option label="Đã hủy (CANCELLED)" value="CANCELLED" />
        </el-select>

        <el-select
          v-model="personFilter"
          placeholder="Lọc theo người liên hệ"
          clearable
          filterable
          style="width: 220px"
        >
          <el-option
            v-for="p in personStore.persons"
            :key="p.id"
            :label="p.name"
            :value="p.id"
          />
        </el-select>

        <el-input
          v-model="searchKeyword"
          placeholder="Tìm theo nội dung..."
          :prefix-icon="Search"
          clearable
          style="width: 240px"
        />
      </div>

      <!-- Debt Table (Desktop) -->
      <div v-if="!isMobile" class="table-container">
        <el-table
          v-loading="debtStore.loading"
          :data="filteredDebts"
          style="width: 100%"
          empty-text="Không có khoản nợ nào trong danh sách"
        >
          <el-table-column label="Đối tượng" min-width="160">
            <template #default="{ row }">
              <div class="person-cell">
                <router-link :to="`/debts/${row.id}`" class="person-link">
                  <strong>{{ row.personName }}</strong>
                </router-link>
                <span class="desc-text">{{ row.description }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Số tiền gốc" width="150" align="right">
            <template #default="{ row }">
              <span class="font-medium">{{ formatCurrency(row.principalAmount) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="Tiến độ thanh toán" width="200">
            <template #default="{ row }">
              <div class="progress-cell">
                <div class="progress-labels">
                  <span>Đã trả: {{ formatCurrency(row.paidAmount) }}</span>
                  <span class="pct">{{ calcProgress(row) }}%</span>
                </div>
                <el-progress
                  :percentage="calcProgress(row)"
                  :status="row.status === 'PAID' ? 'success' : undefined"
                  :stroke-width="8"
                  :show-text="false"
                />
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Còn lại" width="160" align="right">
            <template #default="{ row }">
              <strong :class="row.type === 'RECEIVABLE' ? 'text-income' : 'text-expense'">
                {{ formatCurrency(row.remainingAmount) }}
              </strong>
            </template>
          </el-table-column>

          <el-table-column label="Ngày đến hạn" width="140">
            <template #default="{ row }">
              <span v-if="row.dueDate" :class="{ 'text-danger': isOverdue(row.dueDate) && row.status !== 'PAID' }">
                {{ formatDate(row.dueDate) }}
              </span>
              <span v-else class="text-muted text-xs">Không có</span>
            </template>
          </el-table-column>

          <el-table-column label="Trạng thái" width="130" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusBadgeType(row.status)" effect="light">
                {{ getDebtStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="Thao tác" width="160" align="center">
            <template #default="{ row }">
              <el-button
                v-if="row.status !== 'PAID' && row.status !== 'CANCELLED'"
                type="primary"
                size="small"
                plain
                @click="openPaymentDialog(row)"
              >
                Trả bớt
              </el-button>
              <router-link :to="`/debts/${row.id}`">
                <el-button type="info" link size="small">Chi tiết</el-button>
              </router-link>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Mobile Cards List -->
      <div v-else class="mobile-debts-list">
        <div v-if="filteredDebts.length === 0" class="empty-state">
          <el-empty description="Không có khoản nợ nào" />
        </div>
        <div
          v-for="row in filteredDebts"
          :key="row.id"
          class="debt-mobile-card"
          @click="router.push(`/debts/${row.id}`)"
        >
          <div class="card-top">
            <strong>{{ row.personName }}</strong>
            <el-tag :type="getStatusBadgeType(row.status)" size="small">
              {{ getDebtStatusLabel(row.status) }}
            </el-tag>
          </div>
          <p class="card-desc">{{ row.description }}</p>
          <div class="card-progress">
            <el-progress
              :percentage="calcProgress(row)"
              :status="row.status === 'PAID' ? 'success' : undefined"
              :stroke-width="6"
            />
          </div>
          <div class="card-bottom">
            <span class="remaining-label">Còn lại:</span>
            <strong :class="row.type === 'RECEIVABLE' ? 'text-income' : 'text-expense'">
              {{ formatCurrency(row.remainingAmount) }}
            </strong>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Create Debt Dialog -->
    <el-dialog
      v-model="showCreateDialog"
      title="Tạo khoản nợ mới"
      width="500px"
      append-to-body
    >
      <el-form ref="createFormRef" :model="newDebtForm" :rules="createRules" label-position="top">
        <el-form-item label="Loại sổ nợ" prop="type">
          <el-radio-group v-model="newDebtForm.type">
            <el-radio-button label="RECEIVABLE">Phải thu (Họ nợ mình)</el-radio-button>
            <el-radio-button label="PAYABLE">Phải trả (Mình nợ họ)</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="Người liên quan" prop="personId">
          <div style="display: flex; gap: 8px; width: 100%;">
            <el-select
              v-model="newDebtForm.personId"
              placeholder="Chọn người liên quan..."
              filterable
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
                <div style="padding: 16px; text-align: center;">
                  <p style="color: var(--app-text-muted); font-size: 13px; margin-bottom: 8px;">Chưa có người liên hệ nào</p>
                  <el-button type="primary" size="small" :icon="Plus" @click="showCreatePersonDialog = true">
                    Thêm người mới ngay
                  </el-button>
                </div>
              </template>
            </el-select>
            <el-button type="primary" plain :icon="Plus" @click="showCreatePersonDialog = true">
              Thêm mới
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="Số tiền gốc" prop="principalAmount">
          <el-input-number
            v-model="newDebtForm.principalAmount"
            :min="1000"
            :max="100000000000"
            :step="100000"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Ngày đến hạn (tùy chọn)">
          <el-date-picker
            v-model="newDebtForm.dueDate"
            type="date"
            placeholder="Chọn hạn thanh toán"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Mô tả khoản nợ" prop="description">
          <el-input
            v-model="newDebtForm.description"
            type="textarea"
            :rows="2"
            placeholder="Ví dụ: Vay mượn mua laptop, Ăn uống share tiền..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">Hủy</el-button>
        <el-button type="primary" :loading="debtStore.loading" @click="handleCreateDebt">
          Tạo khoản nợ
        </el-button>
      </template>
    </el-dialog>

    <!-- Quick Create Person Dialog -->
    <el-dialog
      v-model="showCreatePersonDialog"
      title="Thêm người liên hệ mới"
      width="440px"
      append-to-body
    >
      <el-form ref="personFormRef" :model="personForm" :rules="personRules" label-position="top">
        <el-form-item label="Họ và tên" prop="name">
          <el-input v-model="personForm.name" placeholder="Ví dụ: Nguyễn Văn An, Bạn Nam..." />
        </el-form-item>
        <el-form-item label="Số điện thoại" prop="phone">
          <el-input v-model="personForm.phone" placeholder="Ví dụ: 0912345678 (tùy chọn)" />
        </el-form-item>
        <el-form-item label="Ghi chú" prop="note">
          <el-input v-model="personForm.note" placeholder="Ví dụ: Bạn đại học, đồng nghiệp..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreatePersonDialog = false">Hủy</el-button>
        <el-button type="primary" :loading="personStore.loading" @click="handleCreatePerson">
          Lưu người liên hệ
        </el-button>
      </template>
    </el-dialog>

    <!-- Person Management Dialog -->
    <el-dialog
      v-model="showPersonManagement"
      title="Danh bạ người liên hệ"
      width="620px"
      append-to-body
    >
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span style="color: var(--app-text-muted); font-size: 14px;">Quản lý những người liên quan trong sổ nợ & chi tiêu</span>
        <el-button type="primary" size="small" :icon="Plus" @click="showCreatePersonDialog = true">
          Thêm người mới
        </el-button>
      </div>

      <el-table :data="personStore.persons" style="width: 100%" max-height="350" empty-text="Chưa có người liên hệ nào">
        <el-table-column label="Họ và tên" prop="name" min-width="150">
          <template #default="{ row }">
            <strong>{{ row.name }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="Số điện thoại" prop="phone" width="140">
          <template #default="{ row }">
            {{ row.phone || '—' }}
          </template>
        </el-table-column>
        <el-table-column label="Ghi chú" prop="note" min-width="160">
          <template #default="{ row }">
            <span style="color: var(--app-text-muted);">{{ row.note || '—' }}</span>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="showPersonManagement = false">Đóng</el-button>
      </template>
    </el-dialog>

    <!-- Payment Dialog -->
    <DebtPaymentDialog
      v-model="showPaymentDialog"
      :debt="paymentDebt"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { Money, CreditCard, Document, Plus, Search, User } from '@element-plus/icons-vue'
import { useDebtStore } from '@/stores/debt'
import { usePersonStore } from '@/stores/person'
import { useResponsive } from '@/composables/useResponsive'
import type { Debt, DebtStatus, CreateDebtDto } from '@/types/debt'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { getDebtStatusLabel } from '@/utils/constants'
import StatCard from '@/components/common/StatCard.vue'
import DebtPaymentDialog from '@/components/debts/DebtPaymentDialog.vue'

const router = useRouter()
const { isMobile } = useResponsive()
const debtStore = useDebtStore()
const personStore = usePersonStore()

const activeTab = ref<'RECEIVABLE' | 'PAYABLE'>('RECEIVABLE')
const statusFilter = ref<DebtStatus | undefined>()
const personFilter = ref<string | undefined>()
const searchKeyword = ref('')

const showCreateDialog = ref(false)
const showPaymentDialog = ref(false)
const paymentDebt = ref<Debt | null>(null)
const createFormRef = ref<FormInstance>()

const newDebtForm = reactive<CreateDebtDto>({
  type: 'RECEIVABLE',
  personId: '',
  principalAmount: 1000000,
  dueDate: undefined,
  description: ''
})

const createRules: FormRules = {
  personId: [{ required: true, message: 'Vui lòng chọn người liên quan', trigger: 'change' }],
  principalAmount: [{ required: true, message: 'Vui lòng nhập số tiền gốc', trigger: 'blur' }],
  description: [{ required: true, message: 'Vui lòng nhập mô tả', trigger: 'blur' }]
}

const filteredDebts = computed(() => {
  return debtStore.debts.filter(d => {
    if (d.type !== activeTab.value) return false
    if (statusFilter.value && d.status !== statusFilter.value) return false
    if (personFilter.value && d.personId !== personFilter.value) return false
    if (searchKeyword.value) {
      const q = searchKeyword.value.toLowerCase()
      const matchName = d.personName?.toLowerCase().includes(q)
      const matchDesc = d.description?.toLowerCase().includes(q)
      if (!matchName && !matchDesc) return false
    }
    return true
  })
})

function calcProgress(debt: any) {
  if (!debt || !debt.principalAmount || debt.principalAmount <= 0) return 0
  const pct = Math.round(((debt.paidAmount || 0) / debt.principalAmount) * 100)
  return Math.min(100, Math.max(0, pct))
}

function isOverdue(dueDate: string) {
  return new Date(dueDate).getTime() < new Date().setHours(0, 0, 0, 0)
}

function getStatusBadgeType(status: DebtStatus) {
  switch (status) {
    case 'OPEN': return 'primary'
    case 'PARTIAL': return 'warning'
    case 'PAID': return 'success'
    case 'CANCELLED': return 'info'
    default: return 'info'
  }
}

function handleTabChange() {
  newDebtForm.type = activeTab.value
}

function openPaymentDialog(debt: any) {
  paymentDebt.value = debt
  showPaymentDialog.value = true
}

function handlePaymentSuccess() {
  debtStore.fetchDebts()
}

async function handleCreateDebt() {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (valid) {
      await debtStore.createDebt(newDebtForm)
      showCreateDialog.value = false
      newDebtForm.description = ''
      newDebtForm.dueDate = undefined
    }
  })
}

const showCreatePersonDialog = ref(false)
const showPersonManagement = ref(false)
const personFormRef = ref<FormInstance>()
const personForm = reactive({
  name: '',
  phone: '',
  note: ''
})
const personRules: FormRules = {
  name: [{ required: true, message: 'Vui lòng nhập họ và tên', trigger: 'blur' }]
}

async function handleCreatePerson() {
  if (!personFormRef.value) return
  await personFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const created = await personStore.createPerson({
          name: personForm.name.trim(),
          phone: personForm.phone ? personForm.phone.trim() : undefined,
          note: personForm.note ? personForm.note.trim() : undefined
        })
        newDebtForm.personId = created.id
        showCreatePersonDialog.value = false
        personForm.name = ''
        personForm.phone = ''
        personForm.note = ''
      } catch (err) {
        console.error('Failed to create person', err)
      }
    }
  })
}

onMounted(() => {
  debtStore.fetchDebts()
  personStore.fetchPersons()
})
</script>

<style scoped lang="scss">
.debt-list-view {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .summary-cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .debts-main-card {
    border-radius: 12px;

    .debts-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      border-bottom: 1px solid var(--app-card-border);
      margin-bottom: 16px;

      .debt-tabs {
        border-bottom: none;
      }
    }

    .filters-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .person-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .person-link {
        color: #10B981;
        &:hover {
          text-decoration: underline;
        }
      }

      .desc-text {
        font-size: 0.75rem;
        color: var(--app-text-muted);
      }
    }

    .progress-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .progress-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--app-text-muted);

        .pct {
          font-weight: 600;
        }
      }
    }

    .mobile-debts-list {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .debt-mobile-card {
        padding: 14px;
        background: var(--app-bg);
        border: 1px solid var(--app-card-border);
        border-radius: 10px;
        cursor: pointer;

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-desc {
          font-size: 0.8125rem;
          color: var(--app-text-muted);
          margin: 6px 0;
        }

        .card-progress {
          margin: 8px 0;
        }

        .card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }
      }
    }
  }
}
</style>

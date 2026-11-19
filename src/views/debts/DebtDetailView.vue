<template>
  <div class="debt-detail-view">
    <div class="header-nav">
      <el-button link :icon="ArrowLeft" @click="router.back()">Quay lại danh sách</el-button>
    </div>

    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="6" animated />
    </div>

    <div v-else-if="debt" class="detail-container">
      <!-- Debt Overview Card -->
      <el-card class="overview-card" shadow="never">
        <div class="overview-header">
          <div class="title-section">
            <h1 class="person-title">{{ debt.personName }}</h1>
            <p class="debt-description">{{ debt.description }}</p>
          </div>

          <div class="badges-section">
            <el-tag :type="debt.type === 'RECEIVABLE' ? 'success' : 'danger'" size="large" effect="dark">
              {{ debt.type === 'RECEIVABLE' ? 'Phải thu (Họ nợ mình)' : 'Phải trả (Mình nợ họ)' }}
            </el-tag>
            <el-tag :type="getStatusBadgeType(debt.status)" size="large" effect="light">
              {{ getDebtStatusLabel(debt.status) }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <!-- Numbers Grid -->
        <div class="numbers-grid">
          <div class="number-item">
            <span class="label">Số tiền gốc ban đầu</span>
            <strong class="value">{{ formatCurrency(debt.principalAmount) }}</strong>
          </div>

          <div class="number-item">
            <span class="label">Đã thanh toán</span>
            <strong class="value text-income">{{ formatCurrency(debt.paidAmount) }}</strong>
          </div>

          <div class="number-item">
            <span class="label">Còn lại cần tất toán</span>
            <strong class="value text-expense prominent">{{ formatCurrency(debt.remainingAmount) }}</strong>
          </div>

          <div class="number-item">
            <span class="label">Hạn thanh toán</span>
            <strong class="value">{{ debt.dueDate ? formatDate(debt.dueDate) : 'Không có' }}</strong>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-section">
          <div class="progress-labels">
            <span>Tiến độ thanh toán:</span>
            <strong>{{ calcProgress(debt) }}%</strong>
          </div>
          <el-progress
            :percentage="calcProgress(debt)"
            :status="debt.status === 'PAID' ? 'success' : undefined"
            :stroke-width="12"
          />
        </div>

        <!-- Action Bar -->
        <div class="overview-actions">
          <el-button
            v-if="debt.status !== 'PAID' && debt.status !== 'CANCELLED'"
            type="primary"
            size="large"
            :icon="Plus"
            @click="showPaymentDialog = true"
          >
            Ghi nhận thanh toán
          </el-button>

          <el-popconfirm
            v-if="debt.status !== 'PAID' && debt.status !== 'CANCELLED'"
            title="Bạn có chắc chắn muốn hủy bỏ khoản nợ này không?"
            confirm-button-text="Xác nhận hủy"
            cancel-button-text="Đóng"
            @confirm="handleCancelDebt"
          >
            <template #reference>
              <el-button type="danger" plain size="large">
                Hủy khoản nợ
              </el-button>
            </template>
          </el-popconfirm>
        </div>
      </el-card>

      <!-- Payment History Timeline Card -->
      <el-card class="history-card" shadow="never">
        <template #header>
          <div class="card-header-row">
            <div class="header-title">
              <el-icon><Calendar /></el-icon>
              <span>Lịch sử thanh toán & Trả góp</span>
            </div>
            <el-tag size="small" type="info">{{ debt.payments?.length || 0 }} lần giao dịch</el-tag>
          </div>
        </template>

        <div v-if="!debt.payments || debt.payments.length === 0" class="empty-history">
          <el-empty description="Chưa có lượt thanh toán nào được ghi nhận" :image-size="80" />
        </div>

        <div v-else class="timeline-container">
          <el-timeline>
            <el-timeline-item
              v-for="pay in debt.payments"
              :key="pay.id"
              :timestamp="formatDateTime(pay.paymentDate)"
              placement="top"
              type="success"
            >
              <div class="payment-card-inner">
                <div class="pay-amount-row">
                  <span class="pay-amount text-income font-bold">+{{ formatCurrency(pay.amount) }}</span>
                </div>
                <p v-if="pay.note" class="pay-note">{{ pay.note }}</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>
    </div>

    <!-- Record Payment Dialog -->
    <DebtPaymentDialog
      v-model="showPaymentDialog"
      :debt="debt"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus, Calendar } from '@element-plus/icons-vue'
import { useDebtStore } from '@/stores/debt'
import type { Debt, DebtStatus } from '@/types/debt'
import { formatCurrency } from '@/utils/currency'
import { formatDate, formatDateTime } from '@/utils/date'
import { getDebtStatusLabel } from '@/utils/constants'
import DebtPaymentDialog from '@/components/debts/DebtPaymentDialog.vue'

const route = useRoute()
const router = useRouter()
const debtStore = useDebtStore()

const debt = ref<Debt | null>(null)
const loading = ref(true)
const showPaymentDialog = ref(false)

function calcProgress(d: Debt) {
  if (!d.principalAmount || d.principalAmount <= 0) return 0
  return Math.min(100, Math.round((d.paidAmount / d.principalAmount) * 100))
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

async function loadDebt() {
  loading.value = true
  const id = route.params.id as string
  try {
    debt.value = await debtStore.getDebtById(id)
  } catch (err) {
    console.error('Failed to load debt', err)
  } finally {
    loading.value = false
  }
}

async function handleCancelDebt() {
  if (!debt.value) return
  await debtStore.cancelDebt(debt.value.id)
  loadDebt()
}

function handlePaymentSuccess() {
  loadDebt()
}

onMounted(() => {
  loadDebt()
})
</script>

<style scoped lang="scss">
.debt-detail-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;

  .header-nav {
    display: flex;
    align-items: center;
  }

  .overview-card {
    border-radius: 16px;

    .overview-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 12px;

      .person-title {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--app-text);
      }

      .debt-description {
        font-size: 0.9375rem;
        color: var(--app-text-muted);
        margin-top: 4px;
      }

      .badges-section {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }

    .numbers-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin: 16px 0;

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      .number-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .label {
          font-size: 0.75rem;
          color: var(--app-text-muted);
        }

        .value {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--app-text);

          &.prominent {
            font-size: 1.375rem;
          }
        }
      }
    }

    .progress-section {
      margin: 20px 0;

      .progress-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.8125rem;
        margin-bottom: 6px;
      }
    }

    .overview-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--app-card-border);
    }
  }

  .history-card {
    border-radius: 16px;

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
      }
    }

    .timeline-container {
      padding: 12px 6px;
    }

    .payment-card-inner {
      background: var(--app-bg);
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid var(--app-card-border);

      .pay-amount {
        font-size: 1.125rem;
      }

      .pay-note {
        font-size: 0.8125rem;
        color: var(--app-text-muted);
        margin-top: 4px;
      }
    }
  }
}
</style>

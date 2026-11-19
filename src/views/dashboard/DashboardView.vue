<template>
  <div class="dashboard-view">
    <!-- Top Filter & Welcome Header -->
    <div class="dashboard-header">
      <div class="welcome-box">
        <h1 class="welcome-title">Xin chào, {{ authStore.user?.fullName || 'bạn' }} 👋</h1>
        <p class="welcome-desc">Đây là tổng quan sức khỏe tài chính và dòng tiền của bạn.</p>
      </div>

      <!-- Time Filter Tabs -->
      <div class="time-filter">
        <el-radio-group v-model="selectedTimeRange" size="default" @change="handleTimeRangeChange">
          <el-radio-button label="today">Hôm nay</el-radio-button>
          <el-radio-button label="thisWeek">Tuần này</el-radio-button>
          <el-radio-button label="thisMonth">Tháng này</el-radio-button>
          <el-radio-button label="lastMonth">Tháng trước</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- Alert for Unclassified Transactions -->
    <el-alert
      v-if="dashboardData?.summary?.unclassifiedCount && dashboardData.summary.unclassifiedCount > 0"
      class="unclassified-alert"
      type="warning"
      show-icon
      :closable="false"
    >
      <template #title>
        <div class="alert-content">
          <span>Bạn có <strong>{{ dashboardData.summary.unclassifiedCount }}</strong> giao dịch ngân hàng mới chưa được phân loại danh mục.</span>
          <router-link to="/transactions?status=UNCLASSIFIED">
            <el-button type="warning" size="small" plain round>Phân loại ngay →</el-button>
          </router-link>
        </div>
      </template>
    </el-alert>

    <!-- Row 1: Summary Assets Cards (4 Cards) -->
    <div class="stats-grid">
      <StatCard
        title="Tổng số dư khả dụng"
        :value="dashboardData?.summary?.totalBalance || 0"
        subtitle="Trên tất cả tài khoản"
        :icon="Wallet"
        icon-bg="rgba(16, 185, 129, 0.12)"
        icon-color="#10B981"
      />

      <StatCard
        title="Tổng phải thu (Người nợ)"
        :value="dashboardData?.summary?.totalReceivable || 0"
        subtitle="Cần theo dõi thu hồi"
        :icon="Money"
        icon-bg="rgba(59, 130, 246, 0.12)"
        icon-color="#3B82F6"
      />

      <StatCard
        title="Tổng phải trả (Mình nợ)"
        :value="dashboardData?.summary?.totalPayable || 0"
        subtitle="Khoản nợ chưa tất toán"
        :icon="CreditCard"
        icon-bg="rgba(239, 68, 68, 0.12)"
        icon-color="#EF4444"
      />

      <StatCard
        title="Tài sản ròng (Net Worth)"
        :value="dashboardData?.summary?.netWorth || 0"
        subtitle="Số dư + Phải thu - Phải trả"
        :icon="Coin"
        icon-bg="rgba(139, 92, 246, 0.12)"
        icon-color="#8B5CF6"
      />
    </div>

    <!-- Row 2: Cash Flow Cards (3 Cards) -->
    <div class="cashflow-grid">
      <el-card class="flow-card income">
        <div class="flow-card-content">
          <div class="flow-icon-box income-box">
            <el-icon :size="20"><Bottom /></el-icon>
          </div>
          <div class="flow-info">
            <span class="flow-label">Tổng thu nhập</span>
            <strong class="flow-value text-income">
              +{{ formatCurrency(dashboardData?.summary?.totalIncome || 0) }}
            </strong>
          </div>
        </div>
      </el-card>

      <el-card class="flow-card expense">
        <div class="flow-card-content">
          <div class="flow-icon-box expense-box">
            <el-icon :size="20"><Top /></el-icon>
          </div>
          <div class="flow-info">
            <span class="flow-label">Tổng chi tiêu</span>
            <strong class="flow-value text-expense">
              -{{ formatCurrency(dashboardData?.summary?.totalExpense || 0) }}
            </strong>
          </div>
        </div>
      </el-card>

      <el-card class="flow-card diff">
        <div class="flow-card-content">
          <div class="flow-icon-box diff-box">
            <el-icon :size="20"><TrendCharts /></el-icon>
          </div>
          <div class="flow-info">
            <span class="flow-label">Thặng dư / Chênh lệch</span>
            <strong
              class="flow-value"
              :class="(dashboardData?.summary?.balanceDiff || 0) >= 0 ? 'text-income' : 'text-expense'"
            >
              {{ formatCurrency(dashboardData?.summary?.balanceDiff || 0) }}
            </strong>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Row 3: Charts (Income vs Expense & Category Pie) -->
    <div class="charts-grid">
      <!-- Income vs Expense Bar Chart -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header-row">
            <div class="header-title">
              <el-icon class="title-icon"><Histogram /></el-icon>
              <span>Thu nhập & Chi tiêu theo ngày</span>
            </div>
            <el-tag size="small" type="info">Kỳ hiện tại</el-tag>
          </div>
        </template>
        <IncomeExpenseChart :data="dashboardData?.incomeExpenseChart || []" />
      </el-card>

      <!-- Category Pie Chart -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header-row">
            <div class="header-title">
              <el-icon class="title-icon"><PieChart /></el-icon>
              <span>Cơ cấu chi tiêu theo danh mục</span>
            </div>
            <router-link to="/reports">
              <el-button text type="primary" size="small">Chi tiết</el-button>
            </router-link>
          </div>
        </template>
        <CategoryPieChart :data="dashboardData?.categoryExpenseChart || []" />
      </el-card>
    </div>

    <!-- Row 4: Recent Transactions & Upcoming Debts -->
    <div class="tables-grid">
      <!-- Recent Transactions -->
      <el-card class="recent-transactions-card">
        <template #header>
          <div class="card-header-row">
            <div class="header-title">
              <el-icon class="title-icon"><Tickets /></el-icon>
              <span>Giao dịch gần đây</span>
            </div>
            <router-link to="/transactions">
              <el-button text type="primary" size="small">Xem tất cả →</el-button>
            </router-link>
          </div>
        </template>

        <!-- Desktop View Table -->
        <div v-if="!isMobile" class="table-responsive">
          <el-table
            :data="dashboardData?.recentTransactions || []"
            style="width: 100%"
            size="small"
            empty-text="Chưa có giao dịch gần đây"
          >
            <el-table-column label="Ngày" width="130">
              <template #default="{ row }">
                <span class="text-muted">{{ formatDate(row.transactionDate) }}</span>
              </template>
            </el-table-column>

            <el-table-column label="Mô tả" min-width="180">
              <template #default="{ row }">
                <div class="desc-col">
                  <span class="font-medium">{{ row.description || row.originalDescription }}</span>
                  <el-tag
                    v-if="row.classificationStatus === 'UNCLASSIFIED'"
                    size="small"
                    type="warning"
                    effect="plain"
                  >
                    Chưa phân loại
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="Danh mục" width="140">
              <template #default="{ row }">
                <el-tag v-if="row.category?.name" size="small" effect="light">
                  {{ row.category.name }}
                </el-tag>
                <span v-else class="text-muted text-xs">—</span>
              </template>
            </el-table-column>

            <el-table-column label="Tài khoản" width="130">
              <template #default="{ row }">
                <span class="text-xs text-muted">{{ row.account?.name || 'Tài khoản' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="Số tiền" width="150" align="right">
              <template #default="{ row }">
                <AmountDisplay :amount="row.amount" :direction="row.direction" size="sm" />
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Mobile Card List -->
        <div v-else class="mobile-tx-list">
          <TransactionCard
            v-for="tx in dashboardData?.recentTransactions || []"
            :key="tx.id"
            :transaction="tx"
            @click="navigateToTransaction(tx.id)"
          />
        </div>
      </el-card>

      <!-- Upcoming Debts / Debts Due Soon -->
      <el-card class="upcoming-debts-card">
        <template #header>
          <div class="card-header-row">
            <div class="header-title">
              <el-icon class="title-icon"><Calendar /></el-icon>
              <span>Sổ nợ & Người liên quan</span>
            </div>
            <router-link to="/debts">
              <el-button text type="primary" size="small">Xem sổ nợ →</el-button>
            </router-link>
          </div>
          <div style="margin-top: 10px;">
            <el-radio-group v-model="activeDebtTab" size="small">
              <el-radio-button label="UPCOMING">Sắp đến hạn</el-radio-button>
              <el-radio-button label="BY_PERSON">Tổng nợ theo người ({{ debtStore.personSummaries.length }})</el-radio-button>
            </el-radio-group>
          </div>
        </template>

        <div v-if="activeDebtTab === 'UPCOMING'">
          <div v-if="!dashboardData?.upcomingDebts || dashboardData.upcomingDebts.length === 0" class="empty-debts">
            <el-empty description="Không có khoản nợ đến hạn" :image-size="70" />
          </div>

          <div v-else class="debts-list">
            <div v-for="debt in dashboardData.upcomingDebts" :key="debt.id" class="debt-item-card">
              <div class="debt-left">
                <div class="debt-person-row">
                  <strong class="person-name">{{ debt.personName }}</strong>
                  <el-tag :type="debt.type === 'RECEIVABLE' ? 'success' : 'danger'" size="small">
                    {{ debt.type === 'RECEIVABLE' ? 'Cần thu' : 'Cần trả' }}
                  </el-tag>
                </div>
                <p class="debt-desc">{{ debt.description }}</p>
                <span v-if="debt.dueDate" class="debt-due">Hạn: {{ formatDate(debt.dueDate) }}</span>
              </div>

              <div class="debt-right">
                <strong :class="debt.type === 'RECEIVABLE' ? 'text-income' : 'text-expense'">
                  {{ formatCurrency(debt.remainingAmount) }}
                </strong>
                <el-button size="small" type="primary" plain round @click="openPaymentDialog(debt)">
                  Thanh toán
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="by-person-list">
          <div v-if="!debtStore.personSummaries || debtStore.personSummaries.length === 0" class="empty-debts">
            <el-empty description="Chưa có dữ liệu nợ theo người" :image-size="70" />
          </div>
          <div v-else class="debts-list">
            <div
              v-for="ps in debtStore.personSummaries"
              :key="ps.personId"
              class="debt-item-card"
              style="cursor: pointer;"
              @click="router.push(`/debts?personId=${ps.personId}`)"
            >
              <div class="debt-left">
                <div class="debt-person-row">
                  <strong class="person-name">{{ ps.personName }}</strong>
                  <el-tag size="small" type="info">{{ ps.activeDebtsCount }} khoản</el-tag>
                </div>
                <div style="font-size: 12px; display: flex; gap: 12px; margin-top: 4px;">
                  <span style="color: #10B981;">Họ nợ: +{{ formatCurrency(ps.receivableAmount) }}</span>
                  <span style="color: #EF4444;">Mình nợ: -{{ formatCurrency(ps.payableAmount) }}</span>
                </div>
              </div>

              <div class="debt-right" style="text-align: right;">
                <div style="font-size: 11px; color: var(--app-text-muted);">Chênh lệch:</div>
                <strong :class="ps.netAmount >= 0 ? 'text-income' : 'text-expense'">
                  {{ ps.netAmount >= 0 ? '+' : '' }}{{ formatCurrency(ps.netAmount) }}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Payment Dialog -->
    <DebtPaymentDialog
      v-model="showPaymentDialog"
      :debt="selectedDebt"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Wallet,
  Money,
  CreditCard,
  Coin,
  Top,
  Bottom,
  TrendCharts,
  Histogram,
  PieChart,
  Tickets,
  Calendar
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useDebtStore } from '@/stores/debt'
import { useResponsive } from '@/composables/useResponsive'
import { dashboardApi } from '@/api/dashboardApi'
import type { DashboardData } from '@/types/dashboard'
import type { Debt } from '@/types/debt'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import StatCard from '@/components/common/StatCard.vue'
import AmountDisplay from '@/components/common/AmountDisplay.vue'
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart.vue'
import CategoryPieChart from '@/components/charts/CategoryPieChart.vue'
import TransactionCard from '@/components/transactions/TransactionCard.vue'
import DebtPaymentDialog from '@/components/debts/DebtPaymentDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const debtStore = useDebtStore()
const { isMobile } = useResponsive()

const selectedTimeRange = ref('thisMonth')
const dashboardData = ref<DashboardData | null>(null)
const loading = ref(false)

const activeDebtTab = ref<'UPCOMING' | 'BY_PERSON'>('UPCOMING')
const showPaymentDialog = ref(false)
const selectedDebt = ref<Debt | null>(null)

async function fetchDashboard() {
  loading.value = true
  try {
    dashboardData.value = await dashboardApi.getDashboardData(selectedTimeRange.value)
  } catch (err) {
    console.error('Failed to load dashboard data', err)
  } finally {
    loading.value = false
  }
}

function handleTimeRangeChange() {
  fetchDashboard()
}

function navigateToTransaction(id: string) {
  router.push(`/transactions/${id}`)
}

function openPaymentDialog(debt: Debt) {
  selectedDebt.value = debt
  showPaymentDialog.value = true
}

function handlePaymentSuccess() {
  fetchDashboard()
  debtStore.fetchPersonSummaries()
}

onMounted(() => {
  fetchDashboard()
  debtStore.fetchPersonSummaries()
})
</script>

<style scoped lang="scss">
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;

    .welcome-title {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--app-text);
    }

    .welcome-desc {
      font-size: 0.875rem;
      color: var(--app-text-muted);
      margin-top: 2px;
    }
  }

  .unclassified-alert {
    border-radius: 10px;

    .alert-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  // Row 1: 4 Cards Grid
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  // Row 2: 3 Cards Grid
  .cashflow-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .flow-card {
      .flow-card-content {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .flow-icon-box {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.income-box {
          background-color: rgba(16, 185, 129, 0.12);
          color: #10B981;
        }

        &.expense-box {
          background-color: rgba(239, 68, 68, 0.12);
          color: #EF4444;
        }

        &.diff-box {
          background-color: rgba(59, 130, 246, 0.12);
          color: #3B82F6;
        }
      }

      .flow-info {
        display: flex;
        flex-direction: column;

        .flow-label {
          font-size: 0.8125rem;
          color: var(--app-text-muted);
          font-weight: 500;
        }

        .flow-value {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 2px;
        }
      }
    }
  }

  // Row 3: Charts Grid
  .charts-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 16px;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }

  // Row 4: Tables & Debts Grid
  .tables-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 16px;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }

  .card-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 0.9375rem;

      .title-icon {
        color: #10B981;
      }
    }
  }

  .desc-col {
    display: flex;
    align-items: center;
    gap: 6px;

    .font-medium {
      font-weight: 500;
      color: var(--app-text);
    }
  }

  .mobile-tx-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  // Debts list
  .debts-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .debt-item-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-radius: 8px;
      background: var(--app-bg);
      border: 1px solid var(--app-card-border);

      .debt-left {
        display: flex;
        flex-direction: column;
        gap: 3px;

        .debt-person-row {
          display: flex;
          align-items: center;
          gap: 6px;

          .person-name {
            font-size: 0.875rem;
          }
        }

        .debt-desc {
          font-size: 0.75rem;
          color: var(--app-text-muted);
        }

        .debt-due {
          font-size: 0.6875rem;
          color: #F59E0B;
        }
      }

      .debt-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
      }
    }
  }
}
</style>

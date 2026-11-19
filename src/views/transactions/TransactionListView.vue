<template>
  <div class="transaction-list-view">
    <!-- Top Filter Bar -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-grid">
        <!-- Search Keyword -->
        <div class="filter-item search-item">
          <el-input
            v-model="searchQuery"
            placeholder="Tìm theo nội dung, mô tả..."
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </div>

        <!-- Date Range -->
        <div class="filter-item date-item">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="Từ ngày"
            end-placeholder="Đến ngày"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
        </div>

        <!-- Account Filter -->
        <div class="filter-item">
          <el-select
            v-model="selectedAccount"
            placeholder="Tất cả tài khoản"
            clearable
            @change="handleFilterChange"
          >
            <el-option
              v-for="acc in accountStore.accounts"
              :key="acc.id"
              :label="acc.name"
              :value="acc.id"
            />
          </el-select>
        </div>

        <!-- Category Filter -->
        <div class="filter-item">
          <el-select
            v-model="selectedCategory"
            placeholder="Tất cả danh mục"
            clearable
            @change="handleFilterChange"
          >
            <el-option
              v-for="cat in categoryStore.categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </div>

        <!-- Source Filter -->
        <div class="filter-item">
          <el-select
            v-model="selectedSource"
            placeholder="Nguồn giao dịch"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="Ngân hàng (Bank)" value="BANK" />
            <el-option label="Thủ công (Manual)" value="MANUAL" />
            <el-option label="Hệ thống (System)" value="SYSTEM" />
          </el-select>
        </div>

        <!-- Classification Status Filter -->
        <div class="filter-item">
          <el-select
            v-model="selectedStatus"
            placeholder="Trạng thái phân loại"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="Chưa phân loại" value="UNCLASSIFIED" />
            <el-option label="Đã phân loại" value="CLASSIFIED" />
          </el-select>
        </div>

        <!-- Reset Button -->
        <div class="filter-actions">
          <el-button text @click="handleResetFilters">
            <el-icon><RefreshRight /></el-icon>
            Đặt lại
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- Summary Row: Total In, Total Out, Net for current filter -->
    <div class="summary-bar">
      <div class="summary-pill in">
        <span class="label">Tổng thu:</span>
        <strong class="value text-income">+{{ formatCurrency(transactionStore.totalIn) }}</strong>
      </div>
      <div class="summary-pill out">
        <span class="label">Tổng chi:</span>
        <strong class="value text-expense">-{{ formatCurrency(transactionStore.totalOut) }}</strong>
      </div>
      <div class="summary-pill diff">
        <span class="label">Chênh lệch:</span>
        <strong
          class="value"
          :class="transactionStore.balanceDiff >= 0 ? 'text-income' : 'text-expense'"
        >
          {{ formatCurrency(transactionStore.balanceDiff) }}
        </strong>
      </div>
      <div class="action-add-btn" v-if="!isMobile">
        <router-link to="/transactions/create">
          <el-button type="primary" :icon="Plus">
            Ghi nhận giao dịch
          </el-button>
        </router-link>
      </div>
    </div>

    <!-- Transaction List / Table -->
    <el-card class="content-card" shadow="never">
      <!-- Desktop Table -->
      <div v-if="!isMobile" class="table-container">
        <el-table
          v-loading="transactionStore.loading"
          :data="transactionStore.transactions"
          style="width: 100%"
          empty-text="Không tìm thấy giao dịch nào phù hợp"
        >
          <el-table-column label="Ngày & Giờ" width="160">
            <template #default="{ row }">
              <div class="date-cell">
                <span class="date-main">{{ formatDate(row.transactionDate) }}</span>
                <span class="time-sub">{{ formatTime(row.transactionDate) }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Nội dung mô tả" min-width="220">
            <template #default="{ row }">
              <div class="desc-cell">
                <span class="desc-title font-semibold">{{ row.description || row.originalDescription }}</span>
                <span v-if="row.originalDescription && row.description !== row.originalDescription" class="desc-original text-xs text-muted">
                  Gốc: {{ row.originalDescription }}
                </span>
                <div class="tag-row">
                  <el-tag size="small" :type="row.source === 'BANK' ? 'primary' : 'info'" effect="plain">
                    {{ row.source === 'BANK' ? 'Ngân hàng' : 'Thủ công' }}
                  </el-tag>
                  <el-tag
                    v-if="row.classificationStatus === 'UNCLASSIFIED'"
                    size="small"
                    type="warning"
                    effect="light"
                  >
                    Chưa phân loại
                  </el-tag>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Danh mục" width="160">
            <template #default="{ row }">
              <!-- If classified, show tag. If unclassified, quick select! -->
              <el-select
                v-if="row.classificationStatus === 'UNCLASSIFIED'"
                v-model="row.categoryId"
                placeholder="Chọn danh mục"
                size="small"
                @change="(val: string) => handleQuickClassify(row.id, val)"
              >
                <el-option
                  v-for="cat in categoryStore.categories"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.id"
                />
              </el-select>
              <el-tag
                v-else-if="row.category?.name"
                size="small"
                :style="{
                  backgroundColor: row.category?.color ? `${row.category.color}15` : undefined,
                  borderColor: row.category?.color || undefined,
                  color: row.category?.color || undefined
                }"
              >
                {{ row.category.name }}
              </el-tag>
              <span v-else class="text-muted text-xs">—</span>
            </template>
          </el-table-column>

          <el-table-column label="Tài khoản" width="150">
            <template #default="{ row }">
              <span class="text-sm">{{ row.account?.name || 'Tài khoản' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="Loại" width="130">
            <template #default="{ row }">
              <span class="text-xs font-medium text-muted">
                {{ getTransactionTypeLabel(row.type) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="Số tiền" width="160" align="right">
            <template #default="{ row }">
              <AmountDisplay
                :amount="row.amount"
                :direction="row.direction"
                size="md"
              />
            </template>
          </el-table-column>

          <el-table-column label="Thao tác" width="110" align="center">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                @click="router.push(`/transactions/${row.id}`)"
              >
                Sửa
              </el-button>
              <el-popconfirm
                title="Bạn có chắc muốn xóa giao dịch này?"
                confirm-button-text="Xóa"
                cancel-button-text="Hủy"
                @confirm="handleDelete(row.id)"
              >
                <template #reference>
                  <el-button type="danger" link size="small">Xóa</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Mobile Card List -->
      <div v-else class="mobile-cards-list">
        <div v-if="transactionStore.transactions.length === 0" class="empty-state">
          <el-empty description="Không có giao dịch nào" />
        </div>
        <TransactionCard
          v-for="tx in transactionStore.transactions"
          :key="tx.id"
          :transaction="tx"
          @click="router.push(`/transactions/${tx.id}`)"
        />
      </div>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="transactionStore.currentPage"
          v-model:page-size="transactionStore.pageSize"
          :total="transactionStore.totalElements"
          :page-sizes="[15, 30, 50]"
          layout="total, prev, pager, next"
          background
          @current-change="(page: number) => transactionStore.fetchTransactions(page)"
        />
      </div>
    </el-card>

    <!-- Floating Action Button on Mobile -->
    <div v-if="isMobile" class="fab-wrapper">
      <router-link to="/transactions/create">
        <el-button type="primary" :icon="Plus" circle class="fab-btn" />
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, Plus, RefreshRight } from '@element-plus/icons-vue'
import { useTransactionStore } from '@/stores/transaction'
import { useAccountStore } from '@/stores/account'
import { useCategoryStore } from '@/stores/category'
import { useResponsive } from '@/composables/useResponsive'
import { formatCurrency } from '@/utils/currency'
import { formatDate, formatTime } from '@/utils/date'
import { getTransactionTypeLabel } from '@/utils/constants'
import type { ClassificationStatus, TransactionSource } from '@/types/transaction'
import AmountDisplay from '@/components/common/AmountDisplay.vue'
import TransactionCard from '@/components/transactions/TransactionCard.vue'

const router = useRouter()
const route = useRoute()
const { isMobile } = useResponsive()

const transactionStore = useTransactionStore()
const accountStore = useAccountStore()
const categoryStore = useCategoryStore()

const searchQuery = ref('')
const dateRange = ref<[string, string] | null>(null)
const selectedAccount = ref<string | undefined>()
const selectedCategory = ref<string | undefined>()
const selectedSource = ref<TransactionSource | undefined>()
const selectedStatus = ref<ClassificationStatus | undefined>(
  (route.query.status as ClassificationStatus) || undefined
)

function handleFilterChange() {
  transactionStore.setFilters({
    search: searchQuery.value || undefined,
    startDate: dateRange.value?.[0],
    endDate: dateRange.value?.[1],
    accountId: selectedAccount.value,
    categoryId: selectedCategory.value,
    source: selectedSource.value,
    classificationStatus: selectedStatus.value
  })
}

let debounceTimer: any = null
function handleSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    handleFilterChange()
  }, 350)
}

function handleDateRangeChange() {
  handleFilterChange()
}

function handleResetFilters() {
  searchQuery.value = ''
  dateRange.value = null
  selectedAccount.value = undefined
  selectedCategory.value = undefined
  selectedSource.value = undefined
  selectedStatus.value = undefined
  transactionStore.resetFilters()
}

async function handleQuickClassify(id: string, categoryId: string) {
  await transactionStore.quickClassify(id, categoryId)
}

async function handleDelete(id: string) {
  await transactionStore.deleteTransaction(id)
}

onMounted(() => {
  accountStore.fetchAccounts()
  categoryStore.fetchCategories()
  if (route.query.status) {
    selectedStatus.value = route.query.status as ClassificationStatus
    handleFilterChange()
  } else {
    transactionStore.fetchTransactions(1)
  }
})
</script>

<style scoped lang="scss">
.transaction-list-view {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .filter-card {
    border-radius: 12px;

    .filter-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;

      .filter-item {
        flex: 1;
        min-width: 160px;

        &.search-item {
          flex: 2;
          min-width: 220px;
        }

        &.date-item {
          min-width: 240px;
        }
      }

      .filter-actions {
        display: flex;
        align-items: center;
      }
    }
  }

  .summary-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    .summary-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 10px;
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      font-size: 0.875rem;

      .label {
        color: var(--app-text-muted);
      }
    }

    .action-add-btn {
      margin-left: auto;
    }
  }

  .content-card {
    border-radius: 12px;

    .date-cell {
      display: flex;
      flex-direction: column;

      .date-main {
        font-weight: 600;
        color: var(--app-text);
      }

      .time-sub {
        font-size: 0.75rem;
        color: var(--app-text-muted);
      }
    }

    .desc-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;

      .desc-title {
        color: var(--app-text);
      }

      .tag-row {
        display: flex;
        gap: 6px;
      }
    }

    .mobile-cards-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }

  .fab-wrapper {
    position: fixed;
    right: 20px;
    bottom: 80px;
    z-index: 99;

    .fab-btn {
      width: 52px;
      height: 52px;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
  }
}
</style>

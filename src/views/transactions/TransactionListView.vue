<template>
  <div class="transaction-list-view">
    <!-- Top Filter Bar -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-container">
        <!-- Row 1: Primary Search & Date Range & Reset -->
        <div class="filter-row primary-row">
          <div class="filter-item search-item">
            <el-input
              v-model="searchQuery"
              placeholder="Tìm theo nội dung, mô tả..."
              :prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </div>

          <div class="filter-item date-item">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="-"
              start-placeholder="Từ ngày"
              end-placeholder="Đến ngày"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              :shortcuts="dateShortcuts"
              @change="handleDateRangeChange"
            />
          </div>

          <div class="filter-actions">
            <el-button
              :type="hasActiveFilters ? 'primary' : 'default'"
              :plain="hasActiveFilters"
              class="reset-btn"
              @click="handleResetFilters"
            >
              <el-icon><RefreshRight /></el-icon>
              <span>Đặt lại</span>
              <span v-if="activeFilterCount > 0" class="filter-count">({{ activeFilterCount }})</span>
            </el-button>
          </div>
        </div>

        <!-- Row 2: Secondary Selects -->
        <div class="filter-row facet-row">
          <div class="filter-item select-item">
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

          <div class="filter-item select-item">
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

          <div class="filter-item select-item">
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

          <div class="filter-item select-item">
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
                    v-if="row.type && row.type !== 'EXPENSE' && row.type !== 'INCOME'"
                    size="small"
                    type="info"
                    effect="plain"
                  >
                    {{ getTransactionTypeLabel(row.type) }}
                  </el-tag>
                  <el-tag v-if="row.personName" size="small" type="success" effect="light">
                    👤 {{ row.personName }}
                  </el-tag>
                  <el-tag v-if="row.allocations && row.allocations.length > 0" size="small" type="warning" effect="light">
                    ⚡ Chia tiền ({{ row.allocations.length }} người)
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

          <el-table-column label="Danh mục" width="165">
            <template #default="{ row }">
              <el-select
                v-model="row.categoryId"
                placeholder="Chọn danh mục"
                size="small"
                filterable
                @change="(val: string) => handleQuickClassify(row.id, val)"
                class="category-select"
              >
                <template #prefix>
                  <span
                    v-if="getCategoryColor(row.categoryId)"
                    class="cat-prefix-dot"
                    :style="{ backgroundColor: getCategoryColor(row.categoryId) }"
                  ></span>
                </template>
                <el-option
                  v-for="cat in categoryStore.categories"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.id"
                >
                  <div class="cat-option-row">
                    <span
                      class="cat-color-dot"
                      :style="{ backgroundColor: cat.color || '#94A3B8' }"
                    ></span>
                    <span>{{ cat.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="Tài khoản" width="150">
            <template #default="{ row }">
              <span class="text-sm">{{ row.account?.name || row.accountName || 'Tài khoản' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="Ghi chú thêm" min-width="190">
            <template #default="{ row }">
              <el-input
                v-model="row.note"
                placeholder="Thêm ghi chú..."
                size="small"
                clearable
                @focus="handleFocusNote(row)"
                @blur="handleSaveNote(row)"
                @keyup.enter="(e: any) => e.target.blur()"
                class="note-quick-input"
              >
                <template #prefix>
                  <el-icon class="text-muted"><EditPen /></el-icon>
                </template>
              </el-input>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, Plus, RefreshRight, EditPen } from '@element-plus/icons-vue'
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

const activeFilterCount = computed(() => {
  let count = 0
  if (searchQuery.value && searchQuery.value.trim()) count++
  if (dateRange.value && dateRange.value.length === 2 && dateRange.value[0]) count++
  if (selectedAccount.value) count++
  if (selectedCategory.value) count++
  if (selectedSource.value) count++
  if (selectedStatus.value) count++
  return count
})

const hasActiveFilters = computed(() => activeFilterCount.value > 0)

const dateShortcuts = [
  {
    text: 'Hôm nay',
    value: () => {
      const end = new Date()
      const start = new Date()
      return [start, end]
    },
  },
  {
    text: '7 ngày qua',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '30 ngày qua',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: 'Tháng này',
    value: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return [start, end]
    },
  },
  {
    text: 'Tháng trước',
    value: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return [start, end]
    },
  },
]

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
  if (route.query.status) {
    router.replace({ query: {} })
  }
  transactionStore.resetFilters()
}

async function handleQuickClassify(id: string, categoryId: string) {
  try {
    await transactionStore.quickClassify(id, categoryId)
  } catch (err) {
    const tx = transactionStore.transactions.find(t => t.id === id)
    if (tx) {
      tx.categoryId = undefined
    }
  }
}

function getCategoryColor(categoryId?: string) {
  if (!categoryId) return ''
  const cat = categoryStore.categories.find(c => c.id === categoryId)
  return cat?.color || ''
}

const originalNotes = new Map<string, string>()

function handleFocusNote(row: any) {
  if (row.note && row.note.startsWith('Cổng:') && row.note.includes('Tích lũy:')) {
    row.note = ''
  }
  originalNotes.set(row.id, row.note || '')
}

async function handleSaveNote(row: any) {
  const oldVal = originalNotes.get(row.id) ?? ''
  const newVal = (row.note || '').trim()
  if (oldVal.trim() === newVal) return

  try {
    await transactionStore.quickUpdateNote(row.id, newVal)
    originalNotes.set(row.id, newVal)
  } catch (err) {
    row.note = oldVal
  }
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
  min-width: 0;
  max-width: 100%;
  width: 100%;

  .filter-card {
    border-radius: 12px;

    :deep(.el-card__body) {
      padding: 14px 16px;
    }

    .filter-container {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .filter-row {
        display: flex;
        align-items: center;
        gap: 12px;

        &.primary-row {
          flex-wrap: wrap;

          .search-item {
            flex: 1 1 280px;
            min-width: 240px;

            :deep(.el-input) {
              width: 100%;
            }
          }

          .date-item {
            flex: 0 0 290px;
            width: 290px;

            :deep(.el-date-editor) {
              width: 100% !important;
            }

            :deep(.el-date-editor--daterange.el-input__wrapper) {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
            }
          }

          .filter-actions {
            flex: 0 0 auto;

            .reset-btn {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              height: 32px;
              padding: 0 14px;
              font-weight: 500;
              transition: all 0.2s ease;

              .filter-count {
                font-weight: 600;
                font-size: 0.8rem;
                opacity: 0.9;
              }
            }
          }
        }

        &.facet-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          width: 100%;

          .select-item {
            width: 100%;

            :deep(.el-select) {
              width: 100% !important;
            }
          }
        }
      }
    }
  }

  @media (max-width: 1024px) {
    .filter-card {
      .filter-container {
        .filter-row {
          &.primary-row {
            .date-item {
              flex: 1 1 260px;
              width: auto;
            }
          }
          &.facet-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      }
    }
  }

  @media (max-width: 640px) {
    .filter-card {
      .filter-container {
        .filter-row {
          &.primary-row {
            flex-direction: column;
            align-items: stretch;

            .search-item,
            .date-item,
            .filter-actions {
              width: 100%;
              flex: 1 1 100%;
            }

            .reset-btn {
              width: 100%;
              justify-content: center;
            }
          }
          &.facet-row {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
        }
      }
    }
  }

  .summary-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    @media (max-width: 640px) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;

      .summary-pill {
        padding: 8px 10px !important;
        font-size: 0.75rem !important;
        justify-content: space-between;

        &.diff {
          grid-column: span 2;
        }
      }
    }

    .summary-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 10px;
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      font-size: 0.875rem;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      }

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

    .category-select {
      width: 100%;

      .cat-option-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .cat-color-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
      }

      .cat-prefix-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 4px;
        display: inline-block;
        flex-shrink: 0;
      }
    }

    .note-quick-input {
      width: 100%;

      :deep(.el-input__wrapper) {
        background-color: transparent;
        box-shadow: none;
        border: 1px dashed transparent;
        transition: all 0.2s ease;
        padding-left: 6px;
        padding-right: 6px;

        &:hover {
          background-color: var(--el-fill-color-light);
          border-color: var(--el-border-color);
        }

        &.is-focus {
          background-color: #fff;
          box-shadow: 0 0 0 1px var(--el-color-primary) inset;
          border-color: transparent;
        }
      }

      :deep(.el-input__inner) {
        font-size: 0.825rem;
        color: var(--app-text);

        &::placeholder {
          font-style: italic;
          color: var(--app-text-muted);
          opacity: 0.65;
        }
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
}
</style>

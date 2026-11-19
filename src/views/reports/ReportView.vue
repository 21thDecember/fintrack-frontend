<template>
  <div class="report-view">
    <div class="report-header">
      <el-tabs v-model="activeTab" class="report-type-tabs" @tab-change="loadReports">
        <el-tab-pane label="Báo cáo Tuần" name="weekly" />
        <el-tab-pane label="Báo cáo Tháng" name="monthly" />
      </el-tabs>

      <div class="date-controls">
        <el-tag size="large" type="primary" effect="plain" class="period-tag">
          <el-icon><Calendar /></el-icon>
          <span v-if="activeTab === 'weekly'">Tuần 46/2026 (12/11 - 18/11)</span>
          <span v-else>Tháng 11/2026</span>
        </el-tag>
      </div>
    </div>

    <div v-loading="loading">
      <!-- 1. WEEKLY REPORT -->
      <div v-if="activeTab === 'weekly' && weeklyData" class="report-content weekly-section">
        <!-- 4 Summary Cards -->
        <div class="cards-grid">
          <StatCard
            title="Thu nhập tuần"
            :value="weeklyData.totalIncome"
            subtitle="Từ công việc & thưởng"
            :icon="Bottom"
            icon-bg="rgba(16, 185, 129, 0.12)"
            icon-color="#10B981"
          />

          <StatCard
            title="Chi phí cá nhân thực tế"
            :value="weeklyData.personalExpense"
            subtitle="Đã trừ phần bạn bè trả"
            :icon="Top"
            icon-bg="rgba(239, 68, 68, 0.12)"
            icon-color="#EF4444"
          />

          <StatCard
            title="Tổng dòng tiền vào (Cash-in)"
            :value="weeklyData.cashFlowIn"
            subtitle="Thu nhập + Thu hồi nợ"
            :icon="Download"
            icon-bg="rgba(59, 130, 246, 0.12)"
            icon-color="#3B82F6"
          />

          <StatCard
            title="Dòng tiền ròng (Net Cash)"
            :value="weeklyData.netCashFlow"
            subtitle="Cash in - Cash out"
            :icon="TrendCharts"
            icon-bg="rgba(139, 92, 246, 0.12)"
            icon-color="#8B5CF6"
          />
        </div>

        <div class="two-columns-grid">
          <!-- Category Breakdown Table -->
          <el-card class="section-card" shadow="never">
            <template #header>
              <div class="card-title-row">
                <span class="font-bold">Chi tiết chi tiêu theo danh mục</span>
                <el-tag size="small" type="info">{{ weeklyData.categories.length }} danh mục</el-tag>
              </div>
            </template>

            <el-table :data="weeklyData.categories" style="width: 100%" size="small">
              <el-table-column label="Danh mục" min-width="160">
                <template #default="{ row }">
                  <div class="cat-name-cell">
                    <span class="color-dot" :style="{ backgroundColor: row.color }"></span>
                    <strong>{{ row.categoryName }}</strong>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="Số giao dịch" width="100" align="center">
                <template #default="{ row }">
                  <span>{{ row.count }}</span>
                </template>
              </el-table-column>

              <el-table-column label="Tỷ trọng" width="160">
                <template #default="{ row }">
                  <div class="pct-cell">
                    <el-progress :percentage="row.percentage" :color="row.color" :stroke-width="6" />
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="Số tiền" width="130" align="right">
                <template #default="{ row }">
                  <span class="font-semibold text-expense">{{ formatCurrency(row.amount) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <!-- Debt Activity Summary -->
          <el-card class="section-card" shadow="never">
            <template #header>
              <div class="card-title-row">
                <span class="font-bold">Biến động công nợ trong tuần</span>
              </div>
            </template>

            <div class="debt-activity-box">
              <div class="activity-row">
                <div class="activity-info">
                  <span class="dot in"></span>
                  <span>Đã thu hồi nợ (Người trả mình):</span>
                </div>
                <strong class="text-income">+{{ formatCurrency(weeklyData.debtActivity.receivablesCollected) }}</strong>
              </div>

              <div class="activity-row">
                <div class="activity-info">
                  <span class="dot out"></span>
                  <span>Đã thanh toán nợ (Mình trả người):</span>
                </div>
                <strong class="text-expense">-{{ formatCurrency(weeklyData.debtActivity.payablesPaid) }}</strong>
              </div>

              <div class="activity-row">
                <div class="activity-info">
                  <span class="dot new-in"></span>
                  <span>Phát sinh người nợ mới:</span>
                </div>
                <strong>{{ formatCurrency(weeklyData.debtActivity.newReceivables) }}</strong>
              </div>

              <div class="activity-row">
                <div class="activity-info">
                  <span class="dot new-out"></span>
                  <span>Phát sinh vay mới:</span>
                </div>
                <strong>{{ formatCurrency(weeklyData.debtActivity.newPayables) }}</strong>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 2. MONTHLY REPORT -->
      <div v-else-if="activeTab === 'monthly' && monthlyData" class="report-content monthly-section">
        <!-- Monthly Comparison Cards -->
        <div class="cards-grid">
          <StatCard
            title="Thu nhập tháng 11"
            :value="monthlyData.totalIncome"
            subtitle="So với tháng 10"
            :trend="monthlyData.comparison.incomeChangePercentage"
            :icon="Bottom"
            icon-bg="rgba(16, 185, 129, 0.12)"
            icon-color="#10B981"
          />

          <StatCard
            title="Chi tiêu tháng 11"
            :value="monthlyData.totalExpense"
            subtitle="So với tháng 10"
            :trend="monthlyData.comparison.expenseChangePercentage"
            :icon="Top"
            icon-bg="rgba(239, 68, 68, 0.12)"
            icon-color="#EF4444"
          />

          <StatCard
            title="Tỷ lệ tiết kiệm tháng"
            :value="`${monthlyData.savingsRate}%`"
            :is-currency="false"
            subtitle="Mục tiêu tối thiểu 20%"
            :trend="monthlyData.savingsRate - monthlyData.comparison.previousMonthSavingsRate"
            :icon="Coin"
            icon-bg="rgba(59, 130, 246, 0.12)"
            icon-color="#3B82F6"
          />

          <StatCard
            title="Tăng trưởng tài sản ròng"
            :value="`${monthlyData.comparison.netWorthChangePercentage}%`"
            :is-currency="false"
            subtitle="Tích lũy tài sản dài hạn"
            :trend="monthlyData.comparison.netWorthChangePercentage"
            :icon="TrendCharts"
            icon-bg="rgba(139, 92, 246, 0.12)"
            icon-color="#8B5CF6"
          />
        </div>

        <div class="two-columns-grid">
          <!-- Top Expense Ranking -->
          <el-card class="section-card" shadow="never">
            <template #header>
              <span class="font-bold">Top danh mục chi tiêu nhiều nhất</span>
            </template>

            <div class="top-categories-list">
              <div
                v-for="(cat, idx) in monthlyData.topExpenseCategories"
                :key="cat.categoryId"
                class="top-cat-item"
              >
                <div class="cat-rank-badge">{{ idx + 1 }}</div>
                <div class="cat-main">
                  <div class="cat-name-line">
                    <span class="cat-title">{{ cat.categoryName }}</span>
                    <strong class="cat-amt">{{ formatCurrency(cat.amount) }}</strong>
                  </div>
                  <el-progress :percentage="cat.percentage" :color="cat.color" :stroke-width="8" />
                </div>
              </div>
            </div>
          </el-card>

          <!-- Savings Gauge & Net Worth Trend -->
          <div class="gauge-and-trend-column">
            <!-- Gauge Card -->
            <el-card class="section-card" shadow="never">
              <template #header>
                <span class="font-bold">Thước đo Tỷ lệ Tiết kiệm</span>
              </template>
              <SavingsGauge :rate="monthlyData.savingsRate" />
            </el-card>

            <!-- Net Worth Trend Summary Card -->
            <el-card class="section-card" shadow="never">
              <template #header>
                <span class="font-bold">Xu hướng tích lũy 6 tháng gần nhất</span>
              </template>

              <div class="trend-bars">
                <div v-for="t in monthlyData.netWorthTrend" :key="t.period" class="trend-item">
                  <span class="t-period">{{ t.period }}</span>
                  <div class="t-bar-box">
                    <div
                      class="t-bar"
                      :style="{ height: `${Math.round((t.netWorth / 250000000) * 100)}%` }"
                    ></div>
                  </div>
                  <span class="t-val">{{ formatCompactCurrency(t.netWorth) }}</span>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Calendar,
  Bottom,
  Top,
  Download,
  TrendCharts,
  Coin
} from '@element-plus/icons-vue'
import { reportApi } from '@/api/reportApi'
import type { WeeklyReportData, MonthlyReportData } from '@/types/report'
import { formatCurrency, formatCompactCurrency } from '@/utils/currency'
import StatCard from '@/components/common/StatCard.vue'
import SavingsGauge from '@/components/charts/SavingsGauge.vue'

const activeTab = ref<'weekly' | 'monthly'>('weekly')
const loading = ref(false)

const weeklyData = ref<WeeklyReportData | null>(null)
const monthlyData = ref<MonthlyReportData | null>(null)

async function loadReports() {
  loading.value = true
  try {
    if (activeTab.value === 'weekly') {
      weeklyData.value = await reportApi.getWeeklyReport(46, 2026)
    } else {
      monthlyData.value = await reportApi.getMonthlyReport(11, 2026)
    }
  } catch (err) {
    console.error('Failed to load reports', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReports()
})
</script>

<style scoped lang="scss">
.report-view {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;

    .report-type-tabs {
      border-bottom: none;
    }

    .period-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }
  }

  .report-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .cards-grid {
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

  .two-columns-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 16px;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }

  .section-card {
    border-radius: 12px;

    .card-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .cat-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .color-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }
  }

  .debt-activity-box {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px 0;

    .activity-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--app-bg);

      .activity-info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.875rem;

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;

          &.in { background-color: #10B981; }
          &.out { background-color: #EF4444; }
          &.new-in { background-color: #3B82F6; }
          &.new-out { background-color: #F59E0B; }
        }
      }
    }
  }

  .top-categories-list {
    display: flex;
    flex-direction: column;
    gap: 14px;

    .top-cat-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .cat-rank-badge {
        width: 26px;
        height: 26px;
        border-radius: 6px;
        background: rgba(16, 185, 129, 0.15);
        color: #10B981;
        font-weight: 700;
        font-size: 0.8125rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .cat-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .cat-name-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }
      }
    }
  }

  .gauge-and-trend-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .trend-bars {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 140px;
    padding-top: 10px;

    .trend-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      height: 100%;

      .t-period {
        font-size: 0.75rem;
        color: var(--app-text-muted);
      }

      .t-bar-box {
        flex: 1;
        width: 24px;
        display: flex;
        align-items: flex-end;
        background: var(--app-bg);
        border-radius: 6px 6px 0 0;
      }

      .t-bar {
        width: 100%;
        background: linear-gradient(180deg, #34D399 0%, #10B981 100%);
        border-radius: 6px 6px 0 0;
        transition: height 0.4s ease;
      }

      .t-val {
        font-size: 0.6875rem;
        font-weight: 600;
      }
    }
  }
}
</style>

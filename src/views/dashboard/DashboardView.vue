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

    <!-- LifeOS Daily Focus: Tasks, Habits & Goals -->
    <div class="lifeos-daily-grid">
      <!-- Card 1: Today's Tasks (Large - 50% width on desktop) -->
      <div class="daily-focus-card large">
        <div class="card-body">
          <div class="card-head">
            <span class="card-title">
              <span class="emoji">📌</span> Công việc hôm nay
            </span>
            <router-link to="/tasks" class="view-link green">
              Xem tất cả →
            </router-link>
          </div>

          <div v-if="todayPendingTasks.length === 0" class="empty-note">
            🎉 Không còn công việc tồn đọng hôm nay!
          </div>
          <div v-else class="item-list">
            <div
              v-for="task in todayPendingTasks.slice(0, 4)"
              :key="task.id"
              class="focus-item task-item"
            >
              <div class="item-left">
                <button
                  class="mini-check"
                  :title="'Đánh dấu hoàn thành: ' + task.title"
                  @click="taskStore.updateStatus(task.id, 'COMPLETED')"
                />
                <span class="item-name" :class="{ overdue: task.isOverdue }" :title="task.title">
                  {{ task.title }}
                </span>
              </div>
              <div class="item-right">
                <span v-if="task.priority === 'HIGH'" class="priority-dot high" title="Ưu tiên cao" />
                <span v-if="task.isOverdue" class="overdue-tag">Quá hạn</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-foot">
          <span>{{ taskStore.statistics?.completedTasks || 0 }}/{{ taskStore.statistics?.totalTasks || 0 }} đã xong</span>
          <span class="foot-highlight green">{{ taskStore.statistics?.completionRate || 0 }}%</span>
        </div>
      </div>

      <!-- Card 2: Today's Habits (Large - 50% width on desktop) -->
      <div class="daily-focus-card large">
        <div class="card-body">
          <div class="card-head">
            <span class="card-title">
              <span class="emoji">⚡</span> Thói quen hôm nay
            </span>
            <router-link to="/habits" class="view-link amber">
              Xem tất cả →
            </router-link>
          </div>

          <div v-if="habitStore.todayHabits.length === 0" class="empty-note">
            🌿 Không có thói quen trong lịch hôm nay.
          </div>
          <div v-else class="item-list">
            <div
              v-for="habit in habitStore.todayHabits.slice(0, 4)"
              :key="habit.id"
              class="focus-item habit-item"
            >
              <div class="item-left">
                <span class="item-name" :class="{ completed: isHabitDone(habit) }" :title="habit.name">
                  {{ habit.name }}
                </span>
                <span v-if="habit.currentStreak > 0" class="habit-streak-badge" title="Chuỗi streak">
                  🔥 {{ habit.currentStreak }}
                </span>
              </div>
              <button
                class="mini-checkin-btn"
                :class="{ done: isHabitDone(habit) }"
                :title="isHabitDone(habit) ? 'Đã điểm danh hôm nay (Nhấn để hủy điểm danh)' : 'Nhấn để điểm danh'"
                @click="toggleHabitCheckin(habit)"
              >
                <el-icon v-if="isHabitDone(habit)" style="margin-right: 3px;"><Check /></el-icon>
                {{ isHabitDone(habit) ? 'Đã xong' : '+1 Điểm danh' }}
              </button>
            </div>
          </div>
        </div>

        <div class="card-foot">
          <span>{{ habitStore.statistics?.completedTodayCount || 0 }}/{{ habitStore.statistics?.todayScheduledCount || 0 }} thói quen</span>
          <span class="foot-highlight amber">{{ habitStore.statistics?.overallCompletionRate || 0 }}% nhất quán</span>
        </div>
      </div>

      <!-- Card 3: Goals In Progress (Medium - 33.3% width on desktop) -->
      <div class="daily-focus-card medium">
        <div class="card-body">
          <div class="card-head">
            <span class="card-title">
              <span class="emoji">🎯</span> Mục tiêu trọng tâm
            </span>
            <router-link to="/goals" class="view-link indigo">
              Xem tất cả →
            </router-link>
          </div>

          <div v-if="goalStore.goals.length === 0" class="empty-note">
            🚀 Hãy đặt mục tiêu đầu tiên của bạn!
          </div>
          <div v-else class="goal-list">
            <div
              v-for="goal in goalStore.goals.slice(0, 2)"
              :key="goal.id"
              class="mini-goal-item"
            >
              <div class="goal-top">
                <router-link :to="'/goals/' + goal.id" class="goal-title" :title="goal.title">
                  {{ goal.title }}
                </router-link>
                <span class="goal-pct">{{ goal.progressPercentage }}%</span>
              </div>
              <el-progress :percentage="goal.progressPercentage" :show-text="false" :stroke-width="6" color="#6366F1" />
            </div>
          </div>
        </div>

        <div class="card-foot">
          <span>{{ goalStore.statistics?.completedGoals || 0 }}/{{ goalStore.statistics?.totalGoals || 0 }} hoàn thành</span>
          <span class="foot-highlight indigo">{{ goalStore.statistics?.averageProgressPercentage || 0 }}% TB</span>
        </div>
      </div>

      <!-- Card 4: Today's Journal & Mood (Medium - 33.3% width on desktop) -->
      <div class="daily-focus-card medium">
        <div class="card-body">
          <div class="card-head">
            <span class="card-title">
              <span class="emoji">📖</span> Nhật ký & Tâm trạng
            </span>
            <router-link to="/journals" class="view-link purple">
              Xem tất cả →
            </router-link>
          </div>

          <div v-if="!todayJournal" class="empty-note">
            🌿 Bạn chưa ghi lại tâm trạng & nhật ký hôm nay.
            <div style="margin-top: 8px;">
              <router-link to="/journals/daily">
                <el-button type="primary" size="small" round>Viết nhật ký</el-button>
              </router-link>
            </div>
          </div>
          <div v-else class="journal-preview-box">
            <div class="today-mood-row">
              <span class="mood-em">{{ todayMoodEmoji }}</span>
              <span class="mood-lb">{{ todayMoodLabel }}</span>
              <span v-if="todayJournal?.energyScore" class="energy-pill">⚡ {{ todayJournal.energyScore }}/5</span>
            </div>
            <p v-if="todayJournal?.title" class="journal-title-p">
              {{ todayJournal.title }}
            </p>
            <p v-if="todayJournal?.content" class="journal-snippet-p">
              {{ todayJournal.content }}
            </p>
          </div>
        </div>

        <div class="card-foot">
          <span>{{ todayJournal?.content ? 'Đã viết nhật ký' : 'Chưa viết nội dung' }}</span>
          <router-link to="/journals/daily" class="foot-highlight purple">
            {{ todayJournal ? 'Chỉnh sửa →' : 'Viết ngay →' }}
          </router-link>
        </div>
      </div>

      <!-- Card 5: Learning & Skills (Medium - 33.3% width on desktop) -->
      <div class="daily-focus-card medium">
        <div class="card-body">
          <div class="card-head">
            <span class="card-title">
              <span class="emoji">📚</span> Học tập & Kỹ năng
            </span>
            <router-link to="/learning" class="view-link blue">
              Xem tất cả →
            </router-link>
          </div>

          <div v-if="!learningDashboard || learningDashboard.learningTimeTodayMinutes === 0" class="empty-note">
            💡 Chưa ghi nhận giờ học hôm nay.
            <div style="margin-top: 8px;">
              <router-link to="/learning/sessions">
                <el-button type="success" size="small" round>Ghi phiên học</el-button>
              </router-link>
            </div>
          </div>
          <div v-else class="learning-preview-box">
            <div class="today-mood-row">
              <span class="mood-em">⏱️</span>
              <span class="mood-lb">Hôm nay: <strong>{{ learningDashboard.learningTimeTodayMinutes }} phút</strong></span>
            </div>
            <div class="learning-pills-row">
              <span class="learn-badge courses">🎓 {{ learningDashboard.activeCoursesCount }} khóa học</span>
              <span class="learn-badge books">📖 {{ learningDashboard.readingBooksCount }} sách đọc</span>
            </div>
          </div>
        </div>

        <div class="card-foot">
          <span>{{ learningDashboard?.activeSkillsCount || 0 }} kỹ năng rèn luyện</span>
          <router-link to="/learning" class="foot-highlight blue">
            Vào học →
          </router-link>
        </div>
      </div>
    </div>

    <!-- Consolidated Financial Overview (Merged from 7 cards into 2 comprehensive cards) -->
    <div class="finance-overview-grid">
      <!-- Card 1: Assets & Net Worth -->
      <div class="finance-card assets-card">
        <div class="finance-card-head">
          <div class="head-left">
            <div class="icon-bubble purple">
              <el-icon :size="20"><Coin /></el-icon>
            </div>
            <div class="head-info">
              <h3 class="finance-title">Tài sản & Công nợ</h3>
              <span class="finance-sub">Tích lũy tổng thể hiện tại</span>
            </div>
          </div>
          <router-link to="/accounts" class="quick-link">
            Quản lý tài khoản →
          </router-link>
        </div>

        <!-- Net Worth Spotlight -->
        <div class="hero-spotlight">
          <span class="hero-label">Tài sản ròng (Net Worth)</span>
          <div class="hero-value-wrap">
            <span class="hero-value purple">{{ formatCurrency(dashboardData?.summary?.netWorth || 0) }}</span>
          </div>
          <span class="hero-formula">Số dư khả dụng + Phải thu - Phải trả</span>
        </div>

        <!-- Sub metrics breakdown: Balance, Receivable, Payable -->
        <div class="sub-metrics-row assets-breakdown">
          <div class="metric-pill">
            <div class="pill-head">
              <span class="dot-indicator green"></span>
              <span class="pill-label">Số dư khả dụng</span>
            </div>
            <span class="pill-value green">{{ formatCurrency(dashboardData?.summary?.totalBalance || 0) }}</span>
            <span class="pill-caption">Trên các tài khoản</span>
          </div>

          <div class="metric-pill">
            <div class="pill-head">
              <span class="dot-indicator blue"></span>
              <span class="pill-label">Tổng phải thu</span>
            </div>
            <span class="pill-value blue">+{{ formatCurrency(dashboardData?.summary?.totalReceivable || 0) }}</span>
            <span class="pill-caption">Người nợ cần thu</span>
          </div>

          <div class="metric-pill">
            <div class="pill-head">
              <span class="dot-indicator red"></span>
              <span class="pill-label">Tổng phải trả</span>
            </div>
            <span class="pill-value red">{{ formatCurrency(dashboardData?.summary?.totalPayable || 0) }}</span>
            <span class="pill-caption">Khoản nợ chưa trả</span>
          </div>
        </div>
      </div>

      <!-- Card 2: Cash Flow & Surplus -->
      <div class="finance-card cashflow-card">
        <div class="finance-card-head">
          <div class="head-left">
            <div class="icon-bubble emerald">
              <el-icon :size="20"><TrendCharts /></el-icon>
            </div>
            <div class="head-info">
              <div class="title-with-badge">
                <h3 class="finance-title">Dòng tiền & Thặng dư</h3>
                <span class="time-range-badge">{{ timeRangeLabel }}</span>
              </div>
              <span class="finance-sub">Thu nhập và chi tiêu theo kỳ chọn</span>
            </div>
          </div>
          <router-link to="/transactions" class="quick-link">
            Sổ giao dịch →
          </router-link>
        </div>

        <!-- Surplus Spotlight -->
        <div class="hero-spotlight">
          <span class="hero-label">Thặng dư / Chênh lệch kỳ này</span>
          <div class="hero-value-wrap">
            <span
              class="hero-value"
              :class="(dashboardData?.summary?.balanceDiff || 0) > 0 ? 'green' : (dashboardData?.summary?.balanceDiff || 0) < 0 ? 'red' : ''"
            >
              {{ (dashboardData?.summary?.balanceDiff || 0) > 0 ? '+' : '' }}{{ formatCurrency(dashboardData?.summary?.balanceDiff || 0) }}
            </span>
          </div>
          <span class="hero-formula">Thu nhập trừ chi tiêu trong kỳ</span>
        </div>

        <!-- Sub metrics breakdown: Income & Expense -->
        <div class="sub-metrics-row cashflow-breakdown">
          <div class="metric-pill">
            <div class="pill-head">
              <el-icon :size="14" class="arrow-icon green"><Bottom /></el-icon>
              <span class="pill-label">Tổng thu nhập</span>
            </div>
            <span class="pill-value green">+{{ formatCurrency(dashboardData?.summary?.totalIncome || 0) }}</span>
            <span class="pill-caption">Dòng tiền vào</span>
          </div>

          <div class="metric-pill">
            <div class="pill-head">
              <el-icon :size="14" class="arrow-icon red"><Top /></el-icon>
              <span class="pill-label">Tổng chi tiêu</span>
            </div>
            <span class="pill-value red">-{{ formatCurrency(dashboardData?.summary?.totalExpense || 0) }}</span>
            <span class="pill-caption">Dòng tiền ra</span>
          </div>
        </div>

        <!-- Spending Ratio Bar -->
        <div class="spending-ratio-box">
          <div class="ratio-header">
            <span>Tỷ lệ chi tiêu / thu nhập</span>
            <strong :style="{ color: spendingRatioColor }">{{ spendingRatio }}%</strong>
          </div>
          <el-progress
            :percentage="spendingRatio"
            :show-text="false"
            :stroke-width="6"
            :color="spendingRatioColor"
          />
        </div>
      </div>
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
            <el-table-column label="Ngày" width="105">
              <template #default="{ row }">
                <span class="text-muted">{{ formatDate(row.transactionDate) }}</span>
              </template>
            </el-table-column>

            <el-table-column label="Mô tả" width="180" show-overflow-tooltip>
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

            <el-table-column label="Danh mục" width="130">
              <template #default="{ row }">
                <el-tag
                  v-if="row.category?.name"
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

            <el-table-column label="Tài khoản" width="130">
              <template #default="{ row }">
                <span class="text-xs text-muted">{{ row.account?.name || 'Tài khoản' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="Ghi chú thêm" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                <span v-if="row.note" class="text-xs text-muted">{{ row.note }}</span>
                <span v-else class="text-muted text-xs">—</span>
              </template>
            </el-table-column>

            <el-table-column label="Số tiền" width="135" align="right">
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
                  <el-tag size="small" type="info">{{ ps.openDebtsCount ?? ps.activeDebtsCount ?? 0 }} khoản</el-tag>
                </div>
                <div style="font-size: 12px; display: flex; gap: 12px; margin-top: 4px;">
                  <span :style="{ color: (ps.totalReceivable ?? ps.receivableAmount ?? 0) > 0 ? '#10B981' : 'var(--app-text-muted)' }">
                    Họ nợ: {{ (ps.totalReceivable ?? ps.receivableAmount ?? 0) > 0 ? '+' : '' }}{{ formatCurrency(ps.totalReceivable ?? ps.receivableAmount ?? 0) }}
                  </span>
                  <span :style="{ color: (ps.totalPayable ?? ps.payableAmount ?? 0) > 0 ? '#EF4444' : 'var(--app-text-muted)' }">
                    Mình nợ: {{ (ps.totalPayable ?? ps.payableAmount ?? 0) > 0 ? '-' : '' }}{{ formatCurrency(ps.totalPayable ?? ps.payableAmount ?? 0) }}
                  </span>
                </div>
              </div>

              <div class="debt-right" style="text-align: right;">
                <div style="font-size: 11px; color: var(--app-text-muted);">Chênh lệch:</div>
                <strong :class="(ps.netAmount ?? 0) > 0 ? 'text-income' : (ps.netAmount ?? 0) < 0 ? 'text-expense' : ''">
                  {{ (ps.netAmount ?? 0) > 0 ? '+' : '' }}{{ formatCurrency(ps.netAmount ?? 0) }}
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Coin,
  Top,
  Bottom,
  TrendCharts,
  Histogram,
  PieChart,
  Tickets,
  Calendar,
  Check
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useDebtStore } from '@/stores/debt'
import { useTaskStore } from '@/stores/task'
import { useHabitStore } from '@/stores/habit'
import { useGoalStore } from '@/stores/goal'
import { useResponsive } from '@/composables/useResponsive'
import { dashboardApi } from '@/api/dashboardApi'
import { journalApi } from '@/api/journalApi'
import { learningApi } from '@/api/learningApi'
import type { DailyJournal } from '@/types/journal'
import type { LearningDashboard } from '@/types/learning'
import { MOOD_CONFIG } from '@/types/mood'
import type { DashboardData } from '@/types/dashboard'
import type { Debt } from '@/types/debt'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import AmountDisplay from '@/components/common/AmountDisplay.vue'
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart.vue'
import CategoryPieChart from '@/components/charts/CategoryPieChart.vue'
import TransactionCard from '@/components/transactions/TransactionCard.vue'
import DebtPaymentDialog from '@/components/debts/DebtPaymentDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const debtStore = useDebtStore()
const taskStore = useTaskStore()
const habitStore = useHabitStore()
const goalStore = useGoalStore()
const { isMobile } = useResponsive()

const selectedTimeRange = ref('thisMonth')
const dashboardData = ref<DashboardData | null>(null)
const loading = ref(false)

const activeDebtTab = ref<'UPCOMING' | 'BY_PERSON'>('UPCOMING')
const showPaymentDialog = ref(false)
const selectedDebt = ref<Debt | null>(null)

const todayPendingTasks = computed(() => {
  return taskStore.tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED')
})

const timeRangeLabel = computed(() => {
  switch (selectedTimeRange.value) {
    case 'today': return 'Hôm nay'
    case 'thisWeek': return 'Tuần này'
    case 'thisMonth': return 'Tháng này'
    case 'lastMonth': return 'Tháng trước'
    default: return 'Kỳ này'
  }
})

const spendingRatio = computed(() => {
  const inc = dashboardData.value?.summary?.totalIncome || 0
  const exp = dashboardData.value?.summary?.totalExpense || 0
  if (inc <= 0) return exp > 0 ? 100 : 0
  return Math.min(Math.round((exp / inc) * 1000) / 10, 100)
})

const spendingRatioColor = computed(() => {
  const ratio = spendingRatio.value
  if (ratio <= 70) return '#10B981'
  if (ratio <= 90) return '#F59E0B'
  return '#EF4444'
})

async function fetchDashboard() {
  loading.value = true
  try {
    const data = await dashboardApi.getDashboardData(selectedTimeRange.value)
    if (data?.recentTransactions) {
      data.recentTransactions.forEach((t: any) => {
        if (!t.categoryId && t.category?.id) {
          t.categoryId = t.category.id
        }
        if (t.note && t.note.startsWith('Cổng:') && t.note.includes('Tích lũy:')) {
          t.note = ''
        }
      })
    }
    dashboardData.value = data
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

function isHabitDone(habit: any): boolean {
  if (!habit) return false
  return Boolean(
    habit.isCompletedToday ||
    habit.completedToday ||
    (habit.todayCount != null && habit.targetCount != null && habit.todayCount >= habit.targetCount)
  )
}

function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function toggleHabitCheckin(habit: any) {
  if (isHabitDone(habit)) {
    await habitStore.removeCheckin(habit.id, getTodayDateString())
  } else {
    await habitStore.checkin(habit.id)
  }
}

const todayJournal = ref<DailyJournal | null>(null)
const todayMoodEmoji = computed(() => {
  if (!todayJournal.value?.moodScore) return '❓'
  return MOOD_CONFIG[todayJournal.value.moodScore]?.emoji || '😐'
})
const todayMoodLabel = computed(() => {
  if (!todayJournal.value?.moodScore) return 'Chưa ghi nhận'
  return MOOD_CONFIG[todayJournal.value.moodScore]?.label || 'Bình thường'
})

async function loadTodayJournal() {
  try {
    todayJournal.value = await journalApi.getJournalByDate(getTodayDateString())
  } catch (err) {
    console.error('Failed to load today journal', err)
  }
}

const learningDashboard = ref<LearningDashboard | null>(null)

async function loadLearningDashboard() {
  try {
    learningDashboard.value = await learningApi.getDashboard()
  } catch (err) {
    console.error('Failed to load learning dashboard', err)
  }
}

onMounted(() => {
  fetchDashboard()
  debtStore.fetchPersonSummaries()
  taskStore.fetchTasks()
  taskStore.fetchStatistics()
  habitStore.fetchTodayHabits()
  habitStore.fetchStatistics()
  goalStore.fetchGoals()
  goalStore.fetchStatistics()
  loadTodayJournal()
  loadLearningDashboard()
})
</script>

<style scoped lang="scss">
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  max-width: 100%;
  width: 100%;

  // Header
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding-bottom: 2px;

    .welcome-title {
      font-size: 1.375rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--app-text);
    }

    .welcome-desc {
      font-size: 0.8125rem;
      color: var(--app-text-muted);
      margin-top: 2px;
    }

    .time-filter {
      :deep(.el-radio-group) {
        background: var(--app-card-bg);
        border: 1px solid var(--app-card-border);
        padding: 3px;
        border-radius: 8px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);

        .el-radio-button__inner {
          border: none !important;
          border-radius: 6px !important;
          padding: 6px 12px !important;
          font-size: 0.8125rem !important;
          font-weight: 500 !important;
          background: transparent !important;
          color: var(--app-text-muted) !important;
          box-shadow: none !important;
          transition: all 0.15s ease !important;
        }

        .el-radio-button.is-active .el-radio-button__inner {
          background: var(--app-bg) !important;
          color: var(--app-text) !important;
          font-weight: 600 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06) !important;
        }
      }
    }
  }

  .unclassified-alert {
    border-radius: 8px;
    border: 1px solid rgba(245, 158, 11, 0.25);

    .alert-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  // Bento Consolidated Finance Overview
  .finance-overview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    width: 100%;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }

    .finance-card {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 12px;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 14px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        border-color: rgba(16, 185, 129, 0.35);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
      }

      .finance-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        .head-left {
          display: flex;
          align-items: center;
          gap: 10px;

          .icon-bubble {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            &.purple {
              background: rgba(99, 102, 241, 0.08);
              color: #6366F1;
            }

            &.emerald {
              background: rgba(16, 185, 129, 0.08);
              color: #10B981;
            }
          }

          .head-info {
            display: flex;
            flex-direction: column;

            .title-with-badge {
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .finance-title {
              font-size: 0.9375rem;
              font-weight: 600;
              color: var(--app-text);
              margin: 0;
            }

            .time-range-badge {
              padding: 1px 7px;
              border-radius: 6px;
              font-size: 0.6875rem;
              font-weight: 600;
              background: rgba(16, 185, 129, 0.08);
              color: #10B981;
            }

            .finance-sub {
              font-size: 0.75rem;
              color: var(--app-text-muted);
              margin-top: 1px;
            }
          }
        }

        .quick-link {
          font-size: 0.78125rem;
          font-weight: 500;
          color: var(--app-text-muted);
          text-decoration: none;
          transition: color 0.15s ease;
          white-space: nowrap;

          &:hover {
            color: var(--el-color-primary);
          }
        }
      }

      .hero-spotlight {
        padding: 2px 0 6px 0;
        display: flex;
        flex-direction: column;
        gap: 2px;

        .hero-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--app-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .hero-value-wrap {
          display: flex;
          align-items: baseline;
          gap: 6px;

          .hero-value {
            font-size: 1.875rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: var(--app-text);

            &.purple { color: #6366F1; }
            &.green { color: #10B981; }
            &.red { color: #EF4444; }
          }
        }

        .hero-formula {
          font-size: 0.72rem;
          color: var(--app-text-muted);
        }
      }

      .sub-metrics-row {
        display: grid;
        gap: 12px;
        padding-top: 14px;
        border-top: 1px solid var(--app-card-border);

        &.assets-breakdown {
          grid-template-columns: repeat(3, 1fr);

          @media (max-width: 540px) {
            grid-template-columns: 1fr;
          }
        }

        &.cashflow-breakdown {
          grid-template-columns: repeat(2, 1fr);

          @media (max-width: 540px) {
            grid-template-columns: 1fr;
          }
        }

        .metric-pill {
          display: flex;
          flex-direction: column;
          gap: 2px;

          .pill-head {
            display: flex;
            align-items: center;
            gap: 6px;

            .dot-indicator {
              width: 6px;
              height: 6px;
              border-radius: 50%;

              &.green { background: #10B981; }
              &.blue { background: #3B82F6; }
              &.red { background: #EF4444; }
            }

            .arrow-icon {
              &.green { color: #10B981; }
              &.red { color: #EF4444; }
            }

            .pill-label {
              font-size: 0.72rem;
              font-weight: 500;
              color: var(--app-text-muted);
            }
          }

          .pill-value {
            font-size: 1.0625rem;
            font-weight: 700;
            margin-top: 2px;

            &.green { color: #10B981; }
            &.blue { color: #3B82F6; }
            &.red { color: #EF4444; }
          }

          .pill-caption {
            font-size: 0.6875rem;
            color: var(--app-text-muted);
          }
        }
      }

      .spending-ratio-box {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding-top: 8px;
        border-top: 1px solid var(--app-card-border);

        .ratio-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--app-text-muted);

          strong {
            font-weight: 600;
          }
        }
      }
    }
  }

  // LifeOS Daily Focus (Clean, Notion-style)
  .lifeos-daily-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;

    @media (max-width: 1100px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 680px) {
      grid-template-columns: 1fr;
    }

    .daily-focus-card {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 12px;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &.large {
        grid-column: span 3;
        min-height: 220px;

        @media (max-width: 1100px) {
          grid-column: span 1;
        }
      }

      &.medium {
        grid-column: span 2;
        min-height: 200px;

        @media (max-width: 1100px) {
          grid-column: span 1;
        }
      }

      &:hover {
        border-color: rgba(16, 185, 129, 0.35);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
      }

      .card-body {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .card-title {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--app-text);
            display: flex;
            align-items: center;
            gap: 6px;

            .emoji {
              font-size: 1rem;
            }
          }

          .view-link {
            font-size: 0.78125rem;
            font-weight: 500;
            color: var(--app-text-muted);
            text-decoration: none;
            transition: color 0.15s ease;

            &:hover {
              color: var(--el-color-primary);
            }
          }
        }

        .journal-preview-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 2px 0;

          .today-mood-row {
            display: flex;
            align-items: center;
            gap: 8px;
            .mood-em { font-size: 20px; line-height: 1; }
            .mood-lb { font-size: 13px; font-weight: 600; color: var(--app-text); }
            .energy-pill {
              font-size: 11px;
              background: rgba(245, 158, 11, 0.1);
              color: #d97706;
              padding: 1px 7px;
              border-radius: 4px;
              font-weight: 600;
            }
          }
          .journal-title-p {
            font-size: 13px;
            font-weight: 600;
            color: var(--app-text);
            margin: 0;
            line-height: 1.4;
          }
          .journal-snippet-p {
            font-size: 12px;
            color: var(--app-text-muted);
            margin: 0;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        .learning-preview-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 2px 0;

          .today-mood-row {
            display: flex;
            align-items: center;
            gap: 8px;
            .mood-em { font-size: 20px; line-height: 1; }
            .mood-lb { font-size: 13px; color: var(--app-text); }
          }

          .learning-pills-row {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;

            .learn-badge {
              font-size: 0.72rem;
              font-weight: 600;
              padding: 2px 8px;
              border-radius: 4px;

              &.courses {
                background: rgba(99, 102, 241, 0.08);
                color: #6366F1;
              }

              &.books {
                background: rgba(16, 185, 129, 0.08);
                color: #10B981;
              }
            }
          }
        }

        .empty-note {
          font-size: 0.8125rem;
          color: var(--app-text-muted);
          padding: 14px 0;
          text-align: center;
        }

        .item-list {
          display: flex;
          flex-direction: column;
          gap: 6px;

          .focus-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 6px 10px;
            border-radius: 6px;
            background: rgba(0, 0, 0, 0.02);
            transition: background-color 0.15s ease;

            &:hover {
              background: rgba(0, 0, 0, 0.04);
            }

            .item-left {
              display: flex;
              align-items: center;
              gap: 8px;
              min-width: 0;
              flex: 1;

              .mini-check {
                width: 18px;
                height: 18px;
                border-radius: 4px;
                border: 1.5px solid var(--app-card-border);
                background: transparent;
                cursor: pointer;
                flex-shrink: 0;
                transition: all 0.15s ease;

                &:hover {
                  border-color: #10B981;
                  background: rgba(16, 185, 129, 0.1);
                }

                &:active {
                  transform: scale(0.92);
                }
              }

              .item-name {
                font-size: 0.8125rem;
                font-weight: 500;
                color: var(--app-text);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;

                &.overdue {
                  color: #EF4444;
                  font-weight: 600;
                }

                &.completed {
                  text-decoration: line-through;
                  color: var(--app-text-muted);
                }
              }

              .habit-streak-badge {
                font-size: 0.6875rem;
                font-weight: 700;
                color: #d97706;
                background: rgba(245, 158, 11, 0.1);
                padding: 1px 6px;
                border-radius: 4px;
                flex-shrink: 0;
              }
            }

            .item-right {
              display: flex;
              align-items: center;
              gap: 6px;
              flex-shrink: 0;

              .priority-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                &.high { background: #EF4444; }
              }

              .overdue-tag {
                font-size: 0.6875rem;
                font-weight: 600;
                color: #EF4444;
                background: rgba(239, 68, 68, 0.08);
                padding: 1px 5px;
                border-radius: 4px;
              }
            }

            .mini-checkin-btn {
              padding: 3px 8px;
              border-radius: 6px;
              font-size: 0.75rem;
              font-weight: 600;
              cursor: pointer;
              border: 1px solid var(--app-card-border);
              flex-shrink: 0;
              display: flex;
              align-items: center;
              gap: 3px;
              transition: all 0.15s ease;
              background: var(--app-bg);
              color: var(--app-text-muted);

              &:hover {
                border-color: #d97706;
                color: #d97706;
              }

              &.done {
                background: rgba(16, 185, 129, 0.08);
                border-color: rgba(16, 185, 129, 0.25);
                color: #059669;

                &:hover {
                  background: rgba(16, 185, 129, 0.15);
                  color: #047857;
                }
              }
            }
          }
        }

        .goal-list {
          display: flex;
          flex-direction: column;
          gap: 10px;

          .mini-goal-item {
            display: flex;
            flex-direction: column;
            gap: 5px;

            .goal-top {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 0.8125rem;

              .goal-title {
                font-weight: 500;
                color: var(--app-text);
                text-decoration: none;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 80%;

                &:hover {
                  color: var(--el-color-primary);
                }
              }

              .goal-pct {
                font-weight: 600;
                color: var(--el-color-primary);
              }
            }
          }
        }
      }

      .card-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 10px;
        border-top: 1px solid var(--app-card-border);
        font-size: 0.78125rem;
        color: var(--app-text-muted);

        .foot-highlight {
          font-weight: 600;
          color: var(--app-text);
          text-decoration: none;

          &:hover {
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  // Row 4: Charts Grid
  .charts-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 16px;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }

    .chart-card {
      border-radius: 12px;
      border: 1px solid var(--app-card-border);
      box-shadow: none;
    }
  }

  // Row 5: Tables & Debts Grid
  .tables-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 16px;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }

    .recent-transactions-card,
    .upcoming-debts-card {
      border-radius: 12px;
      border: 1px solid var(--app-card-border);
      box-shadow: none;
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
        color: var(--el-color-primary);
      }
    }
  }

  .desc-col {
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    overflow: hidden;

    .font-medium {
      font-weight: 500;
      color: var(--app-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      min-width: 0;
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
    gap: 8px;

    .debt-item-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.015);
      border: 1px solid var(--app-card-border);
      transition: border-color 0.15s ease;

      &:hover {
        border-color: rgba(16, 185, 129, 0.35);
      }

      .debt-left {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .debt-person-row {
          display: flex;
          align-items: center;
          gap: 6px;

          .person-name {
            font-size: 0.84rem;
            font-weight: 600;
          }
        }

        .debt-desc {
          font-size: 0.72rem;
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
        gap: 4px;
      }
    }
  }
}

:global(html.dark) {
  .dashboard-view {
    .lifeos-daily-grid .focus-item,
    .debts-list .debt-item-card {
      background: rgba(255, 255, 255, 0.02);

      &:hover {
        background: rgba(255, 255, 255, 0.04);
      }
    }

    .time-filter .el-radio-group .el-radio-button.is-active .el-radio-button__inner {
      background: rgba(255, 255, 255, 0.08) !important;
      color: #FFFFFF !important;
    }
  }
}
</style>

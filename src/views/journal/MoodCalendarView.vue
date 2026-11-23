<template>
  <div class="mood-calendar-page">
    <!-- Page Header -->
    <div class="page-top-bar">
      <div class="title-col">
        <div class="title-with-back">
          <router-link to="/journals" class="back-link">
            <el-button circle size="small">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
          </router-link>
          <h1 class="page-title">Lịch theo dõi Tâm trạng</h1>
        </div>
        <p class="page-desc">Quan sát xu hướng cảm xúc, năng lượng và thấu hiểu bản thân qua từng ngày.</p>
      </div>

      <div class="month-controls">
        <el-button circle size="small" @click="changeMonth(-1)">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="month-label">Tháng {{ selectedMonthYear }}</span>
        <el-button circle size="small" @click="changeMonth(1)">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        <el-button size="small" plain @click="goToCurrentMonth">Hôm nay</el-button>
      </div>
    </div>

    <!-- Mood Stats 2x2 Grid -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Tâm trạng trung bình</span>
          <div class="stat-icon-wrapper mood-icon">
            <span class="emoji-icon">😊</span>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ moodStats?.averageMood ? moodStats.averageMood + ' / 5' : '--' }}</span>
          <span class="stat-subtext">Thang điểm 1 - 5</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Năng lượng trung bình</span>
          <div class="stat-icon-wrapper energy-icon">
            <span class="emoji-icon">⚡</span>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ moodStats?.averageEnergy ? moodStats.averageEnergy + ' / 5' : '--' }}</span>
          <span class="stat-subtext">Thang điểm 1 - 5</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Ngày đã ghi nhận</span>
          <div class="stat-icon-wrapper record-icon">
            <el-icon><Calendar /></el-icon>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ moodStats?.totalRecordedDays ?? 0 }} <small>ngày</small></span>
          <span class="stat-subtext">Trong tháng {{ selectedMonthYear }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Tâm trạng chủ đạo</span>
          <div class="stat-icon-wrapper main-mood-icon">
            <span class="emoji-icon">🎯</span>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ moodStats?.predominantMood || 'Chưa đủ' }}</span>
          <span class="stat-subtext">Phổ biến nhất</span>
        </div>
      </div>
    </div>

    <!-- Mood Distribution Card -->
    <div class="distribution-card">
      <h2 class="dist-title">Phân bổ tâm trạng trong tháng</h2>
      <div class="dist-bars-grid">
        <div
          v-for="(cfg, score) in MOOD_CONFIG"
          :key="score"
          class="dist-item"
        >
          <div class="dist-label-row">
            <span class="dist-emoji">{{ cfg.emoji }}</span>
            <span class="dist-name">{{ cfg.label }}</span>
            <span class="dist-count">{{ getMoodCount(Number(score)) }} ngày</span>
          </div>
          <el-progress
            :percentage="getMoodPercentage(Number(score))"
            :color="cfg.color"
            :stroke-width="10"
            :show-text="false"
          />
        </div>
      </div>
    </div>

    <!-- Calendar View -->
    <div class="calendar-card">
      <div class="calendar-week-header">
        <span v-for="d in ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']" :key="d" class="col-head">
          {{ d }}
        </span>
      </div>

      <div class="calendar-days-grid">
        <div
          v-for="(cell, idx) in calendarCells"
          :key="idx"
          class="cal-cell"
          :class="{
            'is-empty': !cell.date,
            'is-today': cell.isToday,
            'is-future': cell.isFuture,
            'has-entry': cell.hasEntry
          }"
          @click="cell.date && openDayDetail(cell)"
        >
          <template v-if="cell.date">
            <div class="cell-top">
              <span class="day-num">{{ cell.dayNum }}</span>
              <span v-if="cell.hasJournal" class="journal-indicator" title="Có viết nhật ký">✍️</span>
            </div>

            <div class="cell-body">
              <span v-if="cell.moodScore" class="mood-face" :title="'Tâm trạng: ' + cell.moodLabel">
                {{ cell.moodEmoji }}
              </span>
              <span v-if="cell.energyScore" class="energy-indicator" :title="'Năng lượng: ' + cell.energyLabel">
                {{ cell.energyIcon }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Day Quick Detail Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="'Chi tiết ngày ' + selectedDayFormatted"
      width="92%"
      class="day-detail-dialog"
    >
      <div v-if="activeCell" class="dialog-body">
        <div class="detail-section">
          <label class="section-label">Tâm trạng:</label>
          <div class="current-state-badge">
            <span class="emoji">{{ activeCell.moodEmoji || 'Chưa ghi nhận' }}</span>
            <span class="text">{{ activeCell.moodLabel || 'Chưa chọn tâm trạng' }}</span>
          </div>
        </div>

        <div v-if="activeCell.energyScore" class="detail-section">
          <label class="section-label">Mức năng lượng:</label>
          <div class="current-state-badge">
            <span class="emoji">{{ activeCell.energyIcon }}</span>
            <span class="text">{{ activeCell.energyLabel }}</span>
          </div>
        </div>

        <div v-if="activeCell.note" class="detail-section">
          <label class="section-label">Ghi chú cảm xúc:</label>
          <p class="note-box">{{ activeCell.note }}</p>
        </div>

        <div class="detail-section">
          <label class="section-label">Nhật ký ngày:</label>
          <div class="journal-status-box">
            <span>{{ activeCell.hasJournal ? 'Đã viết nhật ký' : 'Chưa viết nhật ký cho ngày này' }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">Đóng</el-button>
          <el-button type="primary" @click="goToDailyJournal(activeCell?.date)">
            {{ activeCell?.hasJournal ? 'Xem & Sửa nhật ký' : 'Viết nhật ký & Điểm danh' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Calendar } from '@element-plus/icons-vue'
import { moodApi } from '@/api/moodApi'
import type { MoodCalendarDay, MoodStatistics } from '@/types/mood'
import { MOOD_CONFIG, ENERGY_CONFIG } from '@/types/mood'

const router = useRouter()

const currentDate = new Date()
const viewYear = ref(currentDate.getFullYear())
const viewMonth = ref(currentDate.getMonth() + 1)

const calendarDays = ref<MoodCalendarDay[]>([])
const moodStats = ref<MoodStatistics | null>(null)

// Dialog state
const detailDialogVisible = ref(false)
const activeCell = ref<any>(null)

const selectedMonthYear = computed(() => {
  return `${viewMonth.value < 10 ? '0' + viewMonth.value : viewMonth.value}/${viewYear.value}`
})

const selectedDayFormatted = computed(() => {
  if (!activeCell.value?.date) return ''
  const [y, m, d] = activeCell.value.date.split('-')
  return `${d}/${m}/${y}`
})

// Build Calendar Matrix
interface CalCell {
  date?: string
  dayNum?: number
  isToday?: boolean
  isFuture?: boolean
  hasEntry?: boolean
  hasJournal?: boolean
  moodScore?: number | null
  moodEmoji?: string
  moodLabel?: string
  energyScore?: number | null
  energyIcon?: string
  energyLabel?: string
  note?: string | null
}

const calendarCells = computed<CalCell[]>(() => {
  const year = viewYear.value
  const month = viewMonth.value

  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()

  let startOffset = firstDay.getDay() - 1
  if (startOffset === -1) startOffset = 6

  const cells: CalCell[] = []
  for (let i = 0; i < startOffset; i++) {
    cells.push({})
  }

  const todayStr = getIsoDate(new Date())
  const dayMap = new Map<string, MoodCalendarDay>()
  calendarDays.value.forEach(d => dayMap.set(d.date, d))

  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const item = dayMap.get(dStr)

    const isToday = dStr === todayStr
    const isFuture = dStr > todayStr
    const moodScore = item?.moodScore ?? null
    const energyScore = item?.energyScore ?? null

    cells.push({
      date: dStr,
      dayNum: day,
      isToday,
      isFuture,
      hasEntry: item?.hasEntry ?? false,
      hasJournal: item?.hasJournal ?? false,
      moodScore,
      moodEmoji: moodScore ? MOOD_CONFIG[moodScore]?.emoji : '',
      moodLabel: moodScore ? MOOD_CONFIG[moodScore]?.label : '',
      energyScore,
      energyIcon: energyScore ? ENERGY_CONFIG[energyScore]?.icon : '',
      energyLabel: energyScore ? ENERGY_CONFIG[energyScore]?.label : '',
      note: item?.note ?? null
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push({})
  }

  return cells
})

function getIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dt = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dt}`
}

function getMoodCount(score: number): number {
  return moodStats.value?.moodDistribution?.[score] || 0
}

function getMoodPercentage(score: number): number {
  const total = moodStats.value?.totalRecordedDays || 0
  if (total === 0) return 0
  const count = getMoodCount(score)
  return Math.round((count / total) * 100)
}

function changeMonth(delta: number) {
  let m = viewMonth.value + delta
  let y = viewYear.value
  if (m < 1) {
    m = 12
    y--
  } else if (m > 12) {
    m = 1
    y++
  }
  viewMonth.value = m
  viewYear.value = y
  loadMonthData()
}

function goToCurrentMonth() {
  const now = new Date()
  viewYear.value = now.getFullYear()
  viewMonth.value = now.getMonth() + 1
  loadMonthData()
}

function openDayDetail(cell: CalCell) {
  activeCell.value = cell
  detailDialogVisible.value = true
}

function goToDailyJournal(dateStr?: string) {
  detailDialogVisible.value = false
  if (dateStr) {
    router.push({ path: '/journals/daily', query: { date: dateStr } })
  }
}

async function loadMonthData() {
  try {
    const y = viewYear.value
    const m = viewMonth.value
    const from = `${y}-${String(m).padStart(2, '0')}-01`
    const lastDay = new Date(y, m, 0).getDate()
    const to = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    const [calRes, statsRes] = await Promise.all([
      moodApi.getCalendar({ from, to }),
      moodApi.getStatistics({ from, to })
    ])
    calendarDays.value = calRes
    moodStats.value = statsRes
  } catch (err) {
    console.error('Failed to load mood calendar', err)
  }
}

onMounted(() => {
  loadMonthData()
})
</script>

<style scoped lang="scss">
.mood-calendar-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.page-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  .title-col {
    .title-with-back {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;

      .page-title {
        font-size: 22px;
        font-weight: 700;
        color: var(--app-text, #1e293b);
        margin: 0;
      }
    }

    .page-desc {
      font-size: 13px;
      color: var(--app-text-muted, #64748b);
      margin: 0;
    }
  }

  .month-controls {
    display: flex;
    align-items: center;
    gap: 8px;

    .month-label {
      font-size: 15px;
      font-weight: 700;
      color: var(--app-text, #1e293b);
      min-width: 110px;
      text-align: center;
    }
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.stat-card {
  background: var(--app-card-bg, #ffffff);
  border: 1px solid var(--app-card-border, #e2e8f0);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
  will-change: transform;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);

    .stat-icon-wrapper {
      transform: scale(1.08);
    }
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .stat-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--app-text-muted, #64748b);
    }
    .stat-icon-wrapper {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      &.mood-icon { background: rgba(59, 130, 246, 0.1); }
      &.energy-icon { background: rgba(245, 158, 11, 0.1); }
      &.record-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
      &.main-mood-icon { background: rgba(139, 92, 246, 0.1); }
    }
  }

  .stat-value-group {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--app-text, #1e293b);
      small { font-size: 14px; font-weight: normal; }
    }
    .stat-subtext {
      font-size: 12px;
      color: var(--app-text-muted, #94a3b8);
    }
  }
}

.distribution-card {
  background: var(--app-card-bg, #ffffff);
  border: 1px solid var(--app-card-border, #e2e8f0);
  border-radius: 14px;
  padding: 18px;

  .dist-title {
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 14px 0;
    color: var(--app-text, #1e293b);
  }

  .dist-bars-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .dist-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .dist-label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        font-weight: 600;

        .dist-emoji { font-size: 16px; margin-right: 4px; }
        .dist-name { flex: 1; color: var(--app-text, #334155); }
        .dist-count { color: var(--app-text-muted, #64748b); font-size: 11px; }
      }
    }
  }
}

.calendar-card {
  background: var(--app-card-bg, #ffffff);
  border: 1px solid var(--app-card-border, #e2e8f0);
  border-radius: 14px;
  padding: 18px;

  .calendar-week-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    color: var(--app-text-muted, #64748b);
    padding-bottom: 10px;
  }

  .calendar-days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;

    .cal-cell {
      min-height: 80px;
      background: var(--app-bg, #f8fafc);
      border: 1px solid var(--app-card-border, #e2e8f0);
      border-radius: 10px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &.is-empty {
        background: transparent;
        border-color: transparent;
        cursor: default;
      }

      &:not(.is-empty):hover {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.04);
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(59, 130, 246, 0.1);
      }

      &:active:not(.is-empty) {
        transform: scale(0.95);
      }

      &.is-today {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.08);
        .day-num {
          color: #3b82f6;
          font-weight: 700;
        }
      }

      .cell-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        font-weight: 600;
        color: var(--app-text, #334155);

        .journal-indicator { font-size: 11px; }
      }

      .cell-body {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 6px;
        min-height: 32px;

        .mood-face { font-size: 26px; line-height: 1; }
        .energy-indicator { font-size: 14px; }
      }
    }
  }
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .detail-section {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .section-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--app-text-muted, #64748b);
    }

    .current-state-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--app-bg, #f8fafc);
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid var(--app-card-border, #e2e8f0);
      .emoji { font-size: 22px; }
      .text { font-size: 14px; font-weight: 600; color: var(--app-text, #1e293b); }
    }

    .note-box {
      margin: 0;
      padding: 10px 14px;
      background: var(--app-bg, #f8fafc);
      border-radius: 8px;
      font-size: 13px;
      color: var(--app-text, #334155);
      border: 1px solid var(--app-card-border, #e2e8f0);
    }

    .journal-status-box {
      font-size: 13px;
      color: var(--app-text, #334155);
    }
  }
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .page-top-bar {
    flex-direction: column;
    align-items: stretch;
    .month-controls {
      justify-content: space-between;
      width: 100%;
    }
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .dist-bars-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .calendar-card {
    padding: 12px;
    .calendar-week-header {
      font-size: 11px;
    }
    .cal-cell {
      min-height: 52px;
      padding: 4px;
      .cell-top .day-num { font-size: 11px; }
      .cell-body {
        min-height: 24px;
        .mood-face { font-size: 18px; }
        .energy-indicator { font-size: 11px; }
      }
    }
  }
}
</style>

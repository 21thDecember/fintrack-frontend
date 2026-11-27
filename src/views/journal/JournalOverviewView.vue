<template>
  <div class="journal-overview-page">
    <!-- Page Header -->
    <div class="page-top-bar">
      <div class="title-col">
        <h1 class="page-title">
          <span>Nhật ký & Đánh giá</span>
          <el-tag size="small" effect="plain" type="primary" round class="module-badge">LifeOS</el-tag>
        </h1>
        <p class="page-desc">Ghi lại suy nghĩ, theo dõi tâm trạng mỗi ngày và nhìn nhận sự tiến bộ qua từng tuần.</p>
      </div>

      <div class="top-actions">
        <router-link to="/journals/daily">
          <el-button type="primary" :icon="EditPen" round class="action-btn">
            Viết nhật ký hôm nay
          </el-button>
        </router-link>
        <router-link to="/journals/mood">
          <el-button round class="action-btn">
            <el-icon><Sunny /></el-icon>
            Lịch tâm trạng
          </el-button>
        </router-link>
        <router-link to="/journals/reviews">
          <el-button round class="action-btn">
            <el-icon><Memo /></el-icon>
            Review tuần
          </el-button>
        </router-link>
      </div>
    </div>

    <!-- Summary Stats 2x2 Grid -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Nhật ký hôm nay</span>
          <div class="stat-icon-wrapper journal-icon">
            <el-icon><EditPen /></el-icon>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ todayJournal ? 'Đã viết' : 'Chưa viết' }}</span>
          <span class="stat-subtext">{{ todayFormatted }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Tâm trạng hôm nay</span>
          <div class="stat-icon-wrapper mood-icon">
            <span class="emoji-icon">{{ todayMoodEmoji }}</span>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ todayMoodLabel }}</span>
          <span class="stat-subtext">{{ todayEnergyLabel }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Nhật ký tháng này</span>
          <div class="stat-icon-wrapper count-icon">
            <el-icon><Calendar /></el-icon>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ monthJournalCount }} <small>ngày</small></span>
          <span class="stat-subtext">Trong tháng {{ currentMonth }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Tâm trạng TB tháng</span>
          <div class="stat-icon-wrapper avg-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ monthAvgMood ? monthAvgMood + ' / 5' : '--' }}</span>
          <span class="stat-subtext">Chủ đạo: {{ monthPredominantMood }}</span>
        </div>
      </div>
    </div>

    <!-- Main Content Area: Calendar Grid & Recent Journals List -->
    <div class="content-layout">
      <!-- Calendar Panel -->
      <div class="calendar-card">
        <div class="card-head">
          <div class="card-title-group">
            <h2 class="card-title">Lịch nhật ký & Tâm trạng</h2>
            <span class="card-subtitle">Tháng {{ selectedMonthYear }}</span>
          </div>
          <div class="month-nav">
            <el-button circle size="small" @click="changeMonth(-1)">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <el-button size="small" plain @click="goToCurrentMonth">Hôm nay</el-button>
            <el-button circle size="small" @click="changeMonth(1)">
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- Custom Month Grid -->
        <div class="calendar-table-wrap">
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
                'has-journal': cell.hasJournal,
                'has-mood': cell.moodScore
              }"
              @click="cell.date && onDayClick(cell.date)"
            >
              <template v-if="cell.date">
                <div class="cell-top">
                  <span class="day-num">{{ cell.dayNum }}</span>
                  <span v-if="cell.hasJournal" class="journal-dot" title="Có nhật ký">✍️</span>
                </div>
                <div class="cell-content">
                  <span v-if="cell.moodScore" class="cell-mood" :title="'Tâm trạng: ' + cell.moodLabel">
                    {{ cell.moodEmoji }}
                  </span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Journals List -->
      <div class="recent-list-card">
        <div class="card-head">
          <h2 class="card-title">Nhật ký gần đây</h2>
          <el-input
            v-model="searchKeyword"
            placeholder="Tìm nhật ký..."
            clearable
            size="small"
            class="search-input"
            @input="onSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div v-loading="loadingList" class="journals-list">
          <div v-if="recentJournals.length === 0" class="empty-list">
            <el-empty description="Chưa có nhật ký nào">
              <router-link to="/journals/daily">
                <el-button type="primary" size="small" round>Viết bài đầu tiên</el-button>
              </router-link>
            </el-empty>
          </div>

          <div
            v-for="item in recentJournals"
            :key="item.id"
            class="journal-item-card"
            @click="openJournal(item.journalDate)"
          >
            <div class="item-head">
              <div class="item-date-badge">
                <span class="date-str">{{ formatItemDate(item.journalDate) }}</span>
              </div>
              <div v-if="item.moodScore" class="item-mood-badge">
                <span>{{ getMoodEmoji(item.moodScore) }}</span>
                <span class="mood-lbl">{{ getMoodLabel(item.moodScore) }}</span>
              </div>
            </div>

            <h3 class="item-title">{{ item.title || 'Nhật ký không tiêu đề' }}</h3>

            <p v-if="item.content" class="item-snippet">
              {{ truncateText(item.content, 90) }}
            </p>
            <p v-else-if="item.highlight" class="item-highlight">
              <strong>⭐ Điểm sáng:</strong> {{ item.highlight }}
            </p>

            <div class="item-footer">
              <span class="read-more">Chi tiết & Sửa &rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  EditPen,
  Calendar,
  TrendCharts,
  Sunny,
  Memo,
  Search,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
import { journalApi } from '@/api/journalApi'
import { moodApi } from '@/api/moodApi'
import type { DailyJournal, JournalCalendarDay } from '@/types/journal'
import type { MoodStatistics } from '@/types/mood'
import { MOOD_CONFIG, ENERGY_CONFIG } from '@/types/mood'

const router = useRouter()

// Date state
const currentDate = new Date()
const viewYear = ref(currentDate.getFullYear())
const viewMonth = ref(currentDate.getMonth() + 1) // 1-12

// Data state
const todayJournal = ref<DailyJournal | null>(null)
const calendarDays = ref<JournalCalendarDay[]>([])
const recentJournals = ref<DailyJournal[]>([])
const moodStats = ref<MoodStatistics | null>(null)
const loadingList = ref(false)
const searchKeyword = ref('')

const todayFormatted = computed(() => {
  const d = new Date()
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
})

const currentMonth = computed(() => {
  return `${viewMonth.value}/${viewYear.value}`
})

const selectedMonthYear = computed(() => {
  return `${viewMonth.value < 10 ? '0' + viewMonth.value : viewMonth.value}/${viewYear.value}`
})

const todayMoodEmoji = computed(() => {
  if (!todayJournal.value?.moodScore) return '❓'
  return MOOD_CONFIG[todayJournal.value.moodScore]?.emoji || '😐'
})

const todayMoodLabel = computed(() => {
  if (!todayJournal.value?.moodScore) return 'Chưa ghi nhận'
  return MOOD_CONFIG[todayJournal.value.moodScore]?.label || 'Bình thường'
})

const todayEnergyLabel = computed(() => {
  if (!todayJournal.value?.energyScore) return 'Chưa chọn năng lượng'
  const e = ENERGY_CONFIG[todayJournal.value.energyScore]
  return `Năng lượng: ${e?.icon || ''} ${e?.label || ''}`
})

const monthJournalCount = computed(() => {
  return calendarDays.value.filter(d => d.hasJournal).length
})

const monthAvgMood = computed(() => {
  return moodStats.value?.averageMood ?? null
})

const monthPredominantMood = computed(() => {
  return moodStats.value?.predominantMood || 'Chưa đủ dữ liệu'
})

// Build Calendar Matrix (Monday start)
interface CalCell {
  date?: string
  dayNum?: number
  isToday?: boolean
  isFuture?: boolean
  hasJournal?: boolean
  moodScore?: number | null
  moodEmoji?: string
  moodLabel?: string
}

const calendarCells = computed<CalCell[]>(() => {
  const year = viewYear.value
  const month = viewMonth.value

  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()

  // Day of week: 0=Sun, 1=Mon, ..., 6=Sat -> Convert to Mon=0, Sun=6
  let startOffset = firstDay.getDay() - 1
  if (startOffset === -1) startOffset = 6

  const cells: CalCell[] = []

  // Preceding empty cells
  for (let i = 0; i < startOffset; i++) {
    cells.push({})
  }

  const todayStr = getIsoDate(new Date())
  const dayMap = new Map<string, JournalCalendarDay>()
  calendarDays.value.forEach(d => dayMap.set(d.date, d))

  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const item = dayMap.get(dStr)

    const isToday = dStr === todayStr
    const isFuture = dStr > todayStr
    const moodScore = item?.moodScore ?? null

    cells.push({
      date: dStr,
      dayNum: day,
      isToday,
      isFuture,
      hasJournal: item?.hasJournal ?? false,
      moodScore,
      moodEmoji: moodScore ? MOOD_CONFIG[moodScore]?.emoji : '',
      moodLabel: moodScore ? MOOD_CONFIG[moodScore]?.label : ''
    })
  }

  // Trailing empty cells to fill grid to multiple of 7
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

function getMoodEmoji(score?: number | null): string {
  if (!score) return ''
  return MOOD_CONFIG[score]?.emoji || ''
}

function getMoodLabel(score?: number | null): string {
  if (!score) return ''
  return MOOD_CONFIG[score]?.label || ''
}

function formatItemDate(dStr: string): string {
  try {
    const [y, m, d] = dStr.split('-')
    return `${d}/${m}/${y}`
  } catch {
    return dStr
  }
}

function truncateText(txt: string, len: number): string {
  if (!txt) return ''
  return txt.length > len ? txt.substring(0, len) + '...' : txt
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

function onDayClick(dateStr: string) {
  router.push({ path: '/journals/daily', query: { date: dateStr } })
}

function openJournal(dateStr: string) {
  router.push({ path: '/journals/daily', query: { date: dateStr } })
}

let searchTimer: any = null
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadRecentJournals()
  }, 300)
}

async function loadTodayData() {
  try {
    const today = getIsoDate(new Date())
    const res = await journalApi.getJournalByDate(today)
    todayJournal.value = res
  } catch (err) {
    console.error('Failed to load today journal', err)
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
      journalApi.getCalendar({ from, to }),
      moodApi.getStatistics({ from, to })
    ])
    calendarDays.value = calRes
    moodStats.value = statsRes
  } catch (err) {
    console.error('Failed to load month calendar data', err)
  }
}

async function loadRecentJournals() {
  loadingList.value = true
  try {
    const res = await journalApi.getJournals({
      keyword: searchKeyword.value,
      page: 0,
      size: 10
    })
    const list = res.content || []
    recentJournals.value = list.slice().sort((a, b) => b.journalDate.localeCompare(a.journalDate))
  } catch (err) {
    console.error('Failed to load recent journals', err)
  } finally {
    loadingList.value = false
  }
}

onMounted(() => {
  loadTodayData()
  loadMonthData()
  loadRecentJournals()
})
</script>

<style scoped lang="scss">
.journal-overview-page {
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
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;

  .title-col {
    .page-title {
      font-size: 22px;
      font-weight: 700;
      color: var(--app-text, #1e293b);
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .page-desc {
      font-size: 13px;
      color: var(--app-text-muted, #64748b);
      margin: 0;
    }
  }

  .top-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.stat-card {
  background: var(--app-card-bg);
  border: 1px solid var(--app-card-border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  box-shadow: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: rgba(16, 185, 129, 0.4);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
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

      &.journal-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
      &.mood-icon { background: rgba(245, 158, 11, 0.1); }
      &.count-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
      &.avg-icon { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
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

.content-layout {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
  min-width: 0;
}

.calendar-card,
.recent-list-card {
  background: var(--app-card-bg);
  border: 1px solid var(--app-card-border);
  border-radius: 12px;
  padding: 18px;
  box-shadow: none;
  min-width: 0;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 10px;
  flex-wrap: wrap;

  .card-title-group {
    .card-title {
      font-size: 16px;
      font-weight: 700;
      margin: 0;
      color: var(--app-text, #1e293b);
    }
    .card-subtitle {
      font-size: 12px;
      color: var(--app-text-muted, #64748b);
    }
  }

  .month-nav {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .search-input {
    width: 180px;
  }
}

/* Custom Calendar Grid */
.calendar-table-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.calendar-week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--app-text-muted, #64748b);
  padding-bottom: 6px;
}

.calendar-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.cal-cell {
  min-height: 60px;
  background: var(--app-bg, #f8fafc);
  border: 1px solid var(--app-card-border, #e2e8f0);
  border-radius: 8px;
  padding: 6px;
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
    border-color: var(--el-color-primary, #3b82f6);
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
    font-size: 12px;
    font-weight: 600;
    color: var(--app-text, #334155);

    .journal-dot {
      font-size: 11px;
    }
  }

  .cell-content {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 22px;

    .cell-mood {
      font-size: 18px;
      line-height: 1;
    }
  }
}

/* Recent Journals List */
.journals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 520px;
  overflow-y: auto;
  padding-right: 4px;
}

.journal-item-card {
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--app-bg, #f8fafc);
  border: 1px solid var(--app-card-border, #e2e8f0);
  cursor: pointer;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: scale(0.98);
  }

  .item-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .date-str {
      font-size: 11px;
      font-weight: 600;
      color: #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .item-mood-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      .mood-lbl {
        font-size: 11px;
        color: var(--app-text-muted, #64748b);
      }
    }
  }

  .item-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--app-text, #1e293b);
    margin: 0 0 6px 0;
  }

  .item-highlight,
  .item-snippet {
    font-size: 12px;
    color: var(--app-text-muted, #475569);
    margin: 0 0 8px 0;
    line-height: 1.4;
  }

  .item-footer {
    display: flex;
    justify-content: flex-end;
    .read-more {
      font-size: 11px;
      color: #3b82f6;
      font-weight: 600;
    }
  }
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .page-top-bar {
    flex-direction: column;
    align-items: stretch;
    .top-actions {
      display: grid;
      grid-template-columns: 1fr;
      width: 100%;
      .action-btn {
        width: 100%;
        margin: 0;
      }
    }
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .content-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .cal-cell {
    min-height: 48px;
    padding: 4px;
    .cell-top .day-num { font-size: 11px; }
    .cell-content .cell-mood { font-size: 14px; }
  }
}
</style>

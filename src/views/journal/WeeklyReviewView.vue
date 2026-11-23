<template>
  <div class="weekly-review-page">
    <!-- Top Header Bar -->
    <div class="page-top-bar">
      <div class="title-col">
        <div class="title-with-back">
          <router-link to="/journals" class="back-link">
            <el-button circle size="small">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
          </router-link>
          <h1 class="page-title">Tổng kết & Đánh giá Tuần</h1>
          <el-tag
            :type="currentReview?.status === 'COMPLETED' ? 'success' : 'info'"
            round
            effect="dark"
            class="status-tag"
          >
            {{ currentReview?.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Bản nháp (Draft)' }}
          </el-tag>
        </div>
        <p class="page-desc">Dừng lại để nhìn nhận những gì đã làm tốt, rút ra bài học và định hình tuần tiếp theo.</p>
      </div>

      <div class="top-controls">
        <el-button circle size="small" @click="changeWeek(-1)">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="week-label">{{ weekRangeFormatted }}</span>
        <el-button circle size="small" @click="changeWeek(1)">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        <el-button size="small" plain @click="goToCurrentWeek">Tuần này</el-button>
        <el-button size="small" @click="historyDrawerVisible = true">
          <el-icon><Clock /></el-icon>
          Lịch sử
        </el-button>
      </div>
    </div>

    <!-- Weekly Summary KPI Metrics -->
    <div v-loading="loadingSummary" class="stats-row">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Nhật ký trong tuần</span>
          <div class="stat-icon-wrapper journal-icon">
            <el-icon><EditPen /></el-icon>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ weeklySummary?.journalDaysCount ?? 0 }} / 7 <small>ngày</small></span>
          <span class="stat-subtext">Đã ghi lại hoạt động</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Tâm trạng & Năng lượng</span>
          <div class="stat-icon-wrapper mood-icon">
            <span class="emoji-icon">😊</span>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">
            {{ weeklySummary?.averageMood ? weeklySummary.averageMood + ' / 5' : '--' }}
          </span>
          <span class="stat-subtext">
            Năng lượng: {{ weeklySummary?.averageEnergy ? weeklySummary.averageEnergy + ' / 5' : '--' }}
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Công việc hoàn thành</span>
          <div class="stat-icon-wrapper task-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ weeklySummary?.completedTasksCount ?? 0 }} <small>tasks</small></span>
          <span class="stat-subtext">Tổng hạn tuần: {{ weeklySummary?.totalTasksCount ?? 0 }} tasks</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Điểm danh thói quen</span>
          <div class="stat-icon-wrapper habit-icon">
            <el-icon><Timer /></el-icon>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ weeklySummary?.habitCheckinsCount ?? 0 }} <small>lượt</small></span>
          <span class="stat-subtext">Duy trì sự nhất quán</span>
        </div>
      </div>
    </div>

    <!-- Structured Review Form -->
    <div v-loading="loadingReview" class="review-form-card">
      <div class="card-head">
        <div class="head-title">
          <span class="section-icon">📝</span>
          <span class="section-heading">Phiếu đánh giá tuần (Weekly Reflection)</span>
        </div>
        <span v-if="currentReview?.completedAt" class="completed-time-str">
          Hoàn thành lúc: {{ formatCompletedTime(currentReview.completedAt) }}
        </span>
      </div>

      <div class="form-body">
        <!-- 1. Summary -->
        <div class="form-item">
          <label class="form-label">
            <strong>1. Tổng kết tuần (Weekly Summary)</strong>
            <span class="hint">Tuần vừa qua của bạn nhìn chung diễn ra như thế nào?</span>
          </label>
          <el-input
            v-model="reviewForm.summary"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 8 }"
            placeholder="Tóm tắt ngắn gọn các sự kiện chính và cảm nhận chung về tuần vừa qua..."
          />
        </div>

        <!-- 2. Wins & Challenges 2 cols -->
        <div class="form-row-2">
          <div class="form-item">
            <label class="form-label">
              <strong>⭐ Điểm sáng & Chiến thắng (Wins)</strong>
              <span class="hint">Những điều bạn đã hoàn thành tốt hoặc tự hào nhất?</span>
            </label>
            <el-input
              v-model="reviewForm.wins"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 8 }"
              placeholder="VD: Đã hoàn thành dự án trước hạn, chạy bộ được 3 buổi..."
            />
          </div>

          <div class="form-item">
            <label class="form-label">
              <strong>🧗 Thách thức & Khó khăn (Challenges)</strong>
              <span class="hint">Điều gì làm bạn mất tập trung hoặc chưa hài lòng?</span>
            </label>
            <el-input
              v-model="reviewForm.challenges"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 8 }"
              placeholder="VD: Chưa ngủ sớm như dự kiến, bị phân tâm bởi điện thoại..."
            />
          </div>
        </div>

        <!-- 3. Lessons & Improvements 2 cols -->
        <div class="form-row-2">
          <div class="form-item">
            <label class="form-label">
              <strong>💡 Bài học kinh nghiệm (Lessons Learned)</strong>
              <span class="hint">Bạn học được điều gì mới về bản thân hoặc công việc?</span>
            </label>
            <el-input
              v-model="reviewForm.lessonsLearned"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 8 }"
              placeholder="Bài học hoặc nhận thức sâu sắc rút ra từ những trải nghiệm trong tuần..."
            />
          </div>

          <div class="form-item">
            <label class="form-label">
              <strong>🎯 Điểm cần cải thiện (Improvements)</strong>
              <span class="hint">Nên bắt đầu điều gì? Nên dừng lại điều gì? Nên tiếp tục điều gì?</span>
            </label>
            <el-input
              v-model="reviewForm.improvements"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 8 }"
              placeholder="Những thay đổi cụ thể để tuần tới tốt hơn..."
            />
          </div>
        </div>

        <!-- 4. Next Week Priorities -->
        <div class="form-item">
          <label class="form-label">
            <strong>🚀 3 Ưu tiên hàng đầu cho tuần tới (Next Week Priorities)</strong>
            <span class="hint">Điều gì quan trọng nhất cần phải hoàn thành trong 7 ngày tới?</span>
          </label>
          <el-input
            v-model="reviewForm.nextWeekPriorities"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 8 }"
            placeholder="1. Mục tiêu trọng tâm 1&#10;2. Mục tiêu trọng tâm 2&#10;3. Mục tiêu trọng tâm 3"
          />
        </div>

        <!-- 5. Additional Notes -->
        <div class="form-item">
          <label class="form-label">
            <strong>Ghi chú thêm (Additional Notes)</strong>
          </label>
          <el-input
            v-model="reviewForm.additionalNotes"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 6 }"
            placeholder="Lời nhắn nhủ cho bản thân, lời nhắc nhở..."
          />
        </div>
      </div>

      <!-- Action Footer -->
      <div class="form-actions-footer">
        <div class="footer-left">
          <el-popconfirm
            v-if="currentReview?.id"
            title="Bạn có chắc muốn xóa bản review tuần này không?"
            confirm-button-text="Xóa"
            cancel-button-text="Hủy"
            confirm-button-type="danger"
            @confirm="deleteReview"
          >
            <template #reference>
              <el-button type="danger" plain round :loading="saving">
                Xóa review
              </el-button>
            </template>
          </el-popconfirm>
        </div>

        <div class="footer-right">
          <el-button round :loading="saving" @click="saveReview('DRAFT')">
            Lưu nháp
          </el-button>
          <el-button
            type="success"
            round
            :icon="Check"
            :loading="saving"
            @click="saveReview('COMPLETED')"
          >
            Hoàn thành Review
          </el-button>
        </div>
      </div>
    </div>

    <!-- History Drawer -->
    <el-drawer
      v-model="historyDrawerVisible"
      title="Lịch sử các tuần đã review"
      direction="rtl"
      size="360px"
    >
      <div v-loading="loadingHistory" class="history-list">
        <div v-if="historyList.length === 0" class="empty-history">
          <el-empty description="Chưa có bản review nào trong lịch sử" />
        </div>
        <div
          v-for="item in historyList"
          :key="item.id"
          class="history-item-card"
          :class="{ active: item.weekStartDate === selectedMondayStr }"
          @click="selectHistoryWeek(item.weekStartDate)"
        >
          <div class="hist-head">
            <span class="hist-dates">{{ formatWeekRange(item.weekStartDate, item.weekEndDate) }}</span>
            <el-tag size="small" :type="item.status === 'COMPLETED' ? 'success' : 'info'" round>
              {{ item.status === 'COMPLETED' ? 'Đã xong' : 'Nháp' }}
            </el-tag>
          </div>
          <p v-if="item.summary" class="hist-summary">{{ truncateText(item.summary, 70) }}</p>
          <p v-else class="hist-summary empty-sum">Chưa có tóm tắt</p>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  EditPen,
  CircleCheck,
  Timer,
  Clock,
  Check
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { reviewApi } from '@/api/reviewApi'
import type { WeeklyReview, WeeklyReviewRequest, WeeklySummary } from '@/types/review'

// Current Week State (always points to Monday)
const selectedMondayStr = ref(getCurrentMondayIso())

const currentReview = ref<WeeklyReview | null>(null)
const weeklySummary = ref<WeeklySummary | null>(null)
const historyList = ref<WeeklyReview[]>([])

const loadingReview = ref(false)
const loadingSummary = ref(false)
const loadingHistory = ref(false)
const saving = ref(false)
const historyDrawerVisible = ref(false)

const reviewForm = reactive<WeeklyReviewRequest>({
  weekStartDate: selectedMondayStr.value,
  summary: '',
  wins: '',
  challenges: '',
  lessonsLearned: '',
  improvements: '',
  nextWeekPriorities: '',
  additionalNotes: '',
  status: 'DRAFT'
})

const weekRangeFormatted = computed(() => {
  if (!selectedMondayStr.value) return ''
  const m = new Date(selectedMondayStr.value)
  const s = new Date(selectedMondayStr.value)
  s.setDate(s.getDate() + 6)
  return `${m.getDate()}/${m.getMonth() + 1} - ${s.getDate()}/${s.getMonth() + 1}/${s.getFullYear()}`
})

function getCurrentMondayIso(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  const monday = new Date(d.setDate(diff))
  const y = monday.getFullYear()
  const m = String(monday.getMonth() + 1).padStart(2, '0')
  const dt = String(monday.getDate()).padStart(2, '0')
  return `${y}-${m}-${dt}`
}

function formatWeekRange(start: string, end: string): string {
  try {
    const [, m1, d1] = start.split('-')
    const [y2, m2, d2] = end.split('-')
    return `${d1}/${m1} - ${d2}/${m2}/${y2}`
  } catch {
    return `${start} - ${end}`
  }
}

function formatCompletedTime(timeStr?: string | null): string {
  if (!timeStr) return ''
  try {
    const d = new Date(timeStr)
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} ngày ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
  } catch {
    return timeStr
  }
}

function truncateText(txt: string, len: number): string {
  if (!txt) return ''
  return txt.length > len ? txt.substring(0, len) + '...' : txt
}

function changeWeek(delta: number) {
  const d = new Date(selectedMondayStr.value)
  d.setDate(d.getDate() + delta * 7)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dt = String(d.getDate()).padStart(2, '0')
  selectedMondayStr.value = `${y}-${m}-${dt}`
  reviewForm.weekStartDate = selectedMondayStr.value
  loadWeekData()
}

function goToCurrentWeek() {
  selectedMondayStr.value = getCurrentMondayIso()
  reviewForm.weekStartDate = selectedMondayStr.value
  loadWeekData()
}

function selectHistoryWeek(mondayStr: string) {
  selectedMondayStr.value = mondayStr
  reviewForm.weekStartDate = mondayStr
  historyDrawerVisible.value = false
  loadWeekData()
}

async function loadWeekData() {
  loadingReview.value = true
  loadingSummary.value = true

  try {
    const [revRes, sumRes] = await Promise.all([
      reviewApi.getReviewByWeek(selectedMondayStr.value),
      reviewApi.getWeeklySummary(selectedMondayStr.value)
    ])

    currentReview.value = revRes
    weeklySummary.value = sumRes

    if (revRes) {
      reviewForm.summary = revRes.summary || ''
      reviewForm.wins = revRes.wins || ''
      reviewForm.challenges = revRes.challenges || ''
      reviewForm.lessonsLearned = revRes.lessonsLearned || ''
      reviewForm.improvements = revRes.improvements || ''
      reviewForm.nextWeekPriorities = revRes.nextWeekPriorities || ''
      reviewForm.additionalNotes = revRes.additionalNotes || ''
      reviewForm.status = revRes.status || 'DRAFT'
    } else {
      reviewForm.summary = ''
      reviewForm.wins = ''
      reviewForm.challenges = ''
      reviewForm.lessonsLearned = ''
      reviewForm.improvements = ''
      reviewForm.nextWeekPriorities = ''
      reviewForm.additionalNotes = ''
      reviewForm.status = 'DRAFT'
    }
  } catch (err) {
    console.error('Failed to load review data', err)
  } finally {
    loadingReview.value = false
    loadingSummary.value = false
  }
}

async function loadHistory() {
  loadingHistory.value = true
  try {
    const res = await reviewApi.getReviews({ page: 0, size: 20 })
    historyList.value = res.content || []
  } catch (err) {
    console.error('Failed to load review history', err)
  } finally {
    loadingHistory.value = false
  }
}

async function saveReview(targetStatus: 'DRAFT' | 'COMPLETED') {
  saving.value = true
  try {
    reviewForm.status = targetStatus
    const res = await reviewApi.saveReview({
      weekStartDate: selectedMondayStr.value,
      summary: reviewForm.summary,
      wins: reviewForm.wins,
      challenges: reviewForm.challenges,
      lessonsLearned: reviewForm.lessonsLearned,
      improvements: reviewForm.improvements,
      nextWeekPriorities: reviewForm.nextWeekPriorities,
      additionalNotes: reviewForm.additionalNotes,
      status: targetStatus
    })

    currentReview.value = res
    ElMessage.success(targetStatus === 'COMPLETED' ? 'Đã hoàn thành đánh giá tuần!' : 'Đã lưu bản nháp thành công!')
    loadHistory()
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || 'Có lỗi khi lưu review')
  } finally {
    saving.value = false
  }
}

async function deleteReview() {
  if (!currentReview.value?.id) return
  saving.value = true
  try {
    await reviewApi.deleteReview(currentReview.value.id)
    currentReview.value = null
    reviewForm.summary = ''
    reviewForm.wins = ''
    reviewForm.challenges = ''
    reviewForm.lessonsLearned = ''
    reviewForm.improvements = ''
    reviewForm.nextWeekPriorities = ''
    reviewForm.additionalNotes = ''
    reviewForm.status = 'DRAFT'
    ElMessage.success('Đã xóa review tuần thành công')
    loadHistory()
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || 'Có lỗi khi xóa review')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadWeekData()
  loadHistory()
})
</script>

<style scoped lang="scss">
.weekly-review-page {
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
      .status-tag {
        font-size: 11px;
      }
    }
    .page-desc {
      font-size: 13px;
      color: var(--app-text-muted, #64748b);
      margin: 0;
    }
  }

  .top-controls {
    display: flex;
    align-items: center;
    gap: 8px;

    .week-label {
      font-size: 14px;
      font-weight: 700;
      color: var(--app-text, #1e293b);
      min-width: 130px;
      text-align: center;
    }
  }
}

/* Stats Row */
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

      &.journal-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
      &.mood-icon { background: rgba(245, 158, 11, 0.1); }
      &.task-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
      &.habit-icon { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
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

/* Review Form */
.review-form-card {
  background: var(--app-card-bg, #ffffff);
  border: 1px solid var(--app-card-border, #e2e8f0);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--app-card-border, #e2e8f0);
    flex-wrap: wrap;
    gap: 8px;

    .head-title {
      display: flex;
      align-items: center;
      gap: 8px;
      .section-icon { font-size: 20px; }
      .section-heading {
        font-size: 16px;
        font-weight: 700;
        color: var(--app-text, #1e293b);
      }
    }

    .completed-time-str {
      font-size: 12px;
      color: #10b981;
      font-weight: 600;
    }
  }

  .form-body {
    display: flex;
    flex-direction: column;
    gap: 18px;

    .form-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .form-label {
        font-size: 13px;
        color: var(--app-text, #334155);
        display: flex;
        flex-direction: column;
        gap: 2px;

        .hint {
          font-size: 12px;
          color: var(--app-text-muted, #64748b);
          font-weight: normal;
        }
      }
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
  }

  .form-actions-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--app-card-border, #e2e8f0);
    flex-wrap: wrap;
    gap: 10px;

    .footer-right {
      display: flex;
      gap: 10px;
    }
  }
}

/* History List */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item-card {
  padding: 12px;
  background: var(--app-bg, #f8fafc);
  border: 1px solid var(--app-card-border, #e2e8f0);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #3b82f6;
  }

  &.active {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.08);
  }

  .hist-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .hist-dates {
      font-size: 13px;
      font-weight: 700;
      color: var(--app-text, #1e293b);
    }
  }

  .hist-summary {
    font-size: 12px;
    color: var(--app-text-muted, #475569);
    margin: 0;
    line-height: 1.4;

    &.empty-sum {
      font-style: italic;
      color: var(--app-text-muted, #94a3b8);
    }
  }
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .page-top-bar {
    flex-direction: column;
    align-items: stretch;
    .top-controls {
      justify-content: space-between;
      width: 100%;
      .week-label {
        font-size: 12px;
        min-width: unset;
      }
    }
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .review-form-card {
    padding: 14px;
    .form-body .form-row-2 {
      grid-template-columns: 1fr;
    }

    .form-actions-footer {
      flex-direction: column-reverse;
      width: 100%;
      .footer-left,
      .footer-right {
        width: 100%;
        display: flex;
        justify-content: stretch;
        button {
          flex: 1;
        }
      }
    }
  }
}
</style>

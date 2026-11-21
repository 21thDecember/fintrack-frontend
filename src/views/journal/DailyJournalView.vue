<template>
  <div class="daily-journal-page">
    <!-- Top Date Navigation Bar -->
    <div class="date-nav-bar">
      <div class="nav-left">
        <router-link to="/journals" class="back-link">
          <el-button circle size="small">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </router-link>
        <div class="date-info">
          <h1 class="page-title">Nhật ký ngày</h1>
          <span class="day-of-week">{{ dayOfWeekText }}</span>
        </div>
      </div>

      <div class="date-picker-wrap">
        <el-button circle size="small" @click="changeDay(-1)">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <el-date-picker
          v-model="selectedDateStr"
          type="date"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
          :clearable="false"
          size="default"
          class="journal-date-picker"
          @change="onDateChanged"
        />
        <el-button circle size="small" @click="changeDay(1)">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        <el-button size="small" plain @click="goToToday">Hôm nay</el-button>
      </div>
    </div>

    <!-- Main Container -->
    <div v-loading="loading" class="journal-editor-container">
      <!-- Section 1: Mood & Energy Tracker -->
      <div class="section-card mood-card">
        <div class="section-head">
          <div class="head-title">
            <span class="section-icon">✨</span>
            <span class="section-heading">Tâm trạng & Năng lượng hôm nay</span>
          </div>
          <span v-if="moodSavedNotice" class="saved-tag">Đã lưu cảm xúc</span>
        </div>

        <div class="mood-selector-group">
          <span class="sub-label">Tâm trạng của bạn thế nào?</span>
          <div class="mood-buttons-grid">
            <button
              v-for="(cfg, score) in MOOD_CONFIG"
              :key="score"
              type="button"
              class="mood-btn"
              :class="{ 'is-selected': currentMoodScore === Number(score) }"
              @click="selectMood(Number(score))"
            >
              <span class="mood-emoji">{{ cfg.emoji }}</span>
              <span class="mood-label">{{ cfg.label }}</span>
            </button>
          </div>
        </div>

        <div class="energy-selector-group">
          <span class="sub-label">Mức năng lượng:</span>
          <div class="energy-buttons-grid">
            <button
              v-for="(cfg, lvl) in ENERGY_CONFIG"
              :key="lvl"
              type="button"
              class="energy-btn"
              :class="{ 'is-selected': currentEnergyScore === Number(lvl) }"
              @click="selectEnergy(Number(lvl))"
            >
              <span class="energy-icon">{{ cfg.icon }}</span>
              <span class="energy-label">{{ cfg.label }}</span>
            </button>
          </div>
        </div>

        <div class="mood-note-group">
          <el-input
            v-model="moodNote"
            placeholder="Ghi chú thêm về cảm xúc hôm nay (tùy chọn)..."
            size="small"
            clearable
          />
        </div>
      </div>

      <!-- Section 2: Main Daily Reflection & Journal -->
      <div class="section-card journal-form-card">
        <div class="section-head">
          <div class="head-title">
            <span class="section-icon">📖</span>
            <span class="section-heading">Nội dung nhật ký</span>
          </div>
          <span v-if="journalSaved" class="saved-tag">Đã lưu nhật ký</span>
        </div>

        <div class="form-body">
          <div class="form-item">
            <label class="form-label">Tiêu đề (Tùy chọn)</label>
            <el-input
              v-model="journalForm.title"
              placeholder="VD: Một ngày hiệu quả với những bước tiến mới..."
              size="large"
            />
          </div>

          <div class="form-item">
            <label class="form-label">Nội dung chi tiết</label>
            <el-input
              v-model="journalForm.content"
              type="textarea"
              :rows="6"
              placeholder="Hôm nay của bạn diễn ra như thế nào? Bạn đã gặp gỡ ai, học được gì hay có điều gì muốn ghi lại?..."
            />
          </div>

          <!-- Structured Reflection Prompts -->
          <div class="reflection-prompts-grid">
            <div class="form-item prompt-item">
              <label class="form-label">⭐ Điểm sáng trong ngày (Highlight)</label>
              <el-input
                v-model="journalForm.highlight"
                type="textarea"
                :rows="2"
                placeholder="Điều tuyệt vời nhất hoặc đáng nhớ nhất hôm nay..."
              />
            </div>

            <div class="form-item prompt-item">
              <label class="form-label">🙏 Lòng biết ơn (Gratitude)</label>
              <el-input
                v-model="journalForm.gratitude"
                type="textarea"
                :rows="2"
                placeholder="Những điều bạn cảm thấy biết ơn trong ngày hôm nay..."
              />
            </div>

            <div class="form-item prompt-item">
              <label class="form-label">🎯 Điều muốn cải thiện (Improvement)</label>
              <el-input
                v-model="journalForm.improvement"
                type="textarea"
                :rows="2"
                placeholder="Điều gì bạn có thể làm tốt hơn nếu được làm lại?..."
              />
            </div>

            <div class="form-item prompt-item">
              <label class="form-label">🚀 Kế hoạch ngày mai (Tomorrow Plan)</label>
              <el-input
                v-model="journalForm.tomorrowPlan"
                type="textarea"
                :rows="2"
                placeholder="Việc ưu tiên quan trọng nhất bạn muốn hoàn thành vào ngày mai..."
              />
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="form-actions-footer">
          <div class="footer-left">
            <el-popconfirm
              v-if="existingJournalId"
              title="Bạn có chắc muốn xóa nhật ký ngày này không?"
              confirm-button-text="Xóa"
              cancel-button-text="Hủy"
              confirm-button-type="danger"
              @confirm="deleteCurrentJournal"
            >
              <template #reference>
                <el-button type="danger" plain round :loading="saving">
                  Xóa bài viết
                </el-button>
              </template>
            </el-popconfirm>
          </div>

          <div class="footer-right">
            <router-link to="/journals">
              <el-button round>Quay lại</el-button>
            </router-link>
            <el-button
              type="primary"
              round
              :icon="Check"
              :loading="saving"
              @click="saveAll"
            >
              Lưu nhật ký & Tâm trạng
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { journalApi } from '@/api/journalApi'
import { moodApi } from '@/api/moodApi'
import type { DailyJournalRequest } from '@/types/journal'
import { MOOD_CONFIG, ENERGY_CONFIG } from '@/types/mood'

const route = useRoute()
const router = useRouter()

// Date state
const selectedDateStr = ref(getTodayIso())

// Mood state
const currentMoodScore = ref<number | null>(null)
const currentEnergyScore = ref<number | null>(null)
const moodNote = ref('')
const moodSavedNotice = ref(false)

// Journal state
const existingJournalId = ref<string | null>(null)
const journalSaved = ref(false)
const loading = ref(false)
const saving = ref(false)

const journalForm = reactive<DailyJournalRequest>({
  journalDate: selectedDateStr.value,
  title: '',
  content: '',
  highlight: '',
  gratitude: '',
  improvement: '',
  tomorrowPlan: ''
})

const dayOfWeekText = computed(() => {
  if (!selectedDateStr.value) return ''
  const d = new Date(selectedDateStr.value)
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  return days[d.getDay()]
})

function getTodayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dt = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dt}`
}

function changeDay(delta: number) {
  const d = new Date(selectedDateStr.value)
  d.setDate(d.getDate() + delta)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dt = String(d.getDate()).padStart(2, '0')
  selectedDateStr.value = `${y}-${m}-${dt}`
  onDateChanged()
}

function goToToday() {
  selectedDateStr.value = getTodayIso()
  onDateChanged()
}

function onDateChanged() {
  journalForm.journalDate = selectedDateStr.value
  router.replace({ query: { date: selectedDateStr.value } })
  loadDataForDate(selectedDateStr.value)
}

function selectMood(score: number) {
  currentMoodScore.value = score
}

function selectEnergy(level: number) {
  if (currentEnergyScore.value === level) {
    currentEnergyScore.value = null
  } else {
    currentEnergyScore.value = level
  }
}

async function loadDataForDate(dateStr: string) {
  loading.value = true
  existingJournalId.value = null
  journalSaved.value = false
  moodSavedNotice.value = false

  try {
    const [journalRes, moodRes] = await Promise.all([
      journalApi.getJournalByDate(dateStr),
      moodApi.getMoodByDate(dateStr)
    ])

    if (journalRes) {
      existingJournalId.value = journalRes.id
      journalForm.title = journalRes.title || ''
      journalForm.content = journalRes.content || ''
      journalForm.highlight = journalRes.highlight || ''
      journalForm.gratitude = journalRes.gratitude || ''
      journalForm.improvement = journalRes.improvement || ''
      journalForm.tomorrowPlan = journalRes.tomorrowPlan || ''
    } else {
      journalForm.title = ''
      journalForm.content = ''
      journalForm.highlight = ''
      journalForm.gratitude = ''
      journalForm.improvement = ''
      journalForm.tomorrowPlan = ''
    }

    if (moodRes) {
      currentMoodScore.value = moodRes.moodScore
      currentEnergyScore.value = moodRes.energyScore ?? null
      moodNote.value = moodRes.note || ''
    } else if (journalRes?.moodScore) {
      currentMoodScore.value = journalRes.moodScore
      currentEnergyScore.value = journalRes.energyScore ?? null
      moodNote.value = journalRes.moodNote || ''
    } else {
      currentMoodScore.value = null
      currentEnergyScore.value = null
      moodNote.value = ''
    }
  } catch (err) {
    console.error('Failed to load journal or mood for date', err)
  } finally {
    loading.value = false
  }
}

async function saveAll() {
  saving.value = true
  try {
    // 1. Save Mood if selected
    if (currentMoodScore.value) {
      await moodApi.saveMood({
        recordedDate: selectedDateStr.value,
        moodScore: currentMoodScore.value,
        energyScore: currentEnergyScore.value,
        note: moodNote.value
      })
      moodSavedNotice.value = true
    }

    // 2. Save Journal
    const journalRes = await journalApi.saveJournal({
      journalDate: selectedDateStr.value,
      title: journalForm.title,
      content: journalForm.content,
      highlight: journalForm.highlight,
      gratitude: journalForm.gratitude,
      improvement: journalForm.improvement,
      tomorrowPlan: journalForm.tomorrowPlan
    })

    existingJournalId.value = journalRes.id
    journalSaved.value = true
    ElMessage.success('Đã lưu nhật ký và tâm trạng thành công!')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || 'Có lỗi khi lưu nhật ký')
  } finally {
    saving.value = false
  }
}

async function deleteCurrentJournal() {
  if (!existingJournalId.value) return
  saving.value = true
  try {
    await journalApi.deleteJournal(existingJournalId.value)
    existingJournalId.value = null
    journalForm.title = ''
    journalForm.content = ''
    journalForm.highlight = ''
    journalForm.gratitude = ''
    journalForm.improvement = ''
    journalForm.tomorrowPlan = ''
    journalSaved.value = false
    ElMessage.success('Đã xóa nhật ký thành công')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || 'Có lỗi khi xóa nhật ký')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const qDate = route.query.date as string
  if (qDate) {
    selectedDateStr.value = qDate
  }
  journalForm.journalDate = selectedDateStr.value
  loadDataForDate(selectedDateStr.value)
})

watch(() => route.query.date, (newDate) => {
  if (newDate && typeof newDate === 'string' && newDate !== selectedDateStr.value) {
    selectedDateStr.value = newDate
    onDateChanged()
  }
})
</script>

<style scoped lang="scss">
.daily-journal-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.date-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--app-card-bg, #ffffff);
  border: 1px solid var(--app-card-border, #e2e8f0);
  border-radius: 14px;
  padding: 12px 18px;
  flex-wrap: wrap;
  gap: 12px;

  .nav-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .date-info {
      .page-title {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
        color: var(--app-text, #1e293b);
      }
      .day-of-week {
        font-size: 13px;
        color: var(--app-text-muted, #64748b);
      }
    }
  }

  .date-picker-wrap {
    display: flex;
    align-items: center;
    gap: 8px;

    .journal-date-picker {
      width: 150px;
    }
  }
}

.journal-editor-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-card {
  background: var(--app-card-bg, #ffffff);
  border: 1px solid var(--app-card-border, #e2e8f0);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);

  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;

    .head-title {
      display: flex;
      align-items: center;
      gap: 8px;
      .section-icon { font-size: 18px; }
      .section-heading {
        font-size: 16px;
        font-weight: 700;
        color: var(--app-text, #1e293b);
      }
    }

    .saved-tag {
      font-size: 11px;
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 600;
    }
  }
}

/* Mood & Energy Styles */
.mood-card {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .sub-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--app-text-muted, #475569);
    margin-bottom: 8px;
    display: block;
  }

  .mood-buttons-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;

    .mood-btn {
      background: var(--app-bg, #f8fafc);
      border: 1px solid var(--app-card-border, #e2e8f0);
      border-radius: 10px;
      padding: 10px 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.15s ease;

      .mood-emoji {
        font-size: 26px;
        line-height: 1;
      }
      .mood-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--app-text, #334155);
      }

      &:hover {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.04);
      }

      &.is-selected {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.1);
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        .mood-label {
          color: #3b82f6;
          font-weight: 700;
        }
      }
    }
  }

  .energy-buttons-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;

    .energy-btn {
      background: var(--app-bg, #f8fafc);
      border: 1px solid var(--app-card-border, #e2e8f0);
      border-radius: 8px;
      padding: 8px 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      transition: all 0.15s ease;

      .energy-icon { font-size: 16px; }
      .energy-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--app-text, #475569);
      }

      &:hover {
        border-color: #f59e0b;
      }

      &.is-selected {
        border-color: #f59e0b;
        background: rgba(245, 158, 11, 0.12);
        .energy-label {
          color: #d97706;
          font-weight: 700;
        }
      }
    }
  }
}

/* Journal Form Styles */
.journal-form-card {
  .form-body {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .form-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .form-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--app-text, #334155);
      }
    }

    .reflection-prompts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-top: 6px;
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

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .date-nav-bar {
    flex-direction: column;
    align-items: stretch;
    .date-picker-wrap {
      justify-content: space-between;
      width: 100%;
      .journal-date-picker {
        flex: 1;
      }
    }
  }

  .mood-card {
    .mood-buttons-grid {
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      .mood-btn {
        padding: 8px 2px;
        .mood-emoji { font-size: 20px; }
        .mood-label { font-size: 10px; text-align: center; }
      }
    }

    .energy-buttons-grid {
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
      .energy-btn {
        padding: 6px 2px;
        .energy-label { font-size: 10px; }
      }
    }
  }

  .journal-form-card {
    .form-body .reflection-prompts-grid {
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

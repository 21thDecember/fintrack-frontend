<template>
  <div class="habits-page">
    <!-- Header Section -->
    <div class="page-top-bar">
      <div class="title-group">
        <h1 class="page-title">
          Theo dõi Thói quen
          <span class="lifeos-pill">LifeOS</span>
        </h1>
        <p class="page-subtitle">
          Xây dựng thói quen tốt, duy trì chuỗi streak và theo dõi sự nhất quán mỗi ngày
        </p>
      </div>

      <div class="action-group">
        <el-button type="primary" :icon="Plus" @click="openCreateModal()">
          Tạo thói quen
        </el-button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-top">
          <span class="stat-label">Tổng thói quen</span>
          <div class="stat-icon-wrap blue">
            <el-icon><Compass /></el-icon>
          </div>
        </div>
        <div class="stat-main">
          <span class="stat-num">{{ habitStore.statistics?.totalHabits || 0 }}</span>
          <span class="stat-unit">thói quen</span>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-top">
          <span class="stat-label">Hôm nay cần làm</span>
          <div class="stat-icon-wrap amber">
            <el-icon><Calendar /></el-icon>
          </div>
        </div>
        <div class="stat-main">
          <span class="stat-num amber">{{ habitStore.statistics?.todayScheduledCount || 0 }}</span>
          <span class="stat-unit">mục trong lịch</span>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-top">
          <span class="stat-label">Hoàn thành hôm nay</span>
          <div class="stat-icon-wrap green">
            <el-icon><CircleCheckFilled /></el-icon>
          </div>
        </div>
        <div class="stat-main">
          <span class="stat-num green">{{ habitStore.statistics?.completedTodayCount || 0 }}</span>
          <span class="stat-unit">/ {{ habitStore.statistics?.todayScheduledCount || 0 }} mục</span>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-top">
          <span class="stat-label">Tỷ lệ nhất quán</span>
          <div class="stat-icon-wrap purple">
            <el-icon><Trophy /></el-icon>
          </div>
        </div>
        <div class="stat-main">
          <span class="stat-num purple">{{ habitStore.statistics?.overallCompletionRate || 0 }}%</span>
          <span class="stat-unit">tổng thể</span>
        </div>
      </div>
    </div>

    <!-- Section 1: Today's Habits (Quick Check-in) -->
    <div class="section-block">
      <div class="section-header">
        <h2 class="section-title">
          <span>🎯 Thói quen hôm nay</span>
          <span class="section-badge">({{ habitStore.todayHabits.length }} thói quen)</span>
        </h2>
      </div>

      <div v-if="habitStore.todayHabits.length === 0" class="empty-today-box">
        <div class="empty-icon">🌿</div>
        <p class="empty-text">Không có thói quen nào cần thực hiện hôm nay.</p>
        <p class="empty-sub">Hãy tạo thói quen mới hoặc điều chỉnh lịch ngày hoạt động trong tuần.</p>
      </div>

      <div v-else class="today-grid">
        <div
          v-for="th in habitStore.todayHabits"
          :key="th.id"
          class="today-habit-card"
          :class="{ completed: th.isCompletedToday }"
        >
          <div class="today-card-info">
            <span class="habit-name" :class="{ strike: th.isCompletedToday }">
              {{ th.name }}
            </span>

            <div class="habit-sub-row">
              <span class="streak-badge">
                🔥 {{ th.currentStreak }} ngày streak
              </span>
              <span class="dot">•</span>
              <span class="count-text">{{ th.todayCount }}/{{ th.targetCount }} lần</span>
            </div>
          </div>

          <!-- 1-Click Checkin Button -->
          <button
            class="checkin-btn"
            :class="{ done: th.isCompletedToday }"
            :title="th.isCompletedToday ? 'Đã hoàn thành hôm nay' : 'Nhấn để điểm danh'"
            @click="handleQuickCheckin(th.id)"
          >
            <el-icon v-if="th.isCompletedToday"><Check /></el-icon>
            <span v-else>+1</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Section 2: All Habits Management -->
    <div class="section-block">
      <div class="section-header">
        <h2 class="section-title">
          <span>📋 Tất cả thói quen & Lịch sử</span>
        </h2>
      </div>

      <div class="all-habits-list">
        <div
          v-for="habit in habitStore.habits"
          :key="habit.id"
          class="habit-row-item"
        >
          <div class="habit-row-left">
            <div class="habit-title-line">
              <span class="habit-title-text">{{ habit.name }}</span>
              <span class="freq-tag" :class="habit.frequency.toLowerCase()">
                {{ habit.frequency === 'DAILY' ? 'Hàng ngày' : 'Hàng tuần' }}
              </span>
              <span v-if="!habit.isActive" class="freq-tag paused">
                Tạm dừng
              </span>
            </div>

            <p v-if="habit.description" class="habit-desc-text">
              {{ habit.description }}
            </p>

            <!-- Weekday badges -->
            <div class="weekdays-strip">
              <span
                v-for="day in weekDays"
                :key="day.key"
                class="day-chip"
                :class="{ active: habit.activeDays?.includes(day.key) }"
              >
                {{ day.short }}
              </span>
            </div>
          </div>

          <!-- Streak & Progress -->
          <div class="habit-row-center">
            <div class="metric-mini">
              <strong class="num amber">🔥 {{ habit.currentStreak }}</strong>
              <span class="lbl">Streak hiện tại</span>
            </div>

            <div class="metric-mini">
              <strong class="num">🏆 {{ habit.longestStreak }}</strong>
              <span class="lbl">Kỷ lục streak</span>
            </div>

            <div class="metric-mini">
              <strong class="num green">{{ habit.completionRate }}%</strong>
              <span class="lbl">Tỷ lệ xong</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="habit-row-actions">
            <el-button size="small" plain @click="openHistoryModal(habit)">
              Lịch sử ({{ habit.totalCompletedDays }})
            </el-button>

            <el-button circle size="small" text title="Sửa" @click="openEditModal(habit)">
              <el-icon><Edit /></el-icon>
            </el-button>

            <el-popconfirm
              title="Bạn có chắc chắn muốn xóa thói quen này?"
              confirm-button-text="Xóa"
              cancel-button-text="Hủy"
              confirm-button-type="danger"
              @confirm="habitStore.deleteHabit(habit.id)"
            >
              <template #reference>
                <el-button circle size="small" text type="danger" title="Xóa">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Habit Modal -->
    <el-dialog
      v-model="isModalOpen"
      :title="isEditMode ? 'Chỉnh sửa Thói quen' : 'Tạo Thói quen mới'"
      width="540px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top">
        <el-form-item label="Tên thói quen" prop="name">
          <el-input v-model="formData.name" placeholder="Ví dụ: Đọc sách 30 phút, Chạy bộ, Học Tiếng Anh..." />
        </el-form-item>

        <el-form-item label="Mô tả" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="Ghi chú chi tiết mục tiêu..." />
        </el-form-item>

        <div class="form-row-2">
          <el-form-item label="Tần suất" prop="frequency">
            <el-select v-model="formData.frequency" style="width: 100%;">
              <el-option label="Hàng ngày (DAILY)" value="DAILY" />
              <el-option label="Hàng tuần (WEEKLY)" value="WEEKLY" />
            </el-select>
          </el-form-item>

          <el-form-item label="Mục tiêu số lần / ngày" prop="targetCount">
            <el-input-number v-model="formData.targetCount" :min="1" :max="20" style="width: 100%;" />
          </el-form-item>
        </div>

        <el-form-item label="Các ngày thực hiện trong tuần">
          <div class="weekday-buttons">
            <el-checkbox-button
              v-for="d in weekDays"
              :key="d.key"
              :value="d.key"
              :checked="formData.activeDays?.includes(d.key)"
              @change="(val: any) => toggleDay(d.key, !!val)"
            >
              {{ d.label }}
            </el-checkbox-button>
          </div>
        </el-form-item>

        <div class="form-row-2">
          <el-form-item label="Ngày bắt đầu" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              placeholder="Chọn ngày bắt đầu"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%;"
            />
          </el-form-item>

          <el-form-item label="Ngày kết thúc (tùy chọn)" prop="endDate">
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              placeholder="Vô thời hạn nếu để trống"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%;"
            />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isModalOpen = false">Hủy</el-button>
          <el-button type="primary" :loading="isSaving" @click="handleSaveHabit">
            {{ isEditMode ? 'Lưu thay đổi' : 'Tạo thói quen' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- History / Check-in Details Modal -->
    <el-dialog
      v-model="isHistoryOpen"
      :title="'Lịch sử điểm danh: ' + (selectedHabit?.name || '')"
      width="500px"
      destroy-on-close
    >
      <div class="history-list-box">
        <div v-if="!selectedHabit?.recentCheckins || selectedHabit.recentCheckins.length === 0" class="history-empty">
          Chưa có lượt điểm danh nào.
        </div>
        <div
          v-for="c in selectedHabit?.recentCheckins"
          :key="c.id"
          class="history-row"
        >
          <div class="history-left">
            <span class="history-icon">✓</span>
            <div>
              <div class="history-date">
                Ngày {{ c.completionDate }} ({{ c.count }} lần)
              </div>
              <div v-if="c.note" class="history-note">{{ c.note }}</div>
            </div>
          </div>

          <el-popconfirm
            title="Hủy điểm danh ngày này?"
            confirm-button-text="Hủy ngày này"
            cancel-button-text="Đóng"
            @confirm="handleRemoveCheckin(selectedHabit!.id, c.completionDate)"
          >
            <template #reference>
              <el-button circle size="small" text type="danger">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  Plus,
  Compass,
  Calendar,
  CircleCheckFilled,
  Trophy,
  Check,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { useHabitStore } from '@/stores/habit'
import type { Habit, HabitRequest } from '@/types/habit'
import type { FormInstance, FormRules } from 'element-plus'

const habitStore = useHabitStore()

const weekDays = [
  { key: 'MONDAY', label: 'T2', short: '2' },
  { key: 'TUESDAY', label: 'T3', short: '3' },
  { key: 'WEDNESDAY', label: 'T4', short: '4' },
  { key: 'THURSDAY', label: 'T5', short: '5' },
  { key: 'FRIDAY', label: 'T6', short: '6' },
  { key: 'SATURDAY', label: 'T7', short: '7' },
  { key: 'SUNDAY', label: 'CN', short: 'CN' }
]

const isModalOpen = ref(false)
const isEditMode = ref(false)
const currentHabitId = ref<string | null>(null)
const isSaving = ref(false)
const formRef = ref<FormInstance>()

const isHistoryOpen = ref(false)
const selectedHabit = ref<Habit | null>(null)

const formData = reactive<HabitRequest>({
  name: '',
  description: '',
  frequency: 'DAILY',
  targetCount: 1,
  activeDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
  startDate: new Date().toISOString().substring(0, 10),
  endDate: undefined,
  goalId: undefined,
  isActive: true
})

const formRules: FormRules = {
  name: [{ required: true, message: 'Vui lòng nhập tên thói quen', trigger: 'blur' }]
}

function toggleDay(key: string, checked: boolean) {
  if (!formData.activeDays) formData.activeDays = []
  if (checked && !formData.activeDays.includes(key)) {
    formData.activeDays.push(key)
  } else if (!checked) {
    formData.activeDays = formData.activeDays.filter(k => k !== key)
  }
}

function openCreateModal() {
  isEditMode.value = false
  currentHabitId.value = null
  Object.assign(formData, {
    name: '',
    description: '',
    frequency: 'DAILY',
    targetCount: 1,
    activeDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
    startDate: new Date().toISOString().substring(0, 10),
    endDate: undefined,
    goalId: undefined,
    isActive: true
  })
  isModalOpen.value = true
}

function openEditModal(habit: Habit) {
  isEditMode.value = true
  currentHabitId.value = habit.id
  Object.assign(formData, {
    name: habit.name,
    description: habit.description || '',
    frequency: habit.frequency,
    targetCount: habit.targetCount,
    activeDays: habit.activeDays || [],
    startDate: habit.startDate,
    endDate: habit.endDate,
    goalId: habit.goalId,
    isActive: habit.isActive
  })
  isModalOpen.value = true
}

function openHistoryModal(habit: Habit) {
  selectedHabit.value = habit
  isHistoryOpen.value = true
}

async function handleQuickCheckin(habitId: string) {
  await habitStore.checkin(habitId)
}

async function handleRemoveCheckin(habitId: string, date: string) {
  await habitStore.removeCheckin(habitId, date)
  if (selectedHabit.value && selectedHabit.value.id === habitId) {
    const updated = habitStore.habits.find(h => h.id === habitId)
    if (updated) selectedHabit.value = updated
  }
}

async function handleSaveHabit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    isSaving.value = true
    try {
      if (isEditMode.value && currentHabitId.value) {
        await habitStore.updateHabit(currentHabitId.value, formData)
      } else {
        await habitStore.createHabit(formData)
      }
      isModalOpen.value = false
    } finally {
      isSaving.value = false
    }
  })
}

onMounted(() => {
  habitStore.fetchHabits()
  habitStore.fetchTodayHabits()
  habitStore.fetchStatistics()
})
</script>

<style scoped lang="scss">
.habits-page {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .page-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;

    .title-group {
      .page-title {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--app-text);
        display: flex;
        align-items: center;
        gap: 8px;

        .lifeos-pill {
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 9999px;
          font-weight: 600;
          background: rgba(245, 158, 11, 0.12);
          color: #F59E0B;
        }
      }

      .page-subtitle {
        font-size: 0.875rem;
        color: var(--app-text-muted);
        margin-top: 4px;
      }
    }
  }

  // Stats row
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }

    .stat-box {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .stat-top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .stat-label {
          font-size: 0.75rem;
          color: var(--app-text-muted);
          font-weight: 600;
        }

        .stat-icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.blue { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
          &.amber { background: rgba(245, 158, 11, 0.12); color: #F59E0B; }
          &.green { background: rgba(16, 185, 129, 0.12); color: #10B981; }
          &.purple { background: rgba(139, 92, 246, 0.12); color: #8B5CF6; }
        }
      }

      .stat-main {
        display: flex;
        align-items: baseline;
        gap: 6px;

        .stat-num {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--app-text);

          &.amber { color: #F59E0B; }
          &.green { color: #10B981; }
          &.purple { color: #8B5CF6; }
        }

        .stat-unit {
          font-size: 0.75rem;
          color: var(--app-text-muted);
        }
      }
    }
  }

  .section-block {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .section-header {
      .section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--app-text);
        display: flex;
        align-items: center;
        gap: 8px;

        .section-badge {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--app-text-muted);
        }
      }
    }

    .empty-today-box {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 12px;
      padding: 32px;
      text-align: center;

      .empty-icon { font-size: 2rem; margin-bottom: 8px; }
      .empty-text { font-size: 0.875rem; font-weight: 600; color: var(--app-text); }
      .empty-sub { font-size: 0.75rem; color: var(--app-text-muted); margin-top: 4px; }
    }

    .today-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;

      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }

      .today-habit-card {
        background: var(--app-card-bg);
        border: 1px solid var(--app-card-border);
        border-radius: 12px;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        transition: all 0.2s;

        &:hover {
          border-color: rgba(245, 158, 11, 0.4);
        }

        &.completed {
          background: rgba(16, 185, 129, 0.04);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .today-card-info {
          min-width: 0;
          flex: 1;

          .habit-name {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--app-text);
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &.strike {
              text-decoration: line-through;
              color: var(--app-text-muted);
            }
          }

          .habit-sub-row {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.75rem;
            color: var(--app-text-muted);
            margin-top: 4px;

            .streak-badge {
              font-weight: 700;
              color: #F59E0B;
              background: rgba(245, 158, 11, 0.1);
              padding: 1px 6px;
              border-radius: 4px;
            }

            .dot { color: var(--app-card-border); }
            .count-text { font-weight: 500; }
          }
        }

        .checkin-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 2px dashed var(--app-card-border);
          background: var(--app-bg);
          color: var(--app-text-muted);
          font-weight: 700;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;

          &:hover {
            border-color: #F59E0B;
            color: #F59E0B;
          }

          &.done {
            background: #10B981;
            border: 2px solid #10B981;
            color: #FFFFFF;
          }
        }
      }
    }

    // All habits list
    .all-habits-list {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .habit-row-item {
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        border-bottom: 1px solid var(--app-card-border);

        &:last-child {
          border-bottom: none;
        }

        @media (max-width: 768px) {
          flex-direction: column;
          align-items: flex-start;
        }

        .habit-row-left {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;

          .habit-title-line {
            display: flex;
            align-items: center;
            gap: 8px;

            .habit-title-text {
              font-size: 1rem;
              font-weight: 700;
              color: var(--app-text);
            }

            .freq-tag {
              font-size: 0.6875rem;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: 600;

              &.daily { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
              &.weekly { background: rgba(139, 92, 246, 0.12); color: #8B5CF6; }
              &.paused { background: rgba(100, 116, 139, 0.12); color: #64748B; }
            }
          }

          .habit-desc-text {
            font-size: 0.8125rem;
            color: var(--app-text-muted);
          }

          .weekdays-strip {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-top: 4px;

            .day-chip {
              width: 20px;
              height: 20px;
              border-radius: 4px;
              font-size: 0.625rem;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(0, 0, 0, 0.04);
              color: var(--app-text-muted);
              font-weight: 500;

              &.active {
                background: rgba(16, 185, 129, 0.15);
                color: #10B981;
                font-weight: 800;
              }
            }
          }
        }

        .habit-row-center {
          display: flex;
          align-items: center;
          gap: 24px;

          .metric-mini {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 60px;

            .num {
              font-size: 1.125rem;
              font-weight: 800;
              color: var(--app-text);

              &.amber { color: #F59E0B; }
              &.green { color: #10B981; }
            }

            .lbl {
              font-size: 0.6875rem;
              color: var(--app-text-muted);
              margin-top: 1px;
            }
          }
        }

        .habit-row-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
    }
  }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  .weekday-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .history-list-box {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 360px;
    overflow-y: auto;

    .history-empty {
      text-align: center;
      padding: 32px 0;
      color: var(--app-text-muted);
      font-size: 0.875rem;
    }

    .history-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--app-bg);
      border: 1px solid var(--app-card-border);

      .history-left {
        display: flex;
        align-items: center;
        gap: 10px;

        .history-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.15);
          color: #10B981;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .history-date {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--app-text);
        }

        .history-note {
          font-size: 0.75rem;
          color: var(--app-text-muted);
        }
      }
    }
  }
}
</style>

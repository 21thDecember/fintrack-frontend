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

    <!-- Section 1: Daily Habits Inspector & Weekly Matrix -->
    <div class="section-block">
      <div class="section-header-wrap">
        <div class="section-header-left">
          <h2 class="section-title">
            <span v-if="selectedDate === todayDateStr">🎯 Thói quen hôm nay</span>
            <span v-else>📅 Thói quen ngày {{ formatDisplayDate(selectedDate) }}</span>
            <span class="section-badge">({{ completedHabitsCount }}/{{ totalDateHabitsCount }} hoàn thành)</span>
          </h2>
          <p class="section-subtitle">
            Xem theo ngày cụ thể hoặc theo dõi cả tuần để biết thói quen nào đã được tick
          </p>
        </div>

        <!-- Date Controls & View Switcher -->
        <div class="section-header-controls">
          <div class="date-nav-box">
            <el-button-group>
              <el-button size="default" :icon="ArrowLeft" title="Ngày trước" @click="goToPrevDay" />
              <el-button
                v-if="selectedDate !== todayDateStr"
                size="default"
                type="primary"
                plain
                @click="goToToday"
              >
                Hôm nay
              </el-button>
              <el-button size="default" :icon="ArrowRight" title="Ngày sau" @click="goToNextDay" />
            </el-button-group>

            <el-date-picker
              v-model="selectedDate"
              type="date"
              value-format="YYYY-MM-DD"
              format="DD/MM/YYYY"
              placeholder="Chọn ngày"
              :clearable="false"
              style="width: 140px;"
              @change="onDateChange"
            />
          </div>

          <!-- View Mode Toggle -->
          <el-radio-group v-model="viewMode" size="default">
            <el-radio-button label="CARDS">
              <span class="mode-btn-content"><el-icon><Tickets /></el-icon> Thẻ ngày</span>
            </el-radio-button>
            <el-radio-button label="MATRIX">
              <span class="mode-btn-content"><el-icon><Grid /></el-icon> Bảng tuần</span>
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 7-Day Interactive Week Ribbon -->
      <div class="week-ribbon-bar">
        <button
          v-for="day in currentWeekDates"
          :key="day.dateStr"
          type="button"
          class="ribbon-day-btn"
          :class="{ active: day.isSelected, today: day.isToday }"
          @click="selectDate(day.dateStr)"
        >
          <div class="ribbon-day-top">
            <span class="day-label">{{ day.dayShort }}</span>
            <span v-if="day.isToday" class="today-pill">Nay</span>
          </div>
          <span class="day-num">{{ day.dayNum }}</span>
          <span
            class="day-badge"
            :class="{
              all: day.doneCount > 0 && day.doneCount >= day.totalCount && day.totalCount > 0,
              partial: day.doneCount > 0 && day.doneCount < day.totalCount,
              empty: day.doneCount === 0
            }"
          >
            {{ day.doneCount > 0 ? `${day.doneCount} ✓` : '-' }}
          </span>
        </button>
      </div>

      <!-- VIEW 1: Daily Cards View -->
      <div v-if="viewMode === 'CARDS'">
        <!-- Filter Tabs for Daily View -->
        <div class="daily-filter-strip">
          <div class="filter-pills">
            <button
              class="pill-btn"
              :class="{ active: filterStatus === 'ALL' }"
              @click="filterStatus = 'ALL'"
            >
              Tất cả ({{ totalDateHabitsCount }})
            </button>
            <button
              class="pill-btn"
              :class="{ active: filterStatus === 'DONE' }"
              @click="filterStatus = 'DONE'"
            >
              ✓ Đã tick ({{ completedHabitsCount }})
            </button>
            <button
              class="pill-btn"
              :class="{ active: filterStatus === 'PENDING' }"
              @click="filterStatus = 'PENDING'"
            >
              ⏳ Chưa tick ({{ totalDateHabitsCount - completedHabitsCount }})
            </button>
          </div>

          <div class="date-summary-text">
            <span>{{ formatDisplayDate(selectedDate) }}</span>
            <span class="dot">•</span>
            <span class="rate-highlight">{{ totalDateHabitsCount > 0 ? Math.round((completedHabitsCount / totalDateHabitsCount) * 100) : 0 }}% hoàn thành</span>
          </div>
        </div>

        <div v-if="displayedHabits.length === 0" class="empty-today-box">
          <div class="empty-icon">🌿</div>
          <p class="empty-text">Không có thói quen nào phù hợp cho ngày này.</p>
          <p class="empty-sub">Hãy chọn ngày khác trên dải tuần hoặc tạo thói quen mới.</p>
        </div>

        <div v-else class="today-grid">
          <div
            v-for="th in displayedHabits"
            :key="th.id"
            class="today-habit-card"
            :class="{ completed: isHabitDone(th) }"
          >
            <div class="today-card-info">
              <span class="habit-name" :class="{ strike: isHabitDone(th) }">
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

            <!-- 1-Click Checkin / Toggle Button -->
            <button
              class="checkin-btn"
              :class="{ done: isHabitDone(th) }"
              :title="isHabitDone(th) ? `Đã tick hoàn thành ngày ${selectedDate} (Nhấn để hủy)` : `Nhấn để tick hoàn thành cho ngày ${selectedDate}`"
              @click="handleToggleCheckinForDate(th)"
            >
              <el-icon v-if="isHabitDone(th)"><Check /></el-icon>
              <span v-else>+1</span>
            </button>
          </div>
        </div>
      </div>

      <!-- VIEW 2: Weekly Matrix View -->
      <div v-else class="weekly-matrix-box">
        <div class="matrix-table-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="col-habit">Thói quen</th>
                <th
                  v-for="day in currentWeekDates"
                  :key="day.dateStr"
                  class="col-day"
                  :class="{ active: day.isSelected, today: day.isToday }"
                  @click="selectDate(day.dateStr)"
                >
                  <div class="col-day-head">
                    <span class="day-short">{{ day.dayShort }}</span>
                    <span class="day-num">{{ day.dayNum }}</span>
                    <span v-if="day.isToday" class="col-today-tag">Nay</span>
                  </div>
                </th>
                <th class="col-rate">Tiến độ tuần</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="habitStore.habits.length === 0">
                <td :colspan="9" class="empty-matrix-cell">Chưa có thói quen nào.</td>
              </tr>
              <tr
                v-for="h in habitStore.habits"
                :key="h.id"
                class="matrix-row"
              >
                <td class="col-habit">
                  <div class="matrix-habit-name">
                    <span>{{ h.name }}</span>
                    <span v-if="!isHabitActive(h)" class="matrix-paused-tag">Tạm dừng</span>
                  </div>
                  <span class="matrix-habit-sub">{{ h.frequency === 'DAILY' ? 'Hàng ngày' : 'Hàng tuần' }}</span>
                </td>

                <td
                  v-for="day in currentWeekDates"
                  :key="day.dateStr"
                  class="col-day-cell"
                  :class="{ active: day.isSelected, today: day.isToday }"
                >
                  <button
                    type="button"
                    class="matrix-check-btn"
                    :class="{ checked: isHabitDoneOnDate(h.id, day.dateStr) }"
                    :title="isHabitDoneOnDate(h.id, day.dateStr) ? `${h.name} (${day.dayShort} ${day.dateStr}): Đã tick ✓ (Nhấn để hủy)` : `${h.name} (${day.dayShort} ${day.dateStr}): Chưa tick (Nhấn để tick)`"
                    @click="toggleMatrixCheckin(h.id, day.dateStr)"
                  >
                    <el-icon v-if="isHabitDoneOnDate(h.id, day.dateStr)"><Check /></el-icon>
                    <span v-else class="dash">-</span>
                  </button>
                </td>

                <td class="col-rate">
                  <span class="weekly-rate-badge" :class="{ perfect: getHabitWeeklyDoneCount(h.id) >= 7 }">
                    {{ getHabitWeeklyDoneCount(h.id) }}/7 ngày
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
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
              <span v-if="!isHabitActive(habit)" class="freq-tag paused">
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
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Plus,
  Compass,
  Calendar,
  CircleCheckFilled,
  Trophy,
  Check,
  Edit,
  Delete,
  ArrowLeft,
  ArrowRight,
  Tickets,
  Grid
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

function isHabitActive(h: any): boolean {
  if (h == null) return false
  if (h.isActive !== undefined && h.isActive !== null) return Boolean(h.isActive)
  if (h.active !== undefined && h.active !== null) return Boolean(h.active)
  return true
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
    isActive: isHabitActive(habit)
  })
  isModalOpen.value = true
}

function openHistoryModal(habit: Habit) {
  selectedHabit.value = habit
  isHistoryOpen.value = true
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

function formatDateIso(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  const dayOfWeek = dayNames[d.getDay()]
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${dayOfWeek}, ${day}/${month}/${year}`
}

const todayDateStr = getTodayDateString()
const selectedDate = ref(getTodayDateString())
const viewMode = ref<'CARDS' | 'MATRIX'>('CARDS')
const filterStatus = ref<'ALL' | 'DONE' | 'PENDING'>('ALL')

const currentWeekDates = computed(() => {
  const parts = selectedDate.value.split('-').map(Number)
  const base = new Date(parts[0], parts[1] - 1, parts[2])
  const dayIdx = (base.getDay() + 6) % 7 // 0 for Mon, 6 for Sun
  const mon = new Date(base)
  mon.setDate(base.getDate() - dayIdx)

  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
  const dayShorts = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  const dayEnList = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

  const result = []
  for (let i = 0; i < 7; i++) {
    const cur = new Date(mon)
    cur.setDate(mon.getDate() + i)
    const dateStr = formatDateIso(cur)
    const dayEn = dayEnList[i]
    const doneForDay = habitStore.weekCheckins.filter(c => c.completionDate === dateStr && (c.count ?? 0) > 0).length
    const scheduledForDay = habitStore.habits.filter(h => {
      if (!isHabitActive(h)) return false
      const days = (h.activeDays && h.activeDays.length > 0) ? h.activeDays : dayEnList
      return days.includes(dayEn)
    }).length

    result.push({
      dateStr,
      dayName: dayNames[i],
      dayShort: dayShorts[i],
      dayNum: cur.getDate(),
      isToday: dateStr === todayDateStr,
      isSelected: dateStr === selectedDate.value,
      doneCount: doneForDay,
      totalCount: scheduledForDay
    })
  }
  return result
})

const activeDateHabits = computed(() => {
  if (habitStore.dateHabits.length > 0) return habitStore.dateHabits
  if (selectedDate.value === todayDateStr) return habitStore.todayHabits
  return []
})

const totalDateHabitsCount = computed(() => activeDateHabits.value.length)

const completedHabitsCount = computed(() => {
  return activeDateHabits.value.filter(h => isHabitDone(h)).length
})

const displayedHabits = computed(() => {
  if (filterStatus.value === 'DONE') {
    return activeDateHabits.value.filter(h => isHabitDone(h))
  }
  if (filterStatus.value === 'PENDING') {
    return activeDateHabits.value.filter(h => !isHabitDone(h))
  }
  return activeDateHabits.value
})

function isHabitDoneOnDate(habitId: string, dateStr: string): boolean {
  return habitStore.weekCheckins.some(c => c.habitId === habitId && c.completionDate === dateStr && (c.count ?? 0) > 0)
}

function getHabitWeeklyDoneCount(habitId: string): number {
  const weekDatesList = currentWeekDates.value.map(d => d.dateStr)
  return habitStore.weekCheckins.filter(c => c.habitId === habitId && weekDatesList.includes(c.completionDate) && (c.count ?? 0) > 0).length
}

async function selectDate(dateStr: string) {
  selectedDate.value = dateStr
  await onDateChange()
}

async function goToPrevDay() {
  const parts = selectedDate.value.split('-').map(Number)
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  d.setDate(d.getDate() - 1)
  selectedDate.value = formatDateIso(d)
  await onDateChange()
}

async function goToNextDay() {
  const parts = selectedDate.value.split('-').map(Number)
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  d.setDate(d.getDate() + 1)
  selectedDate.value = formatDateIso(d)
  await onDateChange()
}

async function goToToday() {
  selectedDate.value = todayDateStr
  await onDateChange()
}

async function onDateChange() {
  await Promise.all([
    habitStore.fetchHabitsByDate(selectedDate.value),
    refreshWeekData()
  ])
}

async function refreshWeekData() {
  const weekList = currentWeekDates.value
  if (weekList.length > 0) {
    const from = weekList[0].dateStr
    const to = weekList[6].dateStr
    await habitStore.fetchWeekCheckins(from, to)
  }
}

async function handleToggleCheckinForDate(th: any) {
  const targetDate = selectedDate.value || todayDateStr
  if (isHabitDone(th)) {
    await habitStore.removeCheckin(th.id, targetDate)
  } else {
    await habitStore.checkin(th.id, targetDate)
  }
  await Promise.all([
    habitStore.fetchHabitsByDate(targetDate),
    refreshWeekData()
  ])
}

async function toggleMatrixCheckin(habitId: string, dateStr: string) {
  const isDone = isHabitDoneOnDate(habitId, dateStr)
  if (isDone) {
    await habitStore.removeCheckin(habitId, dateStr)
  } else {
    await habitStore.checkin(habitId, dateStr)
  }
  await Promise.all([
    habitStore.fetchHabitsByDate(selectedDate.value),
    refreshWeekData()
  ])
}

async function handleRemoveCheckin(habitId: string, date: string) {
  await habitStore.removeCheckin(habitId, date)
  if (selectedHabit.value && selectedHabit.value.id === habitId) {
    const updated = habitStore.habits.find(h => h.id === habitId)
    if (updated) selectedHabit.value = updated
  }
  await refreshWeekData()
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
      await refreshWeekData()
    } finally {
      isSaving.value = false
    }
  })
}

onMounted(async () => {
  await Promise.all([
    habitStore.fetchHabits(),
    habitStore.fetchTodayHabits(),
    habitStore.fetchHabitsByDate(selectedDate.value),
    habitStore.fetchStatistics()
  ])
  await refreshWeekData()
})
</script>

<style scoped lang="scss">
.habits-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  max-width: 100%;
  width: 100%;

  .page-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;

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
        line-height: 1.4;
      }
    }

    @media (max-width: 640px) {
      flex-direction: column;
      align-items: flex-start;

      .title-group,
      .action-group {
        width: 100%;
        .el-button {
          width: 100%;
        }
      }
    }
  }

  // Stats row
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    width: 100%;
    min-width: 0;

    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    @media (max-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;

      .stat-box {
        padding: 12px 10px !important;

        .stat-top {
          .stat-label {
            font-size: 0.6875rem !important;
          }
          .stat-icon-wrap {
            width: 24px !important;
            height: 24px !important;
          }
        }

        .stat-main {
          margin-top: 6px !important;

          .stat-val-row {
            .stat-value {
              font-size: 1.1875rem !important;
            }
          }
        }
      }
    }

    .stat-box {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;

      &:hover {
        border-color: rgba(16, 185, 129, 0.4);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      }

      .stat-top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .stat-label {
          font-size: 0.75rem;
          color: var(--app-text-muted);
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .stat-icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

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

    .section-header-wrap {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;

      .section-header-left {
        .section-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--app-text);
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;

          .section-badge {
            font-size: 0.8125rem;
            font-weight: 600;
            color: #10B981;
            background: rgba(16, 185, 129, 0.1);
            padding: 2px 8px;
            border-radius: 6px;
          }
        }

        .section-subtitle {
          font-size: 0.8125rem;
          color: var(--app-text-muted);
          margin-top: 4px;
        }
      }

      .section-header-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;

        .date-nav-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mode-btn-content {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    // 7-Day Interactive Ribbon
    .week-ribbon-bar {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 12px;
      padding: 10px;

      @media (max-width: 640px) {
        gap: 4px;
        padding: 6px;
      }

      .ribbon-day-btn {
        background: var(--app-bg);
        border: 1px solid var(--app-card-border);
        border-radius: 8px;
        padding: 8px 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;

        &:hover {
          border-color: #10B981;
          transform: translateY(-2px);
        }

        &:active {
          transform: scale(0.94);
        }

        &.active {
          background: rgba(16, 185, 129, 0.12);
          border: 2px solid #10B981;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
        }

        &.today {
          border-top: 2px solid #F59E0B;
        }

        .ribbon-day-top {
          display: flex;
          align-items: center;
          gap: 4px;

          .day-label {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--app-text-muted);
          }

          .today-pill {
            font-size: 0.625rem;
            font-weight: 700;
            color: #F59E0B;
            background: rgba(245, 158, 11, 0.15);
            padding: 1px 4px;
            border-radius: 4px;
          }
        }

        .day-num {
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--app-text);
        }

        .day-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 6px;

          &.all {
            background: rgba(16, 185, 129, 0.2);
            color: #059669;
          }

          &.partial {
            background: rgba(245, 158, 11, 0.2);
            color: #D97706;
          }

          &.empty {
            color: var(--app-text-muted);
          }
        }
      }
    }

    // Daily View Filter Strip
    .daily-filter-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      padding: 4px 0;

      .filter-pills {
        display: flex;
        gap: 8px;

        .pill-btn {
          background: var(--app-card-bg);
          border: 1px solid var(--app-card-border);
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--app-text-muted);
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            color: var(--app-text);
            border-color: #10B981;
          }

          &.active {
            background: #10B981;
            border-color: #10B981;
            color: #FFFFFF;
          }
        }
      }

      .date-summary-text {
        font-size: 0.8125rem;
        color: var(--app-text-muted);
        display: flex;
        align-items: center;
        gap: 6px;

        .rate-highlight {
          font-weight: 700;
          color: #10B981;
        }

        .dot { color: var(--app-card-border); }
      }
    }

    // Weekly Matrix View
    .weekly-matrix-box {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 12px;
      overflow: hidden;

      .matrix-table-wrap {
        overflow-x: auto;
      }

      .matrix-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;

        th, td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--app-card-border);
        }

        th {
          background: var(--app-bg);
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--app-text-muted);
          white-space: nowrap;

          &.col-day {
            text-align: center;
            cursor: pointer;
            transition: background 0.2s;

            &:hover {
              background: rgba(16, 185, 129, 0.08);
            }

            &.active {
              background: rgba(16, 185, 129, 0.15);
              color: #10B981;
            }

            &.today {
              border-bottom: 2px solid #F59E0B;
            }

            .col-day-head {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 2px;

              .day-short { font-size: 0.6875rem; }
              .day-num { font-size: 0.9375rem; font-weight: 800; color: var(--app-text); }
              .col-today-tag {
                font-size: 0.5625rem;
                background: #F59E0B;
                color: #FFFFFF;
                padding: 1px 4px;
                border-radius: 3px;
              }
            }
          }

          &.col-rate {
            text-align: center;
          }
        }

        tbody {
          .matrix-row {
            transition: background 0.15s;

            &:hover {
              background: rgba(0, 0, 0, 0.02);
            }

            .col-habit {
              min-width: 180px;

              .matrix-habit-name {
                font-weight: 600;
                font-size: 0.9375rem;
                color: var(--app-text);
                display: flex;
                align-items: center;
                gap: 6px;

                .matrix-paused-tag {
                  font-size: 0.625rem;
                  background: var(--app-card-border);
                  color: var(--app-text-muted);
                  padding: 1px 4px;
                  border-radius: 3px;
                }
              }

              .matrix-habit-sub {
                font-size: 0.75rem;
                color: var(--app-text-muted);
              }
            }

            .col-day-cell {
              text-align: center;

              &.active {
                background: rgba(16, 185, 129, 0.04);
              }

              .matrix-check-btn {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                border: 1px dashed var(--app-card-border);
                background: var(--app-bg);
                color: var(--app-text-muted);
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

                &:hover {
                  border-color: #10B981;
                  color: #10B981;
                  transform: scale(1.1);
                }

                &:active {
                  transform: scale(0.88);
                }

                &.checked {
                  background: #10B981;
                  border: 1px solid #10B981;
                  color: #FFFFFF;

                  &:hover {
                    background: #059669;
                    border-color: #059669;
                  }
                }

                .dash {
                  font-size: 1rem;
                  opacity: 0.4;
                }
              }
            }

            .col-rate {
              text-align: center;

              .weekly-rate-badge {
                font-size: 0.75rem;
                font-weight: 700;
                color: var(--app-text-muted);
                background: var(--app-bg);
                border: 1px solid var(--app-card-border);
                padding: 3px 8px;
                border-radius: 6px;

                &.perfect {
                  color: #059669;
                  background: rgba(16, 185, 129, 0.15);
                  border-color: rgba(16, 185, 129, 0.3);
                }
              }
            }
          }

          .empty-matrix-cell {
            text-align: center;
            padding: 32px;
            color: var(--app-text-muted);
          }
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
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
        will-change: transform;

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
          border-color: rgba(245, 158, 11, 0.45);
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
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

          &:hover {
            border-color: #F59E0B;
            color: #F59E0B;
            transform: scale(1.08);
          }

          &:active {
            transform: scale(0.88);
          }

          &.done {
            background: #10B981;
            border: 2px solid #10B981;
            color: #FFFFFF;

            &:hover {
              background: #059669;
              border-color: #059669;
              transform: scale(1.08);
            }
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

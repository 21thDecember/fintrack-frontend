<template>
  <div class="goals-page">
    <!-- Header Section -->
    <div class="page-top-bar">
      <div class="title-group">
        <h1 class="page-title">
          Quản lý Mục tiêu
          <span class="lifeos-pill">LifeOS</span>
        </h1>
        <p class="page-subtitle">
          Thiết lập mục tiêu dài hạn, chia nhỏ thành các cột mốc và theo dõi tiến độ
        </p>
      </div>

      <div class="action-group">
        <el-button type="primary" :icon="Plus" @click="openCreateModal()">
          Tạo mục tiêu
        </el-button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-top">
          <span class="stat-label">Tổng mục tiêu</span>
          <div class="stat-icon-wrap blue">
            <el-icon><Trophy /></el-icon>
          </div>
        </div>
        <div class="stat-main">
          <span class="stat-num">{{ goalStore.statistics?.totalGoals || 0 }}</span>
          <span class="stat-unit">mục tiêu</span>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-top">
          <span class="stat-label">Đang thực hiện</span>
          <div class="stat-icon-wrap amber">
            <el-icon><Flag /></el-icon>
          </div>
        </div>
        <div class="stat-main">
          <span class="stat-num amber">{{ goalStore.statistics?.inProgressGoals || 0 }}</span>
          <span class="stat-unit">mục tiêu</span>
        </div>
      </div>

      <div class="stat-box" :class="{ 'has-overdue': (goalStore.statistics?.overdueGoals || 0) > 0 }">
        <div class="stat-top">
          <span class="stat-label">Quá hạn</span>
          <div class="stat-icon-wrap red">
            <el-icon><Warning /></el-icon>
          </div>
        </div>
        <div class="stat-main">
          <span class="stat-num red">{{ goalStore.statistics?.overdueGoals || 0 }}</span>
          <span v-if="(goalStore.statistics?.overdueGoals || 0) > 0" class="stat-alert-text">Cần chú ý!</span>
          <span v-else class="stat-unit">đúng hạn</span>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-top">
          <span class="stat-label">Tiến độ trung bình</span>
          <div class="stat-icon-wrap green">
            <el-icon><CircleCheckFilled /></el-icon>
          </div>
        </div>
        <div class="stat-main">
          <span class="stat-num green">{{ goalStore.statistics?.averageProgressPercentage || 0 }}%</span>
          <span class="stat-unit">({{ goalStore.statistics?.completedGoals || 0 }} hoàn thành)</span>
        </div>
      </div>
    </div>

    <!-- Category Filter Bar -->
    <div class="category-chips-bar">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="cat-chip"
        :class="{ active: goalStore.selectedCategory === cat.key }"
        @click="filterByCategory(cat.key as any)"
      >
        <span class="cat-icon">{{ cat.icon }}</span>
        <span class="cat-name">{{ cat.label }}</span>
      </button>
    </div>

    <!-- Goals Grid -->
    <div class="goals-content-area">
      <div v-if="goalStore.loading" class="loading-state">
        <el-loading :loading="true" />
      </div>

      <div v-else-if="goalStore.goals.length === 0" class="empty-goals-box">
        <div class="empty-icon">🎯</div>
        <h3 class="empty-title">Chưa có mục tiêu nào</h3>
        <p class="empty-desc">
          Hãy thiết lập mục tiêu quan trọng (sự nghiệp, học tập, tài chính...) để bắt đầu hành trình.
        </p>
        <div class="empty-action">
          <el-button type="primary" :icon="Plus" @click="openCreateModal()">
            Tạo mục tiêu ngay
          </el-button>
        </div>
      </div>

      <div v-else class="goal-cards-grid">
        <div
          v-for="goal in goalStore.goals"
          :key="goal.id"
          class="goal-card"
          :class="{ 'goal-completed': goal.status === 'COMPLETED' || goal.status === 'CANCELLED' }"
        >
          <div class="card-inner-top">
            <!-- Badges Row -->
            <div class="tags-row">
              <span class="cat-tag" :class="getCategoryTagClass(goal.category)">
                {{ getCategoryLabel(goal.category) }}
              </span>

              <span class="type-tag" :class="getTypeTagClass(goal.goalType)">
                {{ getTypeLabel(goal.goalType) }}
              </span>

              <span class="status-tag" :class="getStatusTagClass(goal.status)">
                {{ getStatusLabel(goal.status) }}
              </span>
            </div>

            <!-- Title & Description -->
            <div class="card-title-group">
              <router-link :to="'/goals/' + goal.id" class="goal-card-title">
                {{ goal.title }}
              </router-link>
              <p v-if="goal.description" class="goal-card-desc">
                {{ goal.description }}
              </p>
            </div>

            <!-- Progress Bar -->
            <div class="progress-wrap">
              <div class="progress-top">
                <span class="progress-label">{{ getProgressTypeLabel(goal.goalType) }}</span>
                <span class="progress-pct">{{ goal.progressPercentage }}%</span>
              </div>
              <el-progress
                :percentage="goal.progressPercentage"
                :show-text="false"
                :stroke-width="8"
                :color="getProgressColor(goal.progressPercentage)"
              />
              <div class="progress-meta">
                <span v-if="goal.goalType === 'NUMERIC'" class="meta-highlight">
                  🎯 {{ goal.currentValue || 0 }} / {{ goal.targetValue || 0 }} {{ goal.unit || '' }}
                </span>
                <span v-else-if="goal.goalType === 'PERCENTAGE'" class="meta-highlight">
                  🎚️ {{ goal.currentValue || 0 }}% hoàn thành
                </span>
                <span v-else-if="goal.goalType === 'TASK_BASED'" class="meta-highlight">
                  📋 Theo công việc liên kết
                </span>
                <span v-else class="meta-highlight">
                  🏁 {{ goal.completedMilestones }}/{{ goal.totalMilestones }} cột mốc
                </span>

                <span v-if="goal.targetDate" :class="{ 'meta-overdue': goal.isOverdue }">
                  Hạn: {{ goal.targetDate }}
                </span>
              </div>

              <!-- Quick Progress Adjustment Row on Card -->
              <div class="card-quick-adjust-bar">
                <template v-if="goal.goalType === 'NUMERIC'">
                  <div class="quick-step-buttons">
                    <span class="adjust-label">Cập nhật:</span>
                    <button type="button" class="mini-step-btn" title="Giảm 1" @click.stop="quickAdjustNumeric(goal, -1)">-1</button>
                    <button type="button" class="mini-step-btn" title="Tăng 1" @click.stop="quickAdjustNumeric(goal, 1)">+1</button>
                    <button type="button" class="mini-step-btn" title="Tăng 5" @click.stop="quickAdjustNumeric(goal, 5)">+5</button>
                  </div>
                  <button type="button" class="adjust-open-pill" @click.stop="openProgressModal(goal)">
                    ⚡ Điều chỉnh
                  </button>
                </template>

                <template v-else-if="goal.goalType === 'PERCENTAGE'">
                  <div class="quick-step-buttons">
                    <span class="adjust-label">Mốc %:</span>
                    <button type="button" class="mini-step-btn" :class="{ active: (goal.currentValue || 0) === 25 }" @click.stop="quickAdjustPercentage(goal, 25)">25%</button>
                    <button type="button" class="mini-step-btn" :class="{ active: (goal.currentValue || 0) === 50 }" @click.stop="quickAdjustPercentage(goal, 50)">50%</button>
                    <button type="button" class="mini-step-btn" :class="{ active: (goal.currentValue || 0) === 100 }" @click.stop="quickAdjustPercentage(goal, 100)">100%</button>
                  </div>
                  <button type="button" class="adjust-open-pill" @click.stop="openProgressModal(goal)">
                    ⚡ Kéo %
                  </button>
                </template>

                <template v-else-if="goal.goalType === 'MILESTONE'">
                  <button type="button" class="adjust-open-pill full" @click.stop="openProgressModal(goal)">
                    🏁 Xem & Tick cột mốc ({{ goal.completedMilestones }}/{{ goal.totalMilestones }})
                  </button>
                </template>

                <template v-else>
                  <router-link :to="'/goals/' + goal.id" class="adjust-open-pill full">
                    📋 Quản lý công việc liên kết
                  </router-link>
                </template>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="card-footer-row">
            <router-link :to="'/goals/' + goal.id" class="detail-link">
              <span>Xem chi tiết</span>
              <el-icon><ArrowRight /></el-icon>
            </router-link>

            <div class="action-buttons">
              <el-button circle size="small" text title="Điều chỉnh tiến trình" @click="openProgressModal(goal)">
                <el-icon><CircleCheckFilled /></el-icon>
              </el-button>

              <el-button circle size="small" text title="Chỉnh sửa" @click="openEditModal(goal)">
                <el-icon><Edit /></el-icon>
              </el-button>

              <el-popconfirm
                title="Xóa mục tiêu này? (Các công việc và thói quen liên quan sẽ không bị xóa)"
                confirm-button-text="Xóa"
                cancel-button-text="Hủy"
                confirm-button-type="danger"
                @confirm="goalStore.deleteGoal(goal.id)"
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
    </div>

    <!-- Quick Progress Adjustment Dialog -->
    <el-dialog
      v-model="isProgressModalOpen"
      title="⚡ Điều chỉnh Tiến trình Mục tiêu"
      width="480px"
      destroy-on-close
    >
      <div v-if="adjustingGoal" class="adjust-modal-content">
        <div class="adjust-goal-header">
          <div class="adjust-title-box">
            <h3 class="adjust-goal-title">{{ adjustingGoal.title }}</h3>
            <span class="type-tag" :class="getTypeTagClass(adjustingGoal.goalType)">
              {{ getTypeLabel(adjustingGoal.goalType) }}
            </span>
          </div>
          <p v-if="adjustingGoal.description" class="adjust-goal-desc">{{ adjustingGoal.description }}</p>
        </div>

        <!-- Live Progress Preview -->
        <div class="adjust-preview-box">
          <div class="preview-top">
            <span class="preview-label">Tiến độ ước tính</span>
            <span class="preview-pct">{{ previewProgressPercentage }}%</span>
          </div>
          <el-progress
            :percentage="previewProgressPercentage"
            :show-text="false"
            :stroke-width="10"
            :color="getProgressColor(previewProgressPercentage)"
          />
        </div>

        <!-- NUMERIC Progress Controls -->
        <div v-if="adjustingGoal.goalType === 'NUMERIC'" class="adjust-controls-section">
          <div class="numeric-adjust-card">
            <div class="numeric-main-row">
              <span class="num-label">Giá trị hiện tại:</span>
              <div class="number-stepper">
                <el-button size="default" @click="adjustValue = Math.max(0, adjustValue - 1)">-</el-button>
                <el-input-number
                  v-model="adjustValue"
                  :min="0"
                  :step="1"
                  controls-position="right"
                  style="width: 140px"
                />
                <el-button size="default" @click="adjustValue = adjustValue + 1">+</el-button>
              </div>
              <span class="unit-tag">{{ adjustingGoal.unit || 'đơn vị' }}</span>
            </div>

            <div class="target-compare-text">
              Mục tiêu: <strong>{{ adjustingGoal.targetValue || 0 }} {{ adjustingGoal.unit || '' }}</strong>
            </div>

            <div class="quick-add-chips">
              <span class="chips-title">Cộng nhanh:</span>
              <button type="button" class="quick-chip" @click="adjustValue = adjustValue + 1">+1</button>
              <button type="button" class="quick-chip" @click="adjustValue = adjustValue + 5">+5</button>
              <button type="button" class="quick-chip" @click="adjustValue = adjustValue + 10">+10</button>
              <button type="button" class="quick-chip" @click="adjustValue = adjustValue + 50">+50</button>
              <button type="button" class="quick-chip reset" @click="adjustValue = 0">Về 0</button>
              <button
                v-if="adjustingGoal.targetValue"
                type="button"
                class="quick-chip max"
                @click="adjustValue = adjustingGoal.targetValue"
              >
                Đạt 100%
              </button>
            </div>
          </div>
        </div>

        <!-- PERCENTAGE Progress Controls -->
        <div v-else-if="adjustingGoal.goalType === 'PERCENTAGE'" class="adjust-controls-section">
          <div class="percentage-adjust-card">
            <div class="pct-slider-wrap">
              <el-slider
                v-model="adjustValue"
                :min="0"
                :max="100"
                :step="1"
                :marks="{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }"
              />
            </div>

            <div class="quick-add-chips">
              <span class="chips-title">Mốc nhanh:</span>
              <button type="button" class="quick-chip" @click="adjustValue = 0">0%</button>
              <button type="button" class="quick-chip" @click="adjustValue = 25">25%</button>
              <button type="button" class="quick-chip" @click="adjustValue = 50">50%</button>
              <button type="button" class="quick-chip" @click="adjustValue = 75">75%</button>
              <button type="button" class="quick-chip max" @click="adjustValue = 100">100% 🎉</button>
            </div>
          </div>
        </div>

        <!-- MILESTONE Progress Controls -->
        <div v-else-if="adjustingGoal.goalType === 'MILESTONE'" class="adjust-controls-section">
          <div class="milestone-adjust-list">
            <div v-if="!adjustingGoal.milestones || adjustingGoal.milestones.length === 0" class="empty-m-note">
              Mục tiêu này chưa có cột mốc. Bạn có thể mở chi tiết để thêm cột mốc!
            </div>
            <div
              v-for="m in adjustingGoal.milestones"
              :key="m.id"
              class="modal-milestone-row"
              :class="{ done: m.status === 'COMPLETED' }"
              @click="toggleModalMilestone(m)"
            >
              <div class="m-checkbox" :class="{ checked: m.status === 'COMPLETED' }">
                <span v-if="m.status === 'COMPLETED'">✓</span>
              </div>
              <span class="m-title" :class="{ strike: m.status === 'COMPLETED' }">{{ m.title }}</span>
            </div>
          </div>
        </div>

        <!-- Status selector in modal -->
        <div class="adjust-status-row">
          <label class="status-label">Trạng thái mục tiêu:</label>
          <el-select v-model="adjustStatus" size="default" style="width: 170px">
            <el-option label="Chưa bắt đầu" value="NOT_STARTED" />
            <el-option label="Đang thực hiện" value="IN_PROGRESS" />
            <el-option label="Đã hoàn thành" value="COMPLETED" />
            <el-option label="Đã hủy" value="CANCELLED" />
          </el-select>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isProgressModalOpen = false">Đóng</el-button>
          <el-button type="primary" :loading="isUpdatingProgress" @click="handleSaveProgressModal">
            Lưu tiến trình
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Create / Edit Goal Modal -->
    <el-dialog
      v-model="isModalOpen"
      :title="isEditMode ? 'Chỉnh sửa Mục tiêu' : 'Tạo Mục tiêu mới'"
      width="580px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top">
        <el-form-item label="Tên mục tiêu" prop="title">
          <el-input v-model="formData.title" placeholder="Ví dụ: Đạt IELTS 7.0, Tiết kiệm 100 triệu, Chạy bộ 100 km..." />
        </el-form-item>

        <el-form-item label="Mô tả mục tiêu" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="Mục đích, ý nghĩa và tiêu chí hoàn thành..." />
        </el-form-item>

        <!-- Goal Type Selector (Loại mục tiêu & Tiến trình) -->
        <el-form-item label="Loại mục tiêu & Cách tính tiến trình" prop="goalType">
          <div class="goal-type-grid">
            <div
              class="goal-type-card"
              :class="{ active: formData.goalType === 'MILESTONE' }"
              @click="formData.goalType = 'MILESTONE'"
            >
              <div class="type-icon">🏁</div>
              <div class="type-text">
                <div class="type-title">Cột mốc</div>
                <div class="type-desc">Checklist các bước mốc quan trọng</div>
              </div>
            </div>

            <div
              class="goal-type-card"
              :class="{ active: formData.goalType === 'NUMERIC' }"
              @click="formData.goalType = 'NUMERIC'"
            >
              <div class="type-icon">📊</div>
              <div class="type-text">
                <div class="type-title">Con số / Định lượng</div>
                <div class="type-desc">Đo lường bằng số (tiền, km, sách, kg...)</div>
              </div>
            </div>

            <div
              class="goal-type-card"
              :class="{ active: formData.goalType === 'PERCENTAGE' }"
              @click="formData.goalType = 'PERCENTAGE'"
            >
              <div class="type-icon">🎚️</div>
              <div class="type-text">
                <div class="type-title">Phần trăm (0-100%)</div>
                <div class="type-desc">Tự điều chỉnh mức độ tiến triển</div>
              </div>
            </div>

            <div
              class="goal-type-card"
              :class="{ active: formData.goalType === 'TASK_BASED' }"
              @click="formData.goalType = 'TASK_BASED'"
            >
              <div class="type-icon">📋</div>
              <div class="type-text">
                <div class="type-title">Công việc liên kết</div>
                <div class="type-desc">Tự tính theo Tasks đã hoàn thành</div>
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- Conditional fields for NUMERIC type -->
        <div v-if="formData.goalType === 'NUMERIC'" class="form-row-3 numeric-setup-box">
          <el-form-item label="Mục tiêu cần đạt" prop="targetValue">
            <el-input-number
              v-model="formData.targetValue"
              :min="1"
              :step="1"
              style="width: 100%"
              placeholder="VD: 100"
            />
          </el-form-item>

          <el-form-item label="Hiện tại đã đạt" prop="currentValue">
            <el-input-number
              v-model="formData.currentValue"
              :min="0"
              :step="1"
              style="width: 100%"
              placeholder="VD: 0"
            />
          </el-form-item>

          <el-form-item label="Đơn vị tính" prop="unit">
            <el-input
              v-model="formData.unit"
              placeholder="km, quyển, VNĐ, kg..."
            />
          </el-form-item>
        </div>

        <!-- Conditional fields for PERCENTAGE type -->
        <div v-else-if="formData.goalType === 'PERCENTAGE'" class="percentage-setup-box">
          <el-form-item label="Tiến độ hiện tại (%)">
            <div class="slider-with-input">
              <el-slider
                v-model="formData.currentValue"
                :min="0"
                :max="100"
                :step="1"
                show-input
              />
            </div>
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="Lĩnh vực / Nhóm" prop="category">
            <el-select v-model="formData.category" class="w-full">
              <el-option label="💼 Sự nghiệp (CAREER)" value="CAREER" />
              <el-option label="📚 Học tập (LEARNING)" value="LEARNING" />
              <el-option label="💰 Tài chính (FINANCE)" value="FINANCE" />
              <el-option label="💪 Sức khỏe (HEALTH)" value="HEALTH" />
              <el-option label="🌱 Phát triển cá nhân (PERSONAL)" value="PERSONAL" />
              <el-option label="✨ Khác (OTHER)" value="OTHER" />
            </el-select>
          </el-form-item>

          <el-form-item label="Độ ưu tiên" prop="priority">
            <el-select v-model="formData.priority" class="w-full">
              <el-option label="🔴 Ưu tiên cao (HIGH)" value="HIGH" />
              <el-option label="🟡 Ưu tiên trung bình (MEDIUM)" value="MEDIUM" />
              <el-option label="⚪ Ưu tiên thấp (LOW)" value="LOW" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="Ngày bắt đầu" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              placeholder="Chọn ngày bắt đầu"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="Hạn dự kiến hoàn thành" prop="targetDate">
            <el-date-picker
              v-model="formData.targetDate"
              type="date"
              placeholder="Chọn ngày hạn chót"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </div>

        <div v-if="isEditMode" class="form-row-2">
          <el-form-item label="Trạng thái" prop="status">
            <el-select v-model="formData.status" class="w-full">
              <el-option label="Chưa bắt đầu (NOT_STARTED)" value="NOT_STARTED" />
              <el-option label="Đang thực hiện (IN_PROGRESS)" value="IN_PROGRESS" />
              <el-option label="Đã hoàn thành (COMPLETED)" value="COMPLETED" />
              <el-option label="Đã hủy (CANCELLED)" value="CANCELLED" />
            </el-select>
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isModalOpen = false">Hủy</el-button>
          <el-button type="primary" :loading="isSaving" @click="handleSaveGoal">
            {{ isEditMode ? 'Lưu thay đổi' : 'Tạo mục tiêu' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Plus,
  Trophy,
  Flag,
  Warning,
  CircleCheckFilled,
  ArrowRight,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { useGoalStore } from '@/stores/goal'
import type { Goal, GoalRequest, GoalCategory, GoalStatus, GoalType, Milestone } from '@/types/goal'
import type { FormInstance, FormRules } from 'element-plus'

const goalStore = useGoalStore()

const categories = [
  { key: 'ALL', label: 'Tất cả', icon: '🌐' },
  { key: 'CAREER', label: 'Sự nghiệp', icon: '💼' },
  { key: 'LEARNING', label: 'Học tập', icon: '📚' },
  { key: 'FINANCE', label: 'Tài chính', icon: '💰' },
  { key: 'HEALTH', label: 'Sức khỏe', icon: '💪' },
  { key: 'PERSONAL', label: 'Cá nhân', icon: '🌱' },
  { key: 'OTHER', label: 'Khác', icon: '✨' }
]

const isModalOpen = ref(false)
const isEditMode = ref(false)
const currentGoalId = ref<string | null>(null)
const isSaving = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive<GoalRequest>({
  title: '',
  description: '',
  category: 'PERSONAL',
  priority: 'MEDIUM',
  status: 'NOT_STARTED',
  goalType: 'MILESTONE',
  targetValue: 100,
  currentValue: 0,
  unit: '',
  startDate: new Date().toISOString().substring(0, 10),
  targetDate: undefined
})

const formRules: FormRules = {
  title: [{ required: true, message: 'Vui lòng nhập tiêu đề mục tiêu', trigger: 'blur' }]
}

// Quick Progress Adjuster Modal State
const isProgressModalOpen = ref(false)
const adjustingGoal = ref<Goal | null>(null)
const adjustValue = ref<number>(0)
const adjustStatus = ref<GoalStatus>('IN_PROGRESS')
const isUpdatingProgress = ref(false)

const previewProgressPercentage = computed(() => {
  if (!adjustingGoal.value) return 0
  const type = adjustingGoal.value.goalType || 'MILESTONE'
  if (type === 'NUMERIC') {
    const target = adjustingGoal.value.targetValue || 0
    if (target <= 0) return 0
    return Math.min(100, Math.max(0, Math.round(((adjustValue.value || 0) / target) * 1000) / 10))
  }
  if (type === 'PERCENTAGE') {
    return Math.min(100, Math.max(0, Math.round((adjustValue.value || 0) * 10) / 10))
  }
  if (type === 'MILESTONE') {
    const ms = adjustingGoal.value.milestones || []
    if (ms.length === 0) return 0
    const comp = ms.filter(m => m.status === 'COMPLETED').length
    return Math.round((comp / ms.length) * 1000) / 10
  }
  return adjustingGoal.value.progressPercentage || 0
})

function filterByCategory(cat: GoalCategory | 'ALL') {
  goalStore.selectedCategory = cat
  goalStore.fetchGoals()
}

function getCategoryLabel(category: GoalCategory) {
  switch (category) {
    case 'CAREER': return '💼 Sự nghiệp'
    case 'LEARNING': return '📚 Học tập'
    case 'FINANCE': return '💰 Tài chính'
    case 'HEALTH': return '💪 Sức khỏe'
    case 'PERSONAL': return '🌱 Cá nhân'
    case 'OTHER': return '✨ Khác'
  }
}

function getCategoryTagClass(category: GoalCategory) {
  switch (category) {
    case 'CAREER': return 'tag-career'
    case 'LEARNING': return 'tag-learning'
    case 'FINANCE': return 'tag-finance'
    case 'HEALTH': return 'tag-health'
    case 'PERSONAL': return 'tag-personal'
    case 'OTHER': return 'tag-other'
  }
}

function getTypeLabel(type?: GoalType) {
  switch (type) {
    case 'NUMERIC': return '📊 Định lượng'
    case 'PERCENTAGE': return '🎚️ Phần trăm'
    case 'TASK_BASED': return '📋 Công việc'
    case 'MILESTONE':
    default: return '🏁 Cột mốc'
  }
}

function getTypeTagClass(type?: GoalType) {
  switch (type) {
    case 'NUMERIC': return 'type-numeric'
    case 'PERCENTAGE': return 'type-percentage'
    case 'TASK_BASED': return 'type-task'
    case 'MILESTONE':
    default: return 'type-milestone'
  }
}

function getProgressTypeLabel(type?: GoalType) {
  switch (type) {
    case 'NUMERIC': return 'Tiến độ định lượng'
    case 'PERCENTAGE': return 'Tiến độ hoàn thành'
    case 'TASK_BASED': return 'Tiến độ công việc'
    case 'MILESTONE':
    default: return 'Tiến độ cột mốc'
  }
}

function getStatusLabel(status: GoalStatus) {
  switch (status) {
    case 'NOT_STARTED': return 'Chưa bắt đầu'
    case 'IN_PROGRESS': return 'Đang thực hiện'
    case 'COMPLETED': return 'Hoàn thành'
    case 'CANCELLED': return 'Đã hủy'
  }
}

function getStatusTagClass(status: GoalStatus) {
  switch (status) {
    case 'NOT_STARTED': return 'status-not-started'
    case 'IN_PROGRESS': return 'status-in-progress'
    case 'COMPLETED': return 'status-completed'
    case 'CANCELLED': return 'status-cancelled'
  }
}

function getProgressColor(pct: number) {
  if (pct >= 100) return '#10B981'
  if (pct >= 50) return '#6366F1'
  return '#F59E0B'
}

async function quickAdjustNumeric(goal: Goal, delta: number) {
  const nextVal = Math.max(0, (goal.currentValue || 0) + delta)
  await goalStore.updateProgress(goal.id, nextVal)
}

async function quickAdjustPercentage(goal: Goal, targetPct: number) {
  await goalStore.updateProgress(goal.id, targetPct)
}

function openProgressModal(goal: Goal) {
  adjustingGoal.value = goal
  adjustValue.value = goal.currentValue || 0
  adjustStatus.value = goal.status
  isProgressModalOpen.value = true
}

async function handleSaveProgressModal() {
  if (!adjustingGoal.value) return
  isUpdatingProgress.value = true
  try {
    await goalStore.updateProgress(adjustingGoal.value.id, adjustValue.value, adjustStatus.value)
    isProgressModalOpen.value = false
  } finally {
    isUpdatingProgress.value = false
  }
}

async function toggleModalMilestone(m: Milestone) {
  if (!adjustingGoal.value) return
  const nextStatus = m.status === 'COMPLETED' ? 'TODO' : 'COMPLETED'
  await goalStore.updateMilestone(adjustingGoal.value.id, m.id, {
    title: m.title,
    description: m.description,
    dueDate: m.dueDate,
    status: nextStatus,
    displayOrder: m.displayOrder
  })
  const updated = goalStore.goals.find(g => g.id === adjustingGoal.value?.id)
  if (updated) {
    adjustingGoal.value = updated
  }
}

function openCreateModal() {
  isEditMode.value = false
  currentGoalId.value = null
  Object.assign(formData, {
    title: '',
    description: '',
    category: 'PERSONAL',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    goalType: 'MILESTONE',
    targetValue: 100,
    currentValue: 0,
    unit: '',
    startDate: new Date().toISOString().substring(0, 10),
    targetDate: undefined
  })
  isModalOpen.value = true
}

function openEditModal(goal: Goal) {
  isEditMode.value = true
  currentGoalId.value = goal.id
  Object.assign(formData, {
    title: goal.title,
    description: goal.description || '',
    category: goal.category,
    priority: goal.priority,
    status: goal.status,
    goalType: goal.goalType || 'MILESTONE',
    targetValue: goal.targetValue || 0,
    currentValue: goal.currentValue || 0,
    unit: goal.unit || '',
    startDate: goal.startDate,
    targetDate: goal.targetDate
  })
  isModalOpen.value = true
}

async function handleSaveGoal() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    isSaving.value = true
    try {
      if (isEditMode.value && currentGoalId.value) {
        await goalStore.updateGoal(currentGoalId.value, formData)
      } else {
        await goalStore.createGoal(formData)
      }
      isModalOpen.value = false
    } finally {
      isSaving.value = false
    }
  })
}

onMounted(() => {
  goalStore.fetchGoals()
  goalStore.fetchStatistics()
})
</script>

<style scoped lang="scss">
.goals-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  max-width: 100%;
  width: 100%;

  .w-full {
    width: 100%;
  }

  /* Header Section */
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
        letter-spacing: -0.02em;
        color: var(--app-text);
        display: flex;
        align-items: center;
        gap: 8px;

        .lifeos-pill {
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 9999px;
          background: rgba(99, 102, 241, 0.15);
          color: #6366F1;
          letter-spacing: 0.04em;
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

      .title-group {
        width: 100%;
      }

      .action-group {
        width: 100%;

        .el-button {
          width: 100%;
        }
      }
    }
  }

  /* Statistics Cards */
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
            width: 26px !important;
            height: 26px !important;
            font-size: 0.8125rem !important;
          }
        }

        .stat-main {
          margin-top: 6px !important;

          .stat-val-row {
            .stat-value {
              font-size: 1.1875rem !important;
            }
            .stat-unit {
              font-size: 0.6875rem !important;
            }
          }

          .stat-hint,
          .stat-alert-text {
            font-size: 0.6875rem !important;
          }
        }
      }
    }

    .stat-box {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
      will-change: transform;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);

        .stat-icon-wrap {
          transform: scale(1.08);
        }
      }

      &.has-overdue {
        border-color: rgba(239, 68, 68, 0.4);
        background: rgba(239, 68, 68, 0.04);
      }

      .stat-top {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .stat-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--app-text-muted);
        }

        .stat-icon-wrap {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

          &.blue { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
          &.amber { background: rgba(245, 158, 11, 0.12); color: #F59E0B; }
          &.red { background: rgba(239, 68, 68, 0.12); color: #EF4444; }
          &.green { background: rgba(16, 185, 129, 0.12); color: #10B981; }
        }
      }

      .stat-main {
        margin-top: 8px;
        display: flex;
        align-items: baseline;
        gap: 6px;

        .stat-num {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--app-text);

          &.amber { color: #F59E0B; }
          &.red { color: #EF4444; }
          &.green { color: #10B981; }
        }

        .stat-unit {
          font-size: 0.75rem;
          color: var(--app-text-muted);
        }

        .stat-alert-text {
          font-size: 0.75rem;
          color: #EF4444;
          font-weight: 700;
        }
      }
    }
  }

  /* Category Chips Bar */
  .category-chips-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow-x: auto;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 6px;

    &::-webkit-scrollbar {
      height: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--app-card-border);
      border-radius: 4px;
    }

    .cat-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 10px;
      font-size: 0.8125rem;
      font-weight: 500;
      white-space: nowrap;
      cursor: pointer;
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      color: var(--app-text);
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        background: rgba(0, 0, 0, 0.03);
      }

      &:active {
        transform: scale(0.95);
      }

      &.active {
        background: #6366F1;
        border-color: #6366F1;
        color: #FFFFFF;
        font-weight: 700;
        box-shadow: 0 2px 6px rgba(99, 102, 241, 0.35);
      }

      .cat-icon {
        font-size: 0.9375rem;
      }
    }
  }

  /* Goals Content Area */
  .goals-content-area {
    .loading-state {
      padding: 48px 0;
      display: flex;
      justify-content: center;
    }

    .empty-goals-box {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 14px;
      padding: 48px 24px;
      text-align: center;

      .empty-icon {
        font-size: 2.5rem;
        margin-bottom: 12px;
      }

      .empty-title {
        font-size: 1.0625rem;
        font-weight: 700;
        color: var(--app-text);
      }

      .empty-desc {
        font-size: 0.875rem;
        color: var(--app-text-muted);
        max-width: 420px;
        margin: 6px auto 0;
      }

      .empty-action {
        margin-top: 18px;
      }
    }

    .goal-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      @media (max-width: 1100px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 680px) {
        grid-template-columns: 1fr;
      }

      .goal-card {
        background: var(--app-card-bg);
        border: 1px solid var(--app-card-border);
        border-radius: 14px;
        padding: 18px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 14px;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
        will-change: transform;

        &:hover {
          border-color: rgba(99, 102, 241, 0.45);
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(99, 102, 241, 0.1);
        }

        &.goal-completed {
          opacity: 0.72;
        }

        .card-inner-top {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .tags-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;

            .cat-tag {
              font-size: 0.6875rem;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 6px;

              &.tag-career { background: rgba(59, 130, 246, 0.12); color: #2563EB; }
              &.tag-learning { background: rgba(147, 51, 234, 0.12); color: #7C3AED; }
              &.tag-finance { background: rgba(16, 185, 129, 0.12); color: #059669; }
              &.tag-health { background: rgba(244, 63, 94, 0.12); color: #E11D48; }
              &.tag-personal { background: rgba(245, 158, 11, 0.12); color: #D97706; }
              &.tag-other { background: rgba(107, 114, 128, 0.12); color: #4B5563; }
            }

            .type-tag {
              font-size: 0.6875rem;
              font-weight: 600;
              padding: 2px 7px;
              border-radius: 6px;

              &.type-milestone { background: rgba(99, 102, 241, 0.12); color: #6366F1; }
              &.type-numeric { background: rgba(16, 185, 129, 0.12); color: #059669; }
              &.type-percentage { background: rgba(245, 158, 11, 0.12); color: #D97706; }
              &.type-task { background: rgba(14, 165, 233, 0.12); color: #0284C7; }
            }

            .status-tag {
              font-size: 0.6875rem;
              font-weight: 600;
              padding: 2px 7px;
              border-radius: 6px;

              &.status-not-started { background: rgba(107, 114, 128, 0.1); color: var(--app-text-muted); }
              &.status-in-progress { background: rgba(245, 158, 11, 0.15); color: #D97706; }
              &.status-completed { background: rgba(16, 185, 129, 0.15); color: #059669; font-weight: 700; }
              &.status-cancelled { background: rgba(239, 68, 68, 0.12); color: #DC2626; }
            }
          }

          .card-title-group {
            .goal-card-title {
              font-size: 1rem;
              font-weight: 700;
              color: var(--app-text);
              text-decoration: none;
              line-height: 1.4;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              transition: color 0.2s;

              &:hover {
                color: #6366F1;
              }
            }

            .goal-card-desc {
              font-size: 0.75rem;
              color: var(--app-text-muted);
              margin-top: 4px;
              line-height: 1.4;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          }

          .progress-wrap {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding-top: 4px;

            .progress-top {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 0.75rem;

              .progress-label {
                color: var(--app-text-muted);
                font-weight: 500;
              }

              .progress-pct {
                font-weight: 700;
                color: #6366F1;
              }
            }

            .progress-meta {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 0.6875rem;
              color: var(--app-text-muted);

              .meta-highlight {
                font-weight: 600;
                color: var(--app-text);
              }

              .meta-overdue {
                color: #EF4444;
                font-weight: 700;
              }
            }

            /* Quick Progress Adjustment Row on Card */
            .card-quick-adjust-bar {
              margin-top: 4px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 6px;
              padding: 5px 8px;
              border-radius: 8px;
              background: rgba(99, 102, 241, 0.05);
              border: 1px dashed rgba(99, 102, 241, 0.2);
              flex-wrap: wrap;

              .quick-step-buttons {
                display: flex;
                align-items: center;
                gap: 4px;

                .adjust-label {
                  font-size: 0.6875rem;
                  color: var(--app-text-muted);
                  font-weight: 500;
                  margin-right: 2px;
                }

                .mini-step-btn {
                  padding: 2px 7px;
                  font-size: 0.6875rem;
                  font-weight: 700;
                  border-radius: 6px;
                  background: var(--app-card-bg);
                  border: 1px solid var(--app-card-border);
                  color: var(--app-text);
                  cursor: pointer;
                  transition: all 0.15s;

                  &:hover {
                    background: #6366F1;
                    border-color: #6366F1;
                    color: #fff;
                  }

                  &.active {
                    background: #6366F1;
                    border-color: #6366F1;
                    color: #fff;
                  }
                }
              }

              .adjust-open-pill {
                padding: 3px 8px;
                font-size: 0.6875rem;
                font-weight: 600;
                border-radius: 6px;
                background: rgba(99, 102, 241, 0.1);
                color: #6366F1;
                border: none;
                cursor: pointer;
                text-decoration: none;
                white-space: nowrap;
                transition: all 0.15s;

                &:hover {
                  background: #6366F1;
                  color: #fff;
                }

                &.full {
                  width: 100%;
                  text-align: center;
                  padding: 4px 8px;
                }
              }
            }
          }
        }

        .card-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid var(--app-card-border);
          font-size: 0.75rem;

          .detail-link {
            font-weight: 700;
            color: #6366F1;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: gap 0.2s;

            &:hover {
              gap: 6px;
              text-decoration: underline;
            }
          }

          .action-buttons {
            display: flex;
            align-items: center;
            gap: 2px;
          }
        }
      }
    }
  }

  /* Form Layouts & Goal Type Cards */
  .goal-type-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    width: 100%;

    @media (max-width: 540px) {
      grid-template-columns: 1fr;
    }

    .goal-type-card {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1.5px solid var(--app-card-border);
      background: var(--app-card-bg);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: rgba(99, 102, 241, 0.5);
        background: rgba(99, 102, 241, 0.02);
      }

      &.active {
        border-color: #6366F1;
        background: rgba(99, 102, 241, 0.08);

        .type-title {
          color: #6366F1;
          font-weight: 700;
        }
      }

      .type-icon {
        font-size: 1.25rem;
        line-height: 1;
        margin-top: 2px;
      }

      .type-text {
        .type-title {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--app-text);
        }

        .type-desc {
          font-size: 0.6875rem;
          color: var(--app-text-muted);
          margin-top: 2px;
          line-height: 1.3;
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

  .form-row-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  .numeric-setup-box,
  .percentage-setup-box {
    background: rgba(99, 102, 241, 0.04);
    border: 1px solid rgba(99, 102, 241, 0.15);
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 16px;
  }

  .slider-with-input {
    padding: 0 10px;
  }

  /* Quick Progress Modal Content */
  .adjust-modal-content {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .adjust-goal-header {
      .adjust-title-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;

        .adjust-goal-title {
          font-size: 1.0625rem;
          font-weight: 700;
          color: var(--app-text);
        }
      }

      .adjust-goal-desc {
        font-size: 0.75rem;
        color: var(--app-text-muted);
        margin-top: 4px;
      }
    }

    .adjust-preview-box {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .preview-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8125rem;

        .preview-label {
          color: var(--app-text-muted);
          font-weight: 500;
        }

        .preview-pct {
          font-weight: 800;
          font-size: 1rem;
          color: #6366F1;
        }
      }
    }

    .numeric-adjust-card,
    .percentage-adjust-card {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 10px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .numeric-main-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;

        .num-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--app-text);
        }

        .number-stepper {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .unit-tag {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #6366F1;
        }
      }

      .target-compare-text {
        font-size: 0.75rem;
        color: var(--app-text-muted);
      }

      .pct-slider-wrap {
        padding: 0 10px 10px;
      }
    }

    .quick-add-chips {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;

      .chips-title {
        font-size: 0.75rem;
        color: var(--app-text-muted);
        font-weight: 500;
      }

      .quick-chip {
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--app-card-border);
        background: var(--app-card-bg);
        color: var(--app-text);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
          border-color: #6366F1;
          color: #6366F1;
        }

        &.reset {
          background: rgba(239, 68, 68, 0.08);
          color: #EF4444;
          border-color: rgba(239, 68, 68, 0.2);
        }

        &.max {
          background: rgba(16, 185, 129, 0.08);
          color: #10B981;
          border-color: rgba(16, 185, 129, 0.2);
        }
      }
    }

    .milestone-adjust-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 200px;
      overflow-y: auto;

      .empty-m-note {
        font-size: 0.75rem;
        color: var(--app-text-muted);
        text-align: center;
        padding: 12px;
      }

      .modal-milestone-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--app-card-bg);
        border: 1px solid var(--app-card-border);
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
          border-color: #6366F1;
        }

        &.done {
          background: rgba(16, 185, 129, 0.04);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .m-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1.5px solid var(--app-card-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6875rem;
          color: #fff;

          &.checked {
            background: #10B981;
            border-color: #10B981;
          }
        }

        .m-title {
          font-size: 0.8125rem;
          color: var(--app-text);

          &.strike {
            text-decoration: line-through;
            color: var(--app-text-muted);
          }
        }
      }
    }

    .adjust-status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: 8px;
      border-top: 1px solid var(--app-card-border);

      .status-label {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--app-text);
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>

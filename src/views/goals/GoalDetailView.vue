<template>
  <div class="goal-detail-page">
    <!-- Back Navigation -->
    <div class="back-nav-bar">
      <router-link to="/goals" class="back-link">
        <el-icon><Back /></el-icon>
        <span>Quay lại danh sách mục tiêu</span>
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="goalStore.detailLoading" class="loading-state">
      <el-loading :loading="true" />
    </div>

    <div v-else-if="goalStore.currentGoal" class="detail-body">
      <!-- Goal Header Banner -->
      <div class="goal-banner-card">
        <div class="banner-top">
          <div class="banner-left">
            <div class="tags-group">
              <span class="cat-pill">
                {{ getCategoryLabel(goalStore.currentGoal.category) }}
              </span>
              <span class="status-pill" :class="getStatusTagClass(goalStore.currentGoal.status)">
                {{ getStatusLabel(goalStore.currentGoal.status) }}
              </span>
              <span class="priority-pill" :class="getPriorityTagClass(goalStore.currentGoal.priority)">
                {{ getPriorityLabel(goalStore.currentGoal.priority) }}
              </span>
            </div>

            <h1 class="goal-title">
              {{ goalStore.currentGoal.title }}
            </h1>

            <p v-if="goalStore.currentGoal.description" class="goal-desc">
              {{ goalStore.currentGoal.description }}
            </p>
          </div>

          <div class="banner-actions">
            <el-button :icon="Edit" @click="openEditGoalModal">Chỉnh sửa mục tiêu</el-button>
          </div>
        </div>

        <!-- Date & Overdue Row -->
        <div class="banner-dates-row">
          <div v-if="goalStore.currentGoal.startDate" class="date-item">
            <el-icon><Calendar /></el-icon>
            <span>Bắt đầu: <strong>{{ goalStore.currentGoal.startDate }}</strong></span>
          </div>

          <div
            v-if="goalStore.currentGoal.targetDate"
            class="date-item"
            :class="{ 'is-overdue': goalStore.currentGoal.isOverdue }"
          >
            <el-icon><Flag /></el-icon>
            <span>Hạn chót: <strong>{{ goalStore.currentGoal.targetDate }}</strong></span>
            <span v-if="goalStore.currentGoal.isOverdue" class="overdue-tag">(Quá hạn!)</span>
          </div>

          <div v-if="goalStore.currentGoal.completedAt" class="date-item is-completed">
            <el-icon><CircleCheckFilled /></el-icon>
            <span>Hoàn thành: {{ formatDateTime(goalStore.currentGoal.completedAt) }}</span>
          </div>
        </div>

        <!-- Progress Box -->
        <div class="progress-box">
          <div class="progress-box-header">
            <span class="progress-box-title">Tiến độ hoàn thành mục tiêu</span>
            <span class="progress-box-pct">{{ goalStore.currentGoal.progressPercentage }}%</span>
          </div>
          <el-progress
            :percentage="goalStore.currentGoal.progressPercentage"
            :show-text="false"
            :stroke-width="10"
            color="#6366F1"
          />
          <div class="progress-box-meta">
            <span>{{ goalStore.currentGoal.completedMilestones }} / {{ goalStore.currentGoal.totalMilestones }} cột mốc đã hoàn thành</span>
            <span>Tiến độ tính tự động dựa trên các cột mốc</span>
          </div>
        </div>
      </div>

      <!-- Section: Milestones -->
      <div class="milestones-card">
        <div class="card-head">
          <h2 class="card-title">
            <span>🏁 Các cột mốc (Milestones)</span>
            <span class="count-badge">({{ goalStore.currentGoal.milestones?.length || 0 }} cột mốc)</span>
          </h2>
        </div>

        <!-- Milestones Checklist -->
        <div class="milestones-list">
          <div
            v-if="!goalStore.currentGoal.milestones || goalStore.currentGoal.milestones.length === 0"
            class="empty-milestones"
          >
            Chưa có cột mốc nào. Hãy thêm cột mốc đầu tiên bên dưới để chia nhỏ mục tiêu!
          </div>

          <div
            v-for="(m, index) in goalStore.currentGoal.milestones"
            :key="m.id"
            class="milestone-item"
            :class="{ completed: m.status === 'COMPLETED' }"
          >
            <div class="milestone-left">
              <button
                class="milestone-check"
                :class="{ checked: m.status === 'COMPLETED' }"
                @click="toggleMilestone(m)"
              >
                <el-icon v-if="m.status === 'COMPLETED'"><Check /></el-icon>
              </button>

              <div class="milestone-details">
                <div class="milestone-title-row">
                  <span class="step-num">Mốc {{ index + 1 }}</span>
                  <span class="step-title" :class="{ strike: m.status === 'COMPLETED' }">
                    {{ m.title }}
                  </span>
                </div>

                <p v-if="m.description" class="step-desc">
                  {{ m.description }}
                </p>

                <div v-if="m.dueDate" class="step-due">
                  <el-icon><Calendar /></el-icon>
                  <span>Hạn: {{ m.dueDate }}</span>
                </div>
              </div>
            </div>

            <div class="milestone-actions">
              <el-popconfirm
                title="Xóa cột mốc này?"
                confirm-button-text="Xóa"
                cancel-button-text="Hủy"
                confirm-button-type="danger"
                @confirm="goalStore.deleteMilestone(goalStore.currentGoal!.id, m.id)"
              >
                <template #reference>
                  <el-button circle size="small" text type="danger">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>

        <!-- Add Milestone Inline Form -->
        <div class="add-milestone-bar">
          <el-input
            v-model="newMilestoneTitle"
            placeholder="+ Tiêu đề cột mốc mới (Ví dụ: Đạt Reading 7.5, Tiết kiệm được 50 triệu...)"
            class="input-milestone-title"
            @keyup.enter="handleAddMilestone"
          />
          <el-date-picker
            v-model="newMilestoneDueDate"
            type="date"
            placeholder="Hạn cột mốc"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 170px"
          />
          <el-button type="primary" :icon="Plus" @click="handleAddMilestone">
            Thêm mốc
          </el-button>
        </div>
      </div>

      <!-- Section: Linked Tasks & Habits Grid -->
      <div class="linked-grid">
        <!-- Linked Tasks -->
        <div class="linked-card">
          <div class="card-head">
            <h3 class="card-title">
              <span>📋 Công việc liên kết</span>
              <span class="count-badge">({{ goalStore.currentGoal.linkedTasks?.length || 0 }})</span>
            </h3>
            <router-link to="/tasks" class="link-more">Quản lý tasks ➔</router-link>
          </div>

          <div
            v-if="!goalStore.currentGoal.linkedTasks || goalStore.currentGoal.linkedTasks.length === 0"
            class="empty-linked"
          >
            Chưa có công việc nào gắn với mục tiêu này.
          </div>

          <div v-else class="linked-items-list">
            <div
              v-for="task in goalStore.currentGoal.linkedTasks"
              :key="task.id"
              class="linked-item"
            >
              <div class="item-left">
                <span class="status-dot" :class="task.status === 'COMPLETED' ? 'green' : 'amber'" />
                <span class="item-title" :class="{ strike: task.status === 'COMPLETED' }">
                  {{ task.title }}
                </span>
              </div>
              <span class="item-meta">{{ task.status }}</span>
            </div>
          </div>
        </div>

        <!-- Linked Habits -->
        <div class="linked-card">
          <div class="card-head">
            <h3 class="card-title">
              <span>⚡ Thói quen hỗ trợ</span>
              <span class="count-badge">({{ goalStore.currentGoal.linkedHabits?.length || 0 }})</span>
            </h3>
            <router-link to="/habits" class="link-more">Quản lý thói quen ➔</router-link>
          </div>

          <div
            v-if="!goalStore.currentGoal.linkedHabits || goalStore.currentGoal.linkedHabits.length === 0"
            class="empty-linked"
          >
            Chưa có thói quen nào hỗ trợ mục tiêu này.
          </div>

          <div v-else class="linked-items-list">
            <div
              v-for="habit in goalStore.currentGoal.linkedHabits"
              :key="habit.id"
              class="linked-item"
            >
              <span class="item-title">
                🌿 {{ habit.name }}
              </span>
              <span class="habit-freq">
                {{ habit.frequency }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Goal Modal -->
    <el-dialog
      v-model="isEditModalOpen"
      title="Chỉnh sửa Mục tiêu"
      width="540px"
      destroy-on-close
    >
      <el-form ref="editFormRef" :model="editFormData" :rules="editFormRules" label-position="top">
        <el-form-item label="Tên mục tiêu" prop="title">
          <el-input v-model="editFormData.title" />
        </el-form-item>

        <el-form-item label="Mô tả" prop="description">
          <el-input v-model="editFormData.description" type="textarea" :rows="3" />
        </el-form-item>

        <div class="form-row-2">
          <el-form-item label="Lĩnh vực / Nhóm" prop="category">
            <el-select v-model="editFormData.category" style="width: 100%">
              <el-option label="💼 Sự nghiệp (CAREER)" value="CAREER" />
              <el-option label="📚 Học tập (LEARNING)" value="LEARNING" />
              <el-option label="💰 Tài chính (FINANCE)" value="FINANCE" />
              <el-option label="💪 Sức khỏe (HEALTH)" value="HEALTH" />
              <el-option label="🌱 Cá nhân (PERSONAL)" value="PERSONAL" />
              <el-option label="✨ Khác (OTHER)" value="OTHER" />
            </el-select>
          </el-form-item>

          <el-form-item label="Trạng thái" prop="status">
            <el-select v-model="editFormData.status" style="width: 100%">
              <el-option label="Chưa bắt đầu" value="NOT_STARTED" />
              <el-option label="Đang thực hiện" value="IN_PROGRESS" />
              <el-option label="Đã hoàn thành" value="COMPLETED" />
              <el-option label="Đã hủy" value="CANCELLED" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="Ngày bắt đầu" prop="startDate">
            <el-date-picker
              v-model="editFormData.startDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="Hạn dự kiến" prop="targetDate">
            <el-date-picker
              v-model="editFormData.targetDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isEditModalOpen = false">Hủy</el-button>
          <el-button type="primary" :loading="isSaving" @click="handleUpdateGoal">Lưu thay đổi</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Back,
  Edit,
  Delete,
  Calendar,
  Flag,
  CircleCheckFilled,
  Check,
  Plus
} from '@element-plus/icons-vue'
import { useGoalStore } from '@/stores/goal'
import type { Milestone, GoalCategory, GoalStatus, GoalPriority, GoalRequest } from '@/types/goal'
import { formatDateTime } from '@/utils/date'
import type { FormInstance, FormRules } from 'element-plus'

const route = useRoute()
const goalStore = useGoalStore()

const newMilestoneTitle = ref('')
const newMilestoneDueDate = ref('')

// Edit Goal Modal State
const isEditModalOpen = ref(false)
const isSaving = ref(false)
const editFormRef = ref<FormInstance>()
const editFormData = reactive<GoalRequest>({
  title: '',
  description: '',
  category: 'PERSONAL',
  priority: 'MEDIUM',
  status: 'NOT_STARTED',
  startDate: undefined,
  targetDate: undefined
})

const editFormRules: FormRules = {
  title: [{ required: true, message: 'Vui lòng nhập tên mục tiêu', trigger: 'blur' }]
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

function getPriorityLabel(priority: GoalPriority) {
  switch (priority) {
    case 'HIGH': return 'Ưu tiên cao'
    case 'MEDIUM': return 'Ưu tiên trung bình'
    case 'LOW': return 'Ưu tiên thấp'
  }
}

function getPriorityTagClass(priority: GoalPriority) {
  switch (priority) {
    case 'HIGH': return 'priority-high'
    case 'MEDIUM': return 'priority-medium'
    case 'LOW': return 'priority-low'
  }
}

async function toggleMilestone(m: Milestone) {
  const nextStatus = m.status === 'COMPLETED' ? 'TODO' : 'COMPLETED'
  await goalStore.updateMilestone(goalStore.currentGoal!.id, m.id, {
    title: m.title,
    dueDate: m.dueDate,
    status: nextStatus
  })
}

async function handleAddMilestone() {
  const title = newMilestoneTitle.value.trim()
  if (!title || !goalStore.currentGoal) return

  await goalStore.addMilestone(goalStore.currentGoal.id, {
    title,
    dueDate: newMilestoneDueDate.value || undefined,
    status: 'TODO'
  })

  newMilestoneTitle.value = ''
  newMilestoneDueDate.value = ''
}

function openEditGoalModal() {
  if (!goalStore.currentGoal) return
  Object.assign(editFormData, {
    title: goalStore.currentGoal.title,
    description: goalStore.currentGoal.description || '',
    category: goalStore.currentGoal.category,
    priority: goalStore.currentGoal.priority,
    status: goalStore.currentGoal.status,
    startDate: goalStore.currentGoal.startDate,
    targetDate: goalStore.currentGoal.targetDate
  })
  isEditModalOpen.value = true
}

async function handleUpdateGoal() {
  if (!editFormRef.value || !goalStore.currentGoal) return
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return
    isSaving.value = true
    try {
      await goalStore.updateGoal(goalStore.currentGoal!.id, editFormData)
      isEditModalOpen.value = false
    } finally {
      isSaving.value = false
    }
  })
}

onMounted(() => {
  const id = route.params.id as string
  if (id) {
    goalStore.fetchGoalById(id)
  }
})
</script>

<style scoped lang="scss">
.goal-detail-page {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .back-nav-bar {
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--app-text-muted);
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: #6366F1;
      }
    }
  }

  .loading-state {
    padding: 64px 0;
    display: flex;
    justify-content: center;
  }

  .detail-body {
    display: flex;
    flex-direction: column;
    gap: 20px;

    /* Goal Header Banner */
    .goal-banner-card {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 14px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      gap: 16px;

      .banner-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        flex-wrap: wrap;

        .banner-left {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .tags-group {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;

            .cat-pill {
              font-size: 0.75rem;
              font-weight: 700;
              padding: 3px 10px;
              border-radius: 6px;
              background: rgba(99, 102, 241, 0.15);
              color: #6366F1;
            }

            .status-pill {
              font-size: 0.75rem;
              font-weight: 600;
              padding: 3px 9px;
              border-radius: 6px;

              &.status-not-started { background: rgba(107, 114, 128, 0.1); color: var(--app-text-muted); }
              &.status-in-progress { background: rgba(245, 158, 11, 0.15); color: #D97706; }
              &.status-completed { background: rgba(16, 185, 129, 0.15); color: #059669; font-weight: 700; }
              &.status-cancelled { background: rgba(239, 68, 68, 0.12); color: #DC2626; }
            }

            .priority-pill {
              font-size: 0.75rem;
              font-weight: 600;
              padding: 3px 9px;
              border-radius: 6px;

              &.priority-high { background: rgba(239, 68, 68, 0.12); color: #DC2626; font-weight: 700; }
              &.priority-medium { background: rgba(245, 158, 11, 0.15); color: #D97706; }
              &.priority-low { background: rgba(107, 114, 128, 0.1); color: var(--app-text-muted); }
            }
          }

          .goal-title {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--app-text);
            line-height: 1.3;
          }

          .goal-desc {
            font-size: 0.875rem;
            color: var(--app-text-muted);
            max-width: 650px;
            white-space: pre-line;
            line-height: 1.5;
          }
        }
      }

      .banner-dates-row {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        font-size: 0.75rem;
        color: var(--app-text-muted);
        padding-top: 10px;
        border-top: 1px solid var(--app-card-border);

        .date-item {
          display: flex;
          align-items: center;
          gap: 6px;

          &.is-overdue {
            color: #EF4444;
            font-weight: 700;

            .overdue-tag {
              color: #EF4444;
            }
          }

          &.is-completed {
            color: #10B981;
            font-weight: 600;
          }
        }
      }

      .progress-box {
        background: rgba(0, 0, 0, 0.02);
        border: 1px solid var(--app-card-border);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .progress-box-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .progress-box-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--app-text);
          }

          .progress-box-pct {
            font-size: 1.125rem;
            font-weight: 800;
            color: #6366F1;
          }
        }

        .progress-box-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--app-text-muted);
        }
      }
    }

    /* Milestones Card */
    .milestones-card {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 14px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      gap: 16px;

      .card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .card-title {
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--app-text);
          display: flex;
          align-items: center;
          gap: 8px;

          .count-badge {
            font-size: 0.75rem;
            font-weight: 500;
            color: var(--app-text-muted);
          }
        }
      }

      .milestones-list {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .empty-milestones {
          text-align: center;
          padding: 28px 0;
          font-size: 0.875rem;
          color: var(--app-text-muted);
        }

        .milestone-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid var(--app-card-border);
          background: var(--app-card-bg);
          transition: all 0.2s;

          &:hover {
            border-color: rgba(99, 102, 241, 0.4);
          }

          &.completed {
            opacity: 0.65;
            background: rgba(0, 0, 0, 0.015);
          }

          .milestone-left {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            flex: 1;
            min-width: 0;

            .milestone-check {
              width: 22px;
              height: 22px;
              border-radius: 6px;
              border: 1.5px solid var(--app-card-border);
              background: transparent;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              color: #FFFFFF;
              font-size: 0.875rem;
              margin-top: 1px;
              flex-shrink: 0;
              transition: all 0.2s;

              &:hover {
                border-color: #10B981;
              }

              &.checked {
                background: #10B981;
                border-color: #10B981;
              }
            }

            .milestone-details {
              display: flex;
              flex-direction: column;
              gap: 3px;
              flex: 1;
              min-width: 0;

              .milestone-title-row {
                display: flex;
                align-items: center;
                gap: 8px;

                .step-num {
                  font-size: 0.6875rem;
                  font-weight: 700;
                  padding: 1px 6px;
                  border-radius: 4px;
                  background: rgba(0, 0, 0, 0.06);
                  color: var(--app-text-muted);
                }

                .step-title {
                  font-size: 0.875rem;
                  font-weight: 600;
                  color: var(--app-text);

                  &.strike {
                    text-decoration: line-through;
                    color: var(--app-text-muted);
                  }
                }
              }

              .step-desc {
                font-size: 0.75rem;
                color: var(--app-text-muted);
              }

              .step-due {
                font-size: 0.6875rem;
                color: var(--app-text-muted);
                display: flex;
                align-items: center;
                gap: 4px;
              }
            }
          }

          .milestone-actions {
            flex-shrink: 0;
          }
        }
      }

      .add-milestone-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding-top: 12px;
        border-top: 1px solid var(--app-card-border);
        flex-wrap: wrap;

        .input-milestone-title {
          flex: 1;
          min-width: 200px;
        }
      }
    }

    /* Linked Tasks & Habits Grid */
    .linked-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }

      .linked-card {
        background: var(--app-card-bg);
        border: 1px solid var(--app-card-border);
        border-radius: 14px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        display: flex;
        flex-direction: column;
        gap: 12px;

        .card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .card-title {
            font-size: 0.9375rem;
            font-weight: 700;
            color: var(--app-text);
            display: flex;
            align-items: center;
            gap: 6px;

            .count-badge {
              font-size: 0.75rem;
              font-weight: 500;
              color: var(--app-text-muted);
            }
          }

          .link-more {
            font-size: 0.75rem;
            font-weight: 600;
            color: #6366F1;
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .empty-linked {
          text-align: center;
          padding: 24px 0;
          font-size: 0.75rem;
          color: var(--app-text-muted);
        }

        .linked-items-list {
          display: flex;
          flex-direction: column;
          gap: 6px;

          .linked-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 8px 10px;
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.02);
            font-size: 0.8125rem;

            .item-left {
              display: flex;
              align-items: center;
              gap: 8px;
              min-width: 0;
              flex: 1;

              .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                flex-shrink: 0;

                &.green { background: #10B981; }
                &.amber { background: #F59E0B; }
              }

              .item-title {
                color: var(--app-text);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;

                &.strike {
                  text-decoration: line-through;
                  color: var(--app-text-muted);
                }
              }
            }

            .item-title {
              color: var(--app-text);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .item-meta {
              font-size: 0.6875rem;
              color: var(--app-text-muted);
              flex-shrink: 0;
            }

            .habit-freq {
              font-size: 0.6875rem;
              font-weight: 700;
              color: #D97706;
              flex-shrink: 0;
            }
          }
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

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>

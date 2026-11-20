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
                <span class="progress-label">Tiến độ cột mốc</span>
                <span class="progress-pct">{{ goal.progressPercentage }}%</span>
              </div>
              <el-progress
                :percentage="goal.progressPercentage"
                :show-text="false"
                :stroke-width="8"
                :color="getProgressColor(goal.progressPercentage)"
              />
              <div class="progress-meta">
                <span>{{ goal.completedMilestones }}/{{ goal.totalMilestones }} cột mốc</span>
                <span v-if="goal.targetDate" :class="{ 'meta-overdue': goal.isOverdue }">
                  Hạn: {{ goal.targetDate }}
                </span>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="card-footer-row">
            <router-link :to="'/goals/' + goal.id" class="detail-link">
              <span>Xem chi tiết & Cột mốc</span>
              <el-icon><ArrowRight /></el-icon>
            </router-link>

            <div class="action-buttons">
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

    <!-- Create / Edit Goal Modal -->
    <el-dialog
      v-model="isModalOpen"
      :title="isEditMode ? 'Chỉnh sửa Mục tiêu' : 'Tạo Mục tiêu mới'"
      width="540px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top">
        <el-form-item label="Tên mục tiêu" prop="title">
          <el-input v-model="formData.title" placeholder="Ví dụ: Đạt IELTS 7.0, Tiết kiệm 100 triệu, Nâng cao kỹ năng Spring Boot..." />
        </el-form-item>

        <el-form-item label="Mô tả mục tiêu" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="Mục đích, ý nghĩa và tiêu chí hoàn thành..." />
        </el-form-item>

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
import { ref, reactive, onMounted } from 'vue'
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
import type { Goal, GoalRequest, GoalCategory, GoalStatus } from '@/types/goal'
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
  startDate: new Date().toISOString().substring(0, 10),
  targetDate: undefined
})

const formRules: FormRules = {
  title: [{ required: true, message: 'Vui lòng nhập tiêu đề mục tiêu', trigger: 'blur' }]
}

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

function openCreateModal() {
  isEditMode.value = false
  currentGoalId.value = null
  Object.assign(formData, {
    title: '',
    description: '',
    category: 'PERSONAL',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
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
  gap: 20px;

  .w-full {
    width: 100%;
  }

  /* Header Section */
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
      }
    }
  }

  /* Statistics Cards */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }

    .stat-box {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      transition: all 0.2s;

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
    padding-bottom: 4px;

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
      transition: all 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.03);
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
        transition: all 0.2s ease;

        &:hover {
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateY(-1px);
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

              .meta-overdue {
                color: #EF4444;
                font-weight: 700;
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

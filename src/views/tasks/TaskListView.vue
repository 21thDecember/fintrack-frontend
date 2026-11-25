<template>
  <div class="tasks-page">
    <!-- Header Section -->
    <div class="page-top-bar">
      <div class="title-group">
        <h1 class="page-title">
          Quản lý Công việc
          <span class="lifeos-pill">LifeOS</span>
        </h1>
        <p class="page-subtitle">
          Lập kế hoạch, theo dõi hạn chót và quản lý tiến độ từng nhiệm vụ
        </p>
      </div>

      <div class="action-group">
        <el-button type="primary" :icon="Plus" @click="openCreateModal()">
          Tạo công việc
        </el-button>
      </div>
    </div>

    <!-- Statistics Cards (4 Cards) -->
    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-top">
          <span class="stat-label">Tổng công việc</span>
          <div class="stat-icon-wrap blue">
            <el-icon><List /></el-icon>
          </div>
        </div>
        <div class="stat-main">
          <span class="stat-num">{{ taskStore.statistics?.totalTasks || 0 }}</span>
          <span class="stat-unit">nhiệm vụ</span>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-top">
          <span class="stat-label">Cần làm & Đang làm</span>
          <div class="stat-icon-wrap amber">
            <el-icon><Clock /></el-icon>
          </div>
        </div>
        <div class="stat-main">
          <span class="stat-num amber">{{ (taskStore.statistics?.todoTasks || 0) + (taskStore.statistics?.inProgressTasks || 0) }}</span>
          <span class="stat-unit">chưa xong</span>
        </div>
      </div>

      <div class="stat-box" :class="{ 'has-overdue': (taskStore.statistics?.overdueTasks || 0) > 0 }">
        <div class="stat-top">
          <span class="stat-label">Quá hạn</span>
          <div class="stat-icon-wrap red">
            <el-icon><Warning /></el-icon>
          </div>
        </div>
        <div class="stat-main">
          <span class="stat-num red">{{ taskStore.statistics?.overdueTasks || 0 }}</span>
          <span v-if="(taskStore.statistics?.overdueTasks || 0) > 0" class="stat-alert-text">Cần xử lý!</span>
          <span v-else class="stat-unit">đúng hạn</span>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-top">
          <span class="stat-label">Đã hoàn thành</span>
          <div class="stat-icon-wrap green">
            <el-icon><CircleCheckFilled /></el-icon>
          </div>
        </div>
        <div class="stat-main">
          <span class="stat-num green">{{ taskStore.statistics?.completedTasks || 0 }}</span>
          <span class="stat-rate">({{ taskStore.statistics?.completionRate || 0 }}%)</span>
        </div>
      </div>
    </div>

    <!-- Toolbar: View Tabs & Filters -->
    <div class="toolbar-card">
      <!-- Preset View Tabs -->
      <div class="view-tabs">
        <button
          v-for="tab in viewTabs"
          :key="tab.id"
          class="tab-btn"
          :class="[tab.id, { active: taskStore.activeView === tab.id }]"
          @click="changeView(tab.id as any)"
        >
          <el-icon :size="16" class="tab-el-icon" :class="tab.iconClass">
            <component :is="tab.icon" />
          </el-icon>
          <span class="tab-text">{{ tab.label }}</span>
        </button>
      </div>

      <!-- Filters Row -->
      <div class="filter-controls">
        <el-input
          v-model="taskStore.filters.keyword"
          placeholder="Tìm kiếm công việc..."
          :prefix-icon="Search"
          clearable
          class="filter-search"
          @input="debouncedSearch"
        />

        <el-select
          v-model="taskStore.filters.priority"
          placeholder="Độ ưu tiên"
          clearable
          class="filter-select"
          @change="taskStore.fetchTasks(1)"
        >
          <el-option label="Tất cả độ ưu tiên" value="" />
          <el-option label="🔴 Ưu tiên cao" value="HIGH" />
          <el-option label="🟡 Ưu tiên trung bình" value="MEDIUM" />
          <el-option label="⚪ Ưu tiên thấp" value="LOW" />
        </el-select>

        <el-select
          v-model="taskStore.filters.status"
          placeholder="Trạng thái"
          clearable
          class="filter-select"
          @change="taskStore.fetchTasks(1)"
        >
          <el-option label="Tất cả trạng thái" value="" />
          <el-option label="Chưa thực hiện (TODO)" value="TODO" />
          <el-option label="Đang làm (IN_PROGRESS)" value="IN_PROGRESS" />
          <el-option label="Đã hoàn thành (COMPLETED)" value="COMPLETED" />
          <el-option label="Đã hủy (CANCELLED)" value="CANCELLED" />
        </el-select>

        <el-button class="filter-reset-btn" @click="resetFilters">
          Đặt lại lọc
        </el-button>
      </div>
    </div>

    <!-- Tasks List Container -->
    <div class="tasks-container">
      <!-- Loading State -->
      <div v-if="taskStore.loading" class="loading-state">
        <el-loading :loading="true" />
      </div>

      <!-- Empty State -->
      <div v-else-if="taskStore.tasks.length === 0" class="empty-state-card">
        <div class="empty-icon">✨</div>
        <h3 class="empty-title">Không có công việc nào</h3>
        <p class="empty-desc">
          {{ taskStore.activeView === 'today' ? 'Tuyệt vời! Bạn không còn công việc nào cần xử lý hôm nay.' : 'Chưa có công việc nào phù hợp với bộ lọc hiện tại.' }}
        </p>
        <div class="empty-action">
          <el-button type="primary" :icon="Plus" @click="openCreateModal()">
            Thêm công việc mới
          </el-button>
        </div>
      </div>

      <!-- Task Cards -->
      <div v-else class="tasks-card-list">
        <div
          v-for="task in taskStore.tasks"
          :key="task.id"
          class="task-row-card"
          :class="{ completed: task.status === 'COMPLETED', cancelled: task.status === 'CANCELLED' }"
        >
          <div class="task-row-main">
            <!-- Custom Checkbox -->
            <button
              class="check-circle"
              :class="{ checked: task.status === 'COMPLETED' }"
              :title="task.status === 'COMPLETED' ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'"
              @click="toggleTaskStatus(task)"
            >
              <el-icon v-if="task.status === 'COMPLETED'"><Check /></el-icon>
            </button>

            <!-- Task Info -->
            <div class="task-info">
              <div class="task-header-line">
                <span class="task-title" :class="{ strike: task.status === 'COMPLETED' }">
                  {{ task.title }}
                </span>

                <!-- Priority Badge -->
                <span class="tag-badge" :class="task.priority.toLowerCase()">
                  {{ getPriorityLabel(task.priority) }}
                </span>

                <!-- In progress or cancelled status -->
                <span v-if="task.status === 'IN_PROGRESS'" class="tag-badge in-progress">
                  Đang làm
                </span>
                <span v-else-if="task.status === 'CANCELLED'" class="tag-badge cancelled">
                  Đã hủy
                </span>
              </div>

              <!-- Description -->
              <p v-if="task.description" class="task-desc">
                {{ task.description }}
              </p>

              <!-- Meta pills -->
              <div class="task-meta-row">
                <div v-if="task.dueDate" class="meta-pill" :class="{ overdue: task.isOverdue }">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ formatDateTime(task.dueDate) }}</span>
                  <strong v-if="task.isOverdue" class="overdue-text">(Quá hạn)</strong>
                </div>

                <div v-if="task.estimatedMinutes" class="meta-pill gray">
                  <el-icon><Timer /></el-icon>
                  <span>{{ task.estimatedMinutes }} phút</span>
                </div>

                <div v-if="task.goalTitle" class="meta-pill goal">
                  <span>🎯 {{ task.goalTitle }}</span>
                </div>

                <!-- Subtasks toggle -->
                <button
                  v-if="task.subtaskCount > 0 || expandedSubtasks.includes(task.id)"
                  class="meta-pill subtask-btn"
                  @click="toggleExpandSubtasks(task.id)"
                >
                  <el-icon><Folder /></el-icon>
                  <span>{{ task.completedSubtaskCount }}/{{ task.subtaskCount }} việc phụ</span>
                  <el-icon class="arrow-icon" :class="{ rotated: expandedSubtasks.includes(task.id) }">
                    <ArrowDown />
                  </el-icon>
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="task-actions">
              <el-button circle size="small" text title="Thêm việc phụ" @click="openAddSubtask(task)">
                <el-icon><Plus /></el-icon>
              </el-button>

              <el-button circle size="small" text title="Sửa" @click="openEditModal(task)">
                <el-icon><Edit /></el-icon>
              </el-button>

              <el-popconfirm
                title="Bạn có chắc chắn muốn xóa công việc này?"
                confirm-button-text="Xóa"
                cancel-button-text="Hủy"
                confirm-button-type="danger"
                @confirm="handleDelete(task.id)"
              >
                <template #reference>
                  <el-button circle size="small" text type="danger" title="Xóa">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>

          <!-- Subtasks Expansion Section -->
          <div v-if="expandedSubtasks.includes(task.id)" class="subtasks-wrapper">
            <div
              v-for="sub in task.subtasks"
              :key="sub.id"
              class="subtask-row"
            >
              <div class="subtask-left">
                <button
                  class="subtask-check"
                  :class="{ checked: sub.status === 'COMPLETED' }"
                  @click="taskStore.toggleSubtask(task, sub)"
                >
                  <el-icon v-if="sub.status === 'COMPLETED'"><Check /></el-icon>
                </button>
                <span class="subtask-title" :class="{ strike: sub.status === 'COMPLETED' }">
                  {{ sub.title }}
                </span>
              </div>

              <div class="subtask-right">
                <el-popconfirm
                  title="Xóa việc phụ này?"
                  confirm-button-text="Xóa"
                  cancel-button-text="Hủy"
                  @confirm="handleDeleteSubtask(sub.id)"
                >
                  <template #reference>
                    <button class="subtask-delete-btn">
                      <el-icon><Close /></el-icon>
                    </button>
                  </template>
                </el-popconfirm>
              </div>
            </div>

            <!-- Quick Add Subtask Input -->
            <div class="quick-subtask-bar">
              <el-input
                v-model="quickSubtaskTitles[task.id]"
                size="small"
                placeholder="+ Thêm việc phụ mới (Nhấn Enter để lưu)..."
                @keyup.enter="handleQuickAddSubtask(task)"
              >
                <template #append>
                  <el-button size="small" @click="handleQuickAddSubtask(task)">Thêm</el-button>
                </template>
              </el-input>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="taskStore.totalPages > 1" class="pagination-bar">
        <el-pagination
          v-model:current-page="taskStore.currentPage"
          :page-size="taskStore.pageSize"
          :total="taskStore.totalElements"
          layout="prev, pager, next"
          background
          @current-change="taskStore.fetchTasks"
        />
      </div>
    </div>

    <!-- Create / Edit Task Modal -->
    <el-dialog
      v-model="isModalOpen"
      :title="isEditMode ? 'Chỉnh sửa Công việc' : 'Tạo Công việc mới'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top">
        <el-form-item label="Tiêu đề công việc" prop="title">
          <el-input v-model="formData.title" placeholder="Nhập tên việc cần làm..." maxlength="255" show-word-limit />
        </el-form-item>

        <el-form-item label="Mô tả chi tiết" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="Ghi chú thêm thông tin hoặc các bước thực hiện..."
          />
        </el-form-item>

        <div class="form-row-2">
          <el-form-item label="Độ ưu tiên" prop="priority">
            <el-select v-model="formData.priority" style="width: 100%;">
              <el-option label="🔴 Ưu tiên cao (HIGH)" value="HIGH" />
              <el-option label="🟡 Ưu tiên trung bình (MEDIUM)" value="MEDIUM" />
              <el-option label="⚪ Ưu tiên thấp (LOW)" value="LOW" />
            </el-select>
          </el-form-item>

          <el-form-item label="Trạng thái" prop="status">
            <el-select v-model="formData.status" style="width: 100%;">
              <el-option label="Chưa làm (TODO)" value="TODO" />
              <el-option label="Đang làm (IN_PROGRESS)" value="IN_PROGRESS" />
              <el-option label="Đã hoàn thành (COMPLETED)" value="COMPLETED" />
              <el-option label="Đã hủy (CANCELLED)" value="CANCELLED" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="Ngày bắt đầu" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              type="datetime"
              placeholder="Chọn thời điểm bắt đầu"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DDTHH:mm:ssZ"
              style="width: 100%;"
            />
          </el-form-item>

          <el-form-item label="Hạn hoàn thành (Deadline)" prop="dueDate">
            <el-date-picker
              v-model="formData.dueDate"
              type="datetime"
              placeholder="Chọn hạn chót"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DDTHH:mm:ssZ"
              style="width: 100%;"
            />
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="Thời gian dự kiến (phút)" prop="estimatedMinutes">
            <el-input-number
              v-model="formData.estimatedMinutes"
              :min="0"
              :step="15"
              style="width: 100%;"
              placeholder="Số phút"
            />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isModalOpen = false">Hủy</el-button>
          <el-button type="primary" :loading="isSaving" @click="handleSaveTask">
            {{ isEditMode ? 'Lưu thay đổi' : 'Tạo công việc' }}
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
  Search,
  List,
  Clock,
  Warning,
  WarningFilled,
  CircleCheckFilled,
  Calendar,
  Timer,
  Folder,
  ArrowDown,
  Edit,
  Delete,
  Check,
  Close,
  Collection
} from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/task'
import type { Task, TaskRequest, TaskPriority, TaskStatus } from '@/types/task'
import { formatDateTime } from '@/utils/date'
import type { FormInstance, FormRules } from 'element-plus'

const taskStore = useTaskStore()

const viewTabs = [
  { id: 'today', label: 'Hôm nay', icon: Calendar, iconClass: 'icon-today' },
  { id: 'upcoming', label: 'Sắp tới', icon: Timer, iconClass: 'icon-upcoming' },
  { id: 'overdue', label: 'Quá hạn', icon: WarningFilled, iconClass: 'icon-overdue' },
  { id: 'completed', label: 'Đã xong', icon: CircleCheckFilled, iconClass: 'icon-completed' },
  { id: 'all', label: 'Tất cả', icon: Collection, iconClass: 'icon-all' }
]

const expandedSubtasks = ref<string[]>([])
const quickSubtaskTitles = reactive<Record<string, string>>({})

// Create / Edit modal state
const isModalOpen = ref(false)
const isEditMode = ref(false)
const currentTaskId = ref<string | null>(null)
const isSaving = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive<TaskRequest>({
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'TODO',
  startDate: undefined,
  dueDate: undefined,
  estimatedMinutes: undefined,
  goalId: undefined,
  parentTaskId: undefined
})

const formRules: FormRules = {
  title: [{ required: true, message: 'Vui lòng nhập tiêu đề công việc', trigger: 'blur' }]
}

let searchTimeout: any = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    taskStore.fetchTasks(1)
  }, 300)
}

function changeView(view: any) {
  taskStore.activeView = view
  taskStore.fetchTasks(1)
}

function resetFilters() {
  taskStore.filters.keyword = ''
  taskStore.filters.priority = undefined
  taskStore.filters.status = undefined
  taskStore.fetchTasks(1)
}

function getPriorityLabel(priority: TaskPriority) {
  switch (priority) {
    case 'HIGH': return 'Cao'
    case 'MEDIUM': return 'Trung bình'
    case 'LOW': return 'Thấp'
  }
}

async function toggleTaskStatus(task: Task) {
  const nextStatus: TaskStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED'
  await taskStore.updateStatus(task.id, nextStatus)
}

function toggleExpandSubtasks(taskId: string) {
  const index = expandedSubtasks.value.indexOf(taskId)
  if (index > -1) {
    expandedSubtasks.value.splice(index, 1)
  } else {
    expandedSubtasks.value.push(taskId)
  }
}

function openCreateModal() {
  isEditMode.value = false
  currentTaskId.value = null
  Object.assign(formData, {
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    startDate: undefined,
    dueDate: undefined,
    estimatedMinutes: undefined,
    goalId: undefined,
    parentTaskId: undefined
  })
  isModalOpen.value = true
}

function openEditModal(task: Task) {
  isEditMode.value = true
  currentTaskId.value = task.id
  Object.assign(formData, {
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status,
    startDate: task.startDate,
    dueDate: task.dueDate,
    estimatedMinutes: task.estimatedMinutes,
    goalId: task.goalId,
    parentTaskId: task.parentTaskId
  })
  isModalOpen.value = true
}

function openAddSubtask(task: Task) {
  if (!expandedSubtasks.value.includes(task.id)) {
    expandedSubtasks.value.push(task.id)
  }
}

async function handleQuickAddSubtask(parentTask: Task) {
  const title = (quickSubtaskTitles[parentTask.id] || '').trim()
  if (!title) return

  await taskStore.createTask({
    title,
    parentTaskId: parentTask.id,
    priority: parentTask.priority,
    status: 'TODO'
  })
  quickSubtaskTitles[parentTask.id] = ''
}

async function handleDeleteSubtask(subtaskId: string) {
  await taskStore.deleteTask(subtaskId)
}

async function handleDelete(taskId: string) {
  await taskStore.deleteTask(taskId)
}

async function handleSaveTask() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    isSaving.value = true
    try {
      if (isEditMode.value && currentTaskId.value) {
        await taskStore.updateTask(currentTaskId.value, formData)
      } else {
        await taskStore.createTask(formData)
      }
      isModalOpen.value = false
    } finally {
      isSaving.value = false
    }
  })
}

onMounted(() => {
  taskStore.fetchTasks()
  taskStore.fetchStatistics()
})
</script>

<style scoped lang="scss">
.tasks-page {
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
          background: rgba(16, 185, 129, 0.12);
          color: #10B981;
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

  // Stats 4-box row
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
          .stat-num {
            font-size: 1.1875rem !important;
          }
          .stat-unit,
          .stat-alert-text,
          .stat-rate {
            font-size: 0.6875rem !important;
          }
        }
      }
    }

    .stat-box {
      min-width: 0;
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;

      &:hover {
        border-color: rgba(16, 185, 129, 0.4);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      }

      &.has-overdue {
        border-color: rgba(239, 68, 68, 0.3);
        background: rgba(239, 68, 68, 0.03);
      }

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
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

          &.blue { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
          &.amber { background: rgba(245, 158, 11, 0.12); color: #F59E0B; }
          &.red { background: rgba(239, 68, 68, 0.12); color: #EF4444; }
          &.green { background: rgba(16, 185, 129, 0.12); color: #10B981; }
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
          &.red { color: #EF4444; }
          &.green { color: #10B981; }
        }

        .stat-unit {
          font-size: 0.75rem;
          color: var(--app-text-muted);
        }

        .stat-alert-text {
          font-size: 0.75rem;
          font-weight: 700;
          color: #EF4444;
        }

        .stat-rate {
          font-size: 0.75rem;
          font-weight: 700;
          color: #10B981;
        }
      }
    }
  }

  // Toolbar
  .toolbar-card {
    background: var(--app-card-bg);
    border: 1px solid var(--app-card-border);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;

    .view-tabs {
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
      border-bottom: 1px solid var(--app-card-border);

      .tab-btn {
        padding: 7px 14px;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        background: transparent;
        border: none;
        color: var(--app-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 7px;
        white-space: nowrap;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

        &:active {
          transform: scale(0.96);
        }

        .tab-el-icon {
          font-size: 1rem;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);

          &.icon-today { color: #3B82F6; }
          &.icon-upcoming { color: #8B5CF6; }
          &.icon-overdue { color: #EF4444; }
          &.icon-completed { color: #10B981; }
          &.icon-all { color: var(--app-text-muted); }
        }

        &:hover {
          background: rgba(0, 0, 0, 0.04);
          color: var(--app-text);

          .tab-el-icon {
            transform: scale(1.15);
          }
        }

        &.active {
          font-weight: 700;

          &.today {
            background: rgba(59, 130, 246, 0.12);
            color: #3B82F6;
            .tab-el-icon { color: #3B82F6; }
          }
          &.upcoming {
            background: rgba(139, 92, 246, 0.12);
            color: #8B5CF6;
            .tab-el-icon { color: #8B5CF6; }
          }
          &.overdue {
            background: rgba(239, 68, 68, 0.12);
            color: #EF4444;
            .tab-el-icon { color: #EF4444; }
          }
          &.completed {
            background: rgba(16, 185, 129, 0.12);
            color: #10B981;
            .tab-el-icon { color: #10B981; }
          }
          &.all {
            background: rgba(99, 102, 241, 0.12);
            color: #6366F1;
            .tab-el-icon { color: #6366F1; }
          }
        }
      }
    }

    .filter-controls {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 12px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
  }

  // Tasks container
  .tasks-container {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .empty-state-card {
      background: var(--app-card-bg);
      border: 1px solid var(--app-card-border);
      border-radius: 12px;
      padding: 48px 24px;
      text-align: center;

      .empty-icon { font-size: 2.5rem; margin-bottom: 12px; }
      .empty-title { font-size: 1.125rem; font-weight: 700; color: var(--app-text); }
      .empty-desc { font-size: 0.875rem; color: var(--app-text-muted); margin-top: 4px; }
      .empty-action { margin-top: 20px; }
    }

    .tasks-card-list {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .task-row-card {
        background: var(--app-card-bg);
        border: 1px solid var(--app-card-border);
        border-radius: 10px;
        padding: 12px 16px;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;

        &:hover {
          border-color: rgba(16, 185, 129, 0.4);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        }

        &.completed {
          opacity: 0.7;
        }

        .task-row-main {
          display: flex;
          align-items: flex-start;
          gap: 14px;

          .check-circle {
            width: 22px;
            height: 22px;
            border-radius: 6px;
            border: 2px solid var(--app-card-border);
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            margin-top: 2px;
            flex-shrink: 0;
            color: #FFFFFF;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

            &:hover {
              border-color: #10B981;
              transform: scale(1.08);
            }

            &:active {
              transform: scale(0.85);
            }

            &.checked {
              background: #10B981;
              border-color: #10B981;
            }
          }

          .task-info {
            flex: 1;
            min-width: 0;

            .task-header-line {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 8px;

              .task-title {
                font-size: 0.9375rem;
                font-weight: 600;
                color: var(--app-text);

                &.strike {
                  text-decoration: line-through;
                  color: var(--app-text-muted);
                }
              }

              .tag-badge {
                font-size: 0.6875rem;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;

                &.high { background: rgba(239, 68, 68, 0.12); color: #EF4444; }
                &.medium { background: rgba(245, 158, 11, 0.12); color: #F59E0B; }
                &.low { background: rgba(100, 116, 139, 0.12); color: #64748B; }
                &.in-progress { background: rgba(245, 158, 11, 0.15); color: #D97706; }
                &.cancelled { background: rgba(156, 163, 175, 0.2); color: #6B7280; }
              }
            }

            .task-desc {
              font-size: 0.8125rem;
              color: var(--app-text-muted);
              margin-top: 4px;
              white-space: pre-line;
            }

            .task-meta-row {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 10px;
              margin-top: 8px;

              .meta-pill {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 0.75rem;
                font-weight: 500;
                padding: 2px 8px;
                border-radius: 6px;
                background: rgba(0, 0, 0, 0.04);
                color: var(--app-text-muted);

                &.overdue {
                  background: rgba(239, 68, 68, 0.1);
                  color: #EF4444;
                  font-weight: 600;
                }

                &.goal {
                  color: #10B981;
                  font-weight: 600;
                  background: rgba(16, 185, 129, 0.1);
                }

                &.subtask-btn {
                  cursor: pointer;
                  border: none;
                  background: rgba(0, 0, 0, 0.05);
                  transition: background 0.2s;

                  &:hover {
                    background: rgba(0, 0, 0, 0.1);
                  }

                  .arrow-icon {
                    transition: transform 0.2s;
                    &.rotated {
                      transform: rotate(180deg);
                    }
                  }
                }
              }
            }
          }

          .task-actions {
            display: flex;
            align-items: center;
            gap: 2px;
            flex-shrink: 0;
          }
        }

        .subtasks-wrapper {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid var(--app-card-border);
          padding-left: 36px;
          display: flex;
          flex-direction: column;
          gap: 6px;

          .subtask-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.8125rem;

            &:hover {
              background: rgba(0, 0, 0, 0.03);
            }

            .subtask-left {
              display: flex;
              align-items: center;
              gap: 8px;

              .subtask-check {
                width: 16px;
                height: 16px;
                border-radius: 4px;
                border: 1.5px solid var(--app-card-border);
                background: transparent;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #FFFFFF;

                &.checked {
                  background: #10B981;
                  border-color: #10B981;
                }
              }

              .subtask-title {
                color: var(--app-text);
                &.strike {
                  text-decoration: line-through;
                  color: var(--app-text-muted);
                }
              }
            }

            .subtask-right {
              .subtask-delete-btn {
                background: transparent;
                border: none;
                color: var(--app-text-muted);
                cursor: pointer;
                padding: 2px;

                &:hover {
                  color: #EF4444;
                }
              }
            }
          }

          .quick-subtask-bar {
            margin-top: 6px;
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

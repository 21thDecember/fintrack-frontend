<template>
  <div class="courses-page">
    <!-- Page Header & Sub Navigation -->
    <div class="page-top-bar">
      <div class="title-col">
        <h1 class="page-title">
          <span>Khóa học</span>
          <el-tag size="small" effect="plain" type="primary" round class="module-badge">LifeOS</el-tag>
        </h1>
        <p class="page-desc">Quản lý các khóa học đang theo đuổi, theo dõi tiến độ bài học và thời gian học tập.</p>
      </div>

      <div class="top-nav-actions">
        <router-link to="/learning/overview" class="subnav-link">
          <el-button round size="default">
            <el-icon><DataAnalysis /></el-icon>
            Tổng quan
          </el-button>
        </router-link>
        <router-link to="/learning/courses" class="subnav-link active">
          <el-button round type="primary" size="default">
            <el-icon><VideoPlay /></el-icon>
            Khóa học
          </el-button>
        </router-link>
        <router-link to="/learning/books" class="subnav-link">
          <el-button round size="default">
            <el-icon><Reading /></el-icon>
            Sách
          </el-button>
        </router-link>
        <router-link to="/learning/skills" class="subnav-link">
          <el-button round size="default">
            <el-icon><Aim /></el-icon>
            Kỹ năng
          </el-button>
        </router-link>
        <router-link to="/learning/sessions" class="subnav-link">
          <el-button round size="default">
            <el-icon><Timer /></el-icon>
            Lịch sử học
          </el-button>
        </router-link>
        <el-button type="primary" round size="default" :icon="Plus" @click="openCreateModal">
          Thêm khóa học
        </el-button>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="filter-card">
      <div class="status-tabs-wrap">
        <el-radio-group v-model="selectedStatus" size="default" @change="handleFilterChange">
          <el-radio-button :value="''">Tất cả</el-radio-button>
          <el-radio-button value="IN_PROGRESS">Đang học</el-radio-button>
          <el-radio-button value="PLANNED">Dự định</el-radio-button>
          <el-radio-button value="COMPLETED">Đã xong</el-radio-button>
          <el-radio-button value="PAUSED">Tạm dừng</el-radio-button>
          <el-radio-button value="CANCELLED">Đã hủy</el-radio-button>
        </el-radio-group>
      </div>

      <div class="search-inputs">
        <el-input
          v-model="searchKeyword"
          placeholder="Tìm theo tên khóa học, nhà cung cấp..."
          clearable
          style="width: 260px"
          @input="handleFilterChange"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-input
          v-model="searchCategory"
          placeholder="Danh mục..."
          clearable
          style="width: 150px"
          @input="handleFilterChange"
        />
      </div>
    </div>

    <!-- Courses Grid -->
    <div v-loading="loading" class="courses-grid">
      <div v-if="!courses.length" class="empty-state">
        <el-empty description="Không tìm thấy khóa học nào phù hợp">
          <el-button type="primary" round @click="openCreateModal">Thêm khóa học mới</el-button>
        </el-empty>
      </div>

      <div
        v-for="c in courses"
        :key="c.id"
        class="course-card"
      >
        <div class="card-top">
          <div class="title-row">
            <h3 class="course-title">{{ c.title }}</h3>
            <el-tag :type="getStatusTagType(c.status)" size="small" effect="light" round>
              {{ getStatusLabel(c.status) }}
            </el-tag>
          </div>
          <span v-if="c.provider" class="course-provider">
            <el-icon><School /></el-icon> {{ c.provider }}
          </span>
          <p v-if="c.description" class="course-desc">{{ c.description }}</p>
        </div>

        <!-- Lessons Progress -->
        <div class="progress-section">
          <div v-if="c.totalLessons && c.totalLessons > 0" class="progress-details">
            <div class="prog-labels">
              <span>Tiến độ bài học: <strong>{{ c.completedLessons }}/{{ c.totalLessons }} bài</strong></span>
              <span class="prog-percent">{{ c.progressPercent }}%</span>
            </div>
            <el-progress :percentage="c.progressPercent || 0" :show-text="false" :stroke-width="8" />
          </div>
          <div v-else class="no-lessons-info">
            <span class="text-muted">Chưa cấu hình số bài học</span>
          </div>
        </div>

        <!-- Meta info -->
        <div class="meta-section">
          <div class="meta-item" v-if="c.category">
            <el-icon><Folder /></el-icon>
            <span>{{ c.category }}</span>
          </div>
          <div class="meta-item">
            <el-icon><Timer /></el-icon>
            <span>{{ formatDuration(c.totalDurationMinutes) }} đã học</span>
          </div>
          <div class="meta-item" v-if="c.estimatedHours">
            <el-icon><Clock /></el-icon>
            <span>Dự kiến: {{ c.estimatedHours }}h</span>
          </div>
          <div class="meta-item" v-if="c.targetDate">
            <el-icon><Calendar /></el-icon>
            <span>Hạn: {{ c.targetDate }}</span>
          </div>
          <div class="meta-item goal-badge" v-if="c.goalTitle">
            <el-tag size="small" type="warning" effect="plain" round>
              🎯 {{ c.goalTitle }}
            </el-tag>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="card-actions">
          <div class="left-actions">
            <a v-if="c.url" :href="c.url" target="_blank" rel="noopener noreferrer" class="link-btn">
              <el-button size="small" round plain>
                <el-icon><Link /></el-icon> Học ngay
              </el-button>
            </a>
            <el-button size="small" type="primary" plain round @click="openProgressModal(c)">
              Cập nhật bài
            </el-button>
          </div>

          <div class="right-actions">
            <el-dropdown trigger="click" @command="(cmd: string) => handleCardAction(cmd, c)">
              <el-button size="small" circle>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">Chỉnh sửa</el-dropdown-item>
                  <el-dropdown-item command="status_in_progress" v-if="c.status !== 'IN_PROGRESS'">Chuyển sang: Đang học</el-dropdown-item>
                  <el-dropdown-item command="status_completed" v-if="c.status !== 'COMPLETED'">Đánh dấu hoàn thành</el-dropdown-item>
                  <el-dropdown-item command="status_paused" v-if="c.status !== 'PAUSED'">Tạm dừng</el-dropdown-item>
                  <el-dropdown-item command="delete" divided style="color: #ef4444">Xóa khóa học</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Course Dialog -->
    <el-dialog
      v-model="showCourseDialog"
      :title="isEditMode ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'"
      width="560px"
      destroy-on-close
    >
      <el-form :model="courseForm" label-position="top">
        <el-form-item label="Tên khóa học" required>
          <el-input v-model="courseForm.title" placeholder="VD: Fullstack Java & Vue.js Mastery" />
        </el-form-item>

        <div class="form-row-2">
          <el-form-item label="Nền tảng / Giảng viên">
            <el-input v-model="courseForm.provider" placeholder="VD: Udemy, Coursera, YouTube..." />
          </el-form-item>
          <el-form-item label="Danh mục">
            <el-input v-model="courseForm.category" placeholder="VD: Backend, Frontend, DevOps..." />
          </el-form-item>
        </div>

        <el-form-item label="Đường dẫn khóa học (URL)">
          <el-input v-model="courseForm.url" placeholder="https://..." />
        </el-form-item>

        <div class="form-row-2">
          <el-form-item label="Trạng thái">
            <el-select v-model="courseForm.status" style="width: 100%">
              <el-option label="Dự định (Planned)" value="PLANNED" />
              <el-option label="Đang học (In Progress)" value="IN_PROGRESS" />
              <el-option label="Đã hoàn thành (Completed)" value="COMPLETED" />
              <el-option label="Tạm dừng (Paused)" value="PAUSED" />
              <el-option label="Đã hủy (Cancelled)" value="CANCELLED" />
            </el-select>
          </el-form-item>
          <el-form-item label="Độ ưu tiên">
            <el-select v-model="courseForm.priority" style="width: 100%">
              <el-option label="Thấp (Low)" value="LOW" />
              <el-option label="Vừa (Medium)" value="MEDIUM" />
              <el-option label="Cao (High)" value="HIGH" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="Số bài đã xong">
            <el-input-number v-model="courseForm.completedLessons" :min="0" style="width: 100%" />
          </el-form-item>
          <el-form-item label="Tổng số bài học">
            <el-input-number v-model="courseForm.totalLessons" :min="0" style="width: 100%" />
          </el-form-item>
        </div>

        <div class="form-row-3">
          <el-form-item label="Thời lượng dự kiến (giờ)">
            <el-input-number v-model="courseForm.estimatedHours" :min="0" :precision="1" style="width: 100%" />
          </el-form-item>
          <el-form-item label="Ngày bắt đầu">
            <el-date-picker v-model="courseForm.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
          <el-form-item label="Hạn dự kiến">
            <el-date-picker v-model="courseForm.targetDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </div>

        <el-form-item label="Mục tiêu liên kết (Goal)">
          <el-select v-model="courseForm.goalId" placeholder="Chọn mục tiêu (nếu có)" clearable filterable style="width: 100%">
            <el-option v-for="g in goalOptions" :key="g.id" :label="g.title" :value="g.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="Ghi chú cá nhân">
          <el-input
            v-model="courseForm.notes"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 6 }"
            placeholder="Ghi chú kiến thức hoặc tài liệu liên quan..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCourseDialog = false">Hủy</el-button>
          <el-button type="primary" :loading="savingCourse" @click="saveCourse">
            {{ isEditMode ? 'Lưu thay đổi' : 'Tạo khóa học' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Quick Update Progress Dialog -->
    <el-dialog
      v-model="showProgressDialog"
      title="Cập nhật tiến độ bài học"
      width="420px"
      destroy-on-close
    >
      <div v-if="selectedCourseForProgress" class="prog-dialog-content">
        <h4 class="dialog-course-title">{{ selectedCourseForProgress.title }}</h4>
        <div class="counter-inputs">
          <div class="form-item">
            <label>Số bài học đã xong:</label>
            <el-input-number
              v-model="progressCompletedLessons"
              :min="0"
              :max="progressTotalLessons || 9999"
              style="width: 100%"
            />
          </div>
          <div class="form-item">
            <label>Tổng số bài học:</label>
            <el-input-number
              v-model="progressTotalLessons"
              :min="0"
              style="width: 100%"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showProgressDialog = false">Hủy</el-button>
          <el-button type="primary" :loading="savingProgress" @click="saveProgress">Lưu tiến độ</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataAnalysis,
  VideoPlay,
  Reading,
  Aim,
  Timer,
  Plus,
  Search,
  School,
  Folder,
  Clock,
  Calendar,
  Link,
  MoreFilled
} from '@element-plus/icons-vue'
import { learningApi } from '@/api/learningApi'
import { goalApi } from '@/api/goalApi'
import type { Course, CourseRequest, CourseStatus } from '@/types/learning'
import type { Goal } from '@/types/goal'

const loading = ref(false)
const courses = ref<Course[]>([])
const goalOptions = ref<Goal[]>([])

const selectedStatus = ref<string>('')
const searchKeyword = ref<string>('')
const searchCategory = ref<string>('')

const showCourseDialog = ref(false)
const isEditMode = ref(false)
const editingCourseId = ref<string | null>(null)
const savingCourse = ref(false)

const showProgressDialog = ref(false)
const selectedCourseForProgress = ref<Course | null>(null)
const progressCompletedLessons = ref<number>(0)
const progressTotalLessons = ref<number | undefined>(undefined)
const savingProgress = ref(false)

const courseForm = ref<CourseRequest>({
  title: '',
  description: '',
  provider: '',
  url: '',
  category: '',
  status: 'PLANNED',
  priority: 'MEDIUM',
  startDate: '',
  targetDate: '',
  estimatedHours: undefined,
  totalLessons: undefined,
  completedLessons: 0,
  goalId: undefined,
  notes: ''
})

const formatDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0p'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}p`
  if (m === 0) return `${h}h`
  return `${h}h ${m}p`
}

const getStatusTagType = (status: CourseStatus): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  switch (status) {
    case 'IN_PROGRESS': return 'primary'
    case 'COMPLETED': return 'success'
    case 'PLANNED': return 'info'
    case 'PAUSED': return 'warning'
    case 'CANCELLED': return 'danger'
    default: return 'info'
  }
}

const getStatusLabel = (status: CourseStatus): string => {
  switch (status) {
    case 'IN_PROGRESS': return 'Đang học'
    case 'COMPLETED': return 'Hoàn thành'
    case 'PLANNED': return 'Dự định'
    case 'PAUSED': return 'Tạm dừng'
    case 'CANCELLED': return 'Đã hủy'
    default: return status
  }
}

const loadCourses = async () => {
  loading.value = true
  try {
    const res = await learningApi.getCourses({
      status: (selectedStatus.value as CourseStatus) || undefined,
      keyword: searchKeyword.value?.trim() || undefined,
      category: searchCategory.value?.trim() || undefined,
      size: 100
    })
    courses.value = res.content || []
  } catch (err) {
    console.error('Failed to load courses', err)
    ElMessage.error('Không thể tải danh sách khóa học')
  } finally {
    loading.value = false
  }
}

const loadGoals = async () => {
  try {
    const res = await goalApi.getGoals()
    goalOptions.value = res || []
  } catch (err) {
    console.error('Failed to load goals', err)
  }
}

let debounceTimer: any = null
const handleFilterChange = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadCourses()
  }, 250)
}

const openCreateModal = () => {
  isEditMode.value = false
  editingCourseId.value = null
  courseForm.value = {
    title: '',
    description: '',
    provider: '',
    url: '',
    category: '',
    status: 'PLANNED',
    priority: 'MEDIUM',
    startDate: '',
    targetDate: '',
    estimatedHours: undefined,
    totalLessons: undefined,
    completedLessons: 0,
    goalId: undefined,
    notes: ''
  }
  showCourseDialog.value = true
}

const openEditModal = (c: Course) => {
  isEditMode.value = true
  editingCourseId.value = c.id
  courseForm.value = {
    title: c.title,
    description: c.description || '',
    provider: c.provider || '',
    url: c.url || '',
    category: c.category || '',
    status: c.status,
    priority: c.priority,
    startDate: c.startDate || '',
    targetDate: c.targetDate || '',
    estimatedHours: c.estimatedHours || undefined,
    totalLessons: c.totalLessons || undefined,
    completedLessons: c.completedLessons || 0,
    goalId: c.goalId || undefined,
    notes: c.notes || ''
  }
  showCourseDialog.value = true
}

const saveCourse = async () => {
  if (!courseForm.value.title.trim()) {
    ElMessage.warning('Vui lòng nhập tên khóa học')
    return
  }
  if (
    courseForm.value.totalLessons != null &&
    courseForm.value.completedLessons != null &&
    courseForm.value.completedLessons > courseForm.value.totalLessons
  ) {
    ElMessage.warning('Số bài đã hoàn thành không được vượt quá tổng số bài')
    return
  }

  savingCourse.value = true
  try {
    if (isEditMode.value && editingCourseId.value) {
      await learningApi.updateCourse(editingCourseId.value, courseForm.value)
      ElMessage.success('Cập nhật khóa học thành công!')
    } else {
      await learningApi.createCourse(courseForm.value)
      ElMessage.success('Tạo khóa học thành công!')
    }
    showCourseDialog.value = false
    await loadCourses()
  } catch (err: any) {
    console.error('Failed to save course', err)
    ElMessage.error(err.response?.data?.message || 'Lỗi khi lưu khóa học')
  } finally {
    savingCourse.value = false
  }
}

const openProgressModal = (c: Course) => {
  selectedCourseForProgress.value = c
  progressCompletedLessons.value = c.completedLessons || 0
  progressTotalLessons.value = c.totalLessons || undefined
  showProgressDialog.value = true
}

const saveProgress = async () => {
  if (!selectedCourseForProgress.value) return
  if (
    progressTotalLessons.value != null &&
    progressCompletedLessons.value > progressTotalLessons.value
  ) {
    ElMessage.warning('Số bài hoàn thành không được vượt quá tổng số bài')
    return
  }

  savingProgress.value = true
  try {
    await learningApi.updateCourseProgress(
      selectedCourseForProgress.value.id,
      progressCompletedLessons.value,
      progressTotalLessons.value
    )
    ElMessage.success('Đã cập nhật tiến độ bài học!')
    showProgressDialog.value = false
    await loadCourses()
  } catch (err: any) {
    console.error('Failed to update progress', err)
    ElMessage.error(err.response?.data?.message || 'Lỗi khi cập nhật tiến độ')
  } finally {
    savingProgress.value = false
  }
}

const handleCardAction = async (command: string, c: Course) => {
  if (command === 'edit') {
    openEditModal(c)
  } else if (command.startsWith('status_')) {
    const newStatus = command.replace('status_', '').toUpperCase() as CourseStatus
    try {
      await learningApi.updateCourseStatus(c.id, newStatus)
      ElMessage.success('Đã thay đổi trạng thái khóa học')
      await loadCourses()
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái')
    }
  } else if (command === 'delete') {
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc chắn muốn xóa khóa học "${c.title}"? Lịch sử các phiên học đã ghi sẽ được bảo lưu.`,
        'Xác nhận xóa',
        {
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
          type: 'warning'
        }
      )
      await learningApi.deleteCourse(c.id)
      ElMessage.success('Đã xóa khóa học')
      await loadCourses()
    } catch {
      // User cancelled
    }
  }
}

onMounted(() => {
  loadCourses()
  loadGoals()
})
</script>

<style scoped lang="scss">
.courses-page {
  padding: 24px;
  max-width: 1360px;
  margin: 0 auto;
}

.page-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  .title-col {
    .page-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--app-text, #1e293b);
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 6px 0;
    }
    .page-desc {
      font-size: 14px;
      color: var(--app-text-muted, #64748b);
      margin: 0;
    }
  }

  .top-nav-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .subnav-link {
      text-decoration: none;
    }
  }
}

.filter-card {
  background: var(--app-card-bg, #ffffff);
  border: 1px solid var(--app-card-border, #e2e8f0);
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 24px;

  .search-inputs {
    display: flex;
    gap: 10px;
  }
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;

  .empty-state {
    grid-column: 1 / -1;
    padding: 60px 0;
  }

  .course-card {
    background: var(--app-card-bg, #ffffff);
    border: 1px solid var(--app-card-border, #e2e8f0);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }

    .card-top {
      margin-bottom: 16px;

      .title-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 6px;

        .course-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--app-text, #1e293b);
          line-height: 1.3;
        }
      }

      .course-provider {
        font-size: 12px;
        color: var(--app-text-muted, #64748b);
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 8px;
      }

      .course-desc {
        font-size: 13px;
        color: var(--app-text, #475569);
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .progress-section {
      background: var(--app-bg-secondary, #f8fafc);
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 14px;

      .prog-labels {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--app-text, #334155);
        margin-bottom: 6px;

        .prog-percent {
          font-weight: 700;
          color: #2563eb;
        }
      }

      .no-lessons-info {
        font-size: 12px;
        color: var(--app-text-muted, #94a3b8);
        text-align: center;
      }
    }

    .meta-section {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 12px;
      color: var(--app-text-muted, #64748b);
      margin-bottom: 16px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid var(--app-card-border, #f1f5f9);

      .left-actions {
        display: flex;
        gap: 8px;
        .link-btn {
          text-decoration: none;
        }
      }
    }
  }
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.prog-dialog-content {
  .dialog-course-title {
    margin: 0 0 16px 0;
    font-size: 15px;
    color: var(--app-text, #1e293b);
  }
  .counter-inputs {
    display: flex;
    flex-direction: column;
    gap: 14px;
    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 6px;
      color: var(--app-text, #334155);
    }
  }
}

@media (max-width: 768px) {
  .courses-page {
    padding: 14px;
  }
  .top-nav-actions {
    width: 100%;
    overflow-x: auto;
    flex-wrap: nowrap !important;
    padding-bottom: 4px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      display: none;
    }
    .subnav-link {
      flex-shrink: 0;
    }
  }
  .status-tabs {
    overflow-x: auto;
    max-width: 100%;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      display: none;
    }
    .el-radio-group {
      flex-wrap: nowrap !important;
      display: flex;
    }
  }
  .courses-grid {
    grid-template-columns: 1fr;
  }
  .form-row-2, .form-row-3 {
    grid-template-columns: 1fr;
  }
  .filter-card {
    flex-direction: column;
    align-items: stretch;
    .search-inputs {
      flex-direction: column;
      input, .el-input {
        width: 100% !important;
      }
    }
  }
}
</style>

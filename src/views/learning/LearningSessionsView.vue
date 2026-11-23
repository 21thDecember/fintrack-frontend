<template>
  <div class="sessions-page">
    <!-- Page Header & Sub Navigation -->
    <div class="page-top-bar">
      <div class="title-col">
        <h1 class="page-title">
          <span>Lịch sử học tập</span>
          <el-tag size="small" effect="plain" type="primary" round class="module-badge">LifeOS</el-tag>
        </h1>
        <p class="page-desc">Ghi chép và rà soát tất cả các phiên học thực tế theo ngày, khóa học, sách và kỹ năng.</p>
      </div>

      <div class="top-nav-actions">
        <router-link to="/learning/overview" class="subnav-link">
          <el-button round size="default">
            <el-icon><DataAnalysis /></el-icon>
            Tổng quan
          </el-button>
        </router-link>
        <router-link to="/learning/courses" class="subnav-link">
          <el-button round size="default">
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
        <router-link to="/learning/sessions" class="subnav-link active">
          <el-button round type="primary" size="default">
            <el-icon><Timer /></el-icon>
            Lịch sử học
          </el-button>
        </router-link>
        <router-link to="/learning/notes" class="subnav-link">
          <el-button round size="default">
            <el-icon><Notebook /></el-icon>
            Sổ tay ghi chú
          </el-button>
        </router-link>
        <el-button type="success" round size="default" :icon="Plus" @click="openCreateModal">
          Ghi phiên học
        </el-button>
      </div>
    </div>

    <!-- Filter & Search Card -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item date-filter">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="đến"
            start-placeholder="Từ ngày"
            end-placeholder="Đến ngày"
            value-format="YYYY-MM-DD"
            style="width: 260px"
            @change="handleFilterChange"
          />
        </div>

        <div class="filter-item">
          <el-select
            v-model="selectedCourseId"
            placeholder="Lọc theo khóa học"
            clearable
            filterable
            style="width: 200px"
            @change="handleFilterChange"
          >
            <el-option v-for="c in courseOptions" :key="c.id" :label="c.title" :value="c.id" />
          </el-select>
        </div>

        <div class="filter-item">
          <el-select
            v-model="selectedBookId"
            placeholder="Lọc theo sách"
            clearable
            filterable
            style="width: 200px"
            @change="handleFilterChange"
          >
            <el-option v-for="b in bookOptions" :key="b.id" :label="b.title" :value="b.id" />
          </el-select>
        </div>

        <div class="filter-item">
          <el-select
            v-model="selectedSkillId"
            placeholder="Lọc theo kỹ năng"
            clearable
            filterable
            style="width: 180px"
            @change="handleFilterChange"
          >
            <el-option v-for="s in skillOptions" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </div>

        <div class="filter-item search-item">
          <el-input
            v-model="searchKeyword"
            placeholder="Tìm theo tiêu đề, ghi chú..."
            clearable
            style="width: 220px"
            @input="handleFilterChange"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- Sessions List -->
    <div v-loading="loading" class="sessions-container">
      <div v-if="!sessions.length" class="empty-state">
        <el-empty description="Không có phiên học nào khớp với bộ lọc">
          <el-button type="success" round @click="openCreateModal">Ghi phiên học đầu tiên</el-button>
        </el-empty>
      </div>

      <div v-else class="sessions-list">
        <div
          v-for="s in sessions"
          :key="s.id"
          class="session-card"
        >
          <div class="session-main">
            <div class="session-badge-col">
              <div class="dur-circle">
                <span class="dur-val">{{ s.durationMinutes }}</span>
                <span class="dur-txt">phút</span>
              </div>
            </div>

            <div class="session-info">
              <div class="title-bar">
                <h3 class="session-title">{{ s.title }}</h3>
                <span class="session-date-tag">
                  <el-icon><Calendar /></el-icon> {{ s.learningDate }}
                </span>
              </div>

              <p v-if="s.description" class="session-desc">{{ s.description }}</p>

              <div class="linked-tags">
                <el-tag v-if="s.courseTitle" size="small" type="primary" effect="light" round>
                  <el-icon><VideoPlay /></el-icon> {{ s.courseTitle }}
                </el-tag>
                <el-tag v-if="s.bookTitle" size="small" type="success" effect="light" round>
                  <el-icon><Reading /></el-icon> {{ s.bookTitle }}
                </el-tag>
                <el-tag v-if="s.skillName" size="small" type="warning" effect="light" round>
                  <el-icon><Aim /></el-icon> {{ s.skillName }}
                </el-tag>
              </div>

              <div v-if="s.notes" class="session-notes-box" @click="openQuickNotesModal(s)" title="Bấm để xem hoặc chỉnh sửa ghi chép chi tiết">
                <el-icon><Notebook /></el-icon>
                <span class="notes-text-span">{{ s.notes }}</span>
              </div>
            </div>
          </div>

          <div class="session-actions">
            <el-button
              size="small"
              circle
              :type="s.notes ? 'warning' : 'default'"
              plain
              @click="openQuickNotesModal(s)"
              title="Ghi chép chi tiết"
            >
              <el-icon><Notebook /></el-icon>
            </el-button>
            <el-button size="small" circle @click="openEditModal(s)" title="Chỉnh sửa">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button size="small" circle type="danger" plain @click="deleteSession(s)" title="Xóa phiên học">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalElements > pageSize" class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalElements"
          layout="prev, pager, next"
          background
          @current-change="loadSessions"
        />
      </div>
    </div>

    <!-- Create / Edit Session Dialog -->
    <el-dialog
      v-model="showSessionDialog"
      :title="isEditMode ? 'Chỉnh sửa phiên học' : 'Ghi nhận phiên học mới'"
      width="540px"
      destroy-on-close
    >
      <el-form :model="sessionForm" label-position="top">
        <el-form-item label="Tiêu đề phiên học" required>
          <el-input v-model="sessionForm.title" placeholder="VD: Luyện nghe tiếng Anh, Làm bài tập Spring JPA..." />
        </el-form-item>

        <div class="form-row-2">
          <el-form-item label="Thời lượng (phút)" required>
            <el-input-number v-model="sessionForm.durationMinutes" :min="1" :max="1440" :step="5" style="width: 100%" />
          </el-form-item>
          <el-form-item label="Ngày học" required>
            <el-date-picker v-model="sessionForm.learningDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="Khóa học liên quan">
            <el-select v-model="sessionForm.courseId" placeholder="Chọn khóa học" clearable filterable style="width: 100%">
              <el-option v-for="c in courseOptions" :key="c.id" :label="c.title" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="Sách liên quan">
            <el-select v-model="sessionForm.bookId" placeholder="Chọn sách" clearable filterable style="width: 100%">
              <el-option v-for="b in bookOptions" :key="b.id" :label="b.title" :value="b.id" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="Kỹ năng liên quan">
          <el-select v-model="sessionForm.skillId" placeholder="Chọn kỹ năng" clearable filterable style="width: 100%">
            <el-option v-for="s in skillOptions" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="Mô tả nội dung học">
          <el-input v-model="sessionForm.description" placeholder="Tóm tắt ngắn gọn những gì đã học..." />
        </el-form-item>

        <el-form-item label="Ghi chú chi tiết">
          <el-input
            v-model="sessionForm.notes"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 14 }"
            placeholder="Những bài học, câu hỏi hoặc ý tưởng phát sinh trong buổi học..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSessionDialog = false">Hủy</el-button>
          <el-button type="primary" :loading="savingSession" @click="saveSession">
            {{ isEditMode ? 'Lưu thay đổi' : 'Lưu phiên học' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Quick Session Notes Dialog -->
    <el-dialog
      v-model="showNotesDialog"
      :title="`📝 Ghi chép phiên học: ${selectedSessionForNotes?.title || ''}`"
      width="680px"
      destroy-on-close
      class="session-notes-dialog"
    >
      <div v-if="selectedSessionForNotes" class="session-notes-content">
        <div class="notes-meta-bar">
          <span>📅 {{ selectedSessionForNotes.learningDate }}</span>
          <span>⏱️ {{ selectedSessionForNotes.durationMinutes }} phút</span>
          <span v-if="selectedSessionForNotes.courseTitle">🎓 {{ selectedSessionForNotes.courseTitle }}</span>
          <span v-if="selectedSessionForNotes.bookTitle">📖 {{ selectedSessionForNotes.bookTitle }}</span>
          <span v-if="selectedSessionForNotes.skillName">🎯 {{ selectedSessionForNotes.skillName }}</span>
        </div>
        <el-input
          v-model="sessionNotesText"
          type="textarea"
          :autosize="{ minRows: 8, maxRows: 22 }"
          placeholder="Ghi lại kiến thức chi tiết, bài học rút ra, mã nguồn hoặc thắc mắc từ buổi học..."
          class="notes-textarea"
        />
        <div class="notes-char-count">
          <span>{{ sessionNotesText ? sessionNotesText.length : 0 }} ký tự</span>
          <span>Hỗ trợ ghi chép nội dung dài</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNotesDialog = false">Đóng</el-button>
          <el-button type="primary" :loading="savingNotes" @click="saveSessionNotes">
            Lưu ghi chú
          </el-button>
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
  Calendar,
  Edit,
  Delete,
  Notebook
} from '@element-plus/icons-vue'
import { learningApi } from '@/api/learningApi'
import type {
  LearningSession,
  LearningSessionRequest,
  Course,
  Book,
  Skill
} from '@/types/learning'

const loading = ref(false)
const sessions = ref<LearningSession[]>([])
const totalElements = ref<number>(0)
const currentPage = ref<number>(1)
const pageSize = ref<number>(15)

const courseOptions = ref<Course[]>([])
const bookOptions = ref<Book[]>([])
const skillOptions = ref<Skill[]>([])

const dateRange = ref<[string, string] | null>(null)
const selectedCourseId = ref<string | null>(null)
const selectedBookId = ref<string | null>(null)
const selectedSkillId = ref<string | null>(null)
const searchKeyword = ref<string>('')

const showSessionDialog = ref(false)
const isEditMode = ref(false)
const editingSessionId = ref<string | null>(null)
const savingSession = ref(false)

const showNotesDialog = ref(false)
const selectedSessionForNotes = ref<LearningSession | null>(null)
const sessionNotesText = ref('')
const savingNotes = ref(false)

const getTodayString = () => new Date().toISOString().split('T')[0]

const sessionForm = ref<LearningSessionRequest>({
  title: '',
  description: '',
  learningDate: getTodayString(),
  durationMinutes: 30,
  courseId: undefined,
  bookId: undefined,
  skillId: undefined,
  notes: ''
})

const loadSessions = async () => {
  loading.value = true
  try {
    const from = dateRange.value?.[0] || undefined
    const to = dateRange.value?.[1] || undefined

    const res = await learningApi.getSessions({
      from,
      to,
      courseId: selectedCourseId.value || undefined,
      bookId: selectedBookId.value || undefined,
      skillId: selectedSkillId.value || undefined,
      keyword: searchKeyword.value?.trim() || undefined,
      page: currentPage.value - 1,
      size: pageSize.value
    })

    sessions.value = res.content || []
    totalElements.value = res.totalElements || 0
  } catch (err) {
    console.error('Failed to load sessions', err)
    ElMessage.error('Không thể tải lịch sử học tập')
  } finally {
    loading.value = false
  }
}

const loadOptions = async () => {
  try {
    const [cRes, bRes, sRes] = await Promise.all([
      learningApi.getCourses({ size: 100 }),
      learningApi.getBooks({ size: 100 }),
      learningApi.getSkills({ size: 100 })
    ])
    courseOptions.value = cRes.content || []
    bookOptions.value = bRes.content || []
    skillOptions.value = sRes.content || []
  } catch (err) {
    console.error('Failed to load options', err)
  }
}

let debounceTimer: any = null
const handleFilterChange = () => {
  currentPage.value = 1
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadSessions()
  }, 250)
}

const openCreateModal = () => {
  isEditMode.value = false
  editingSessionId.value = null
  sessionForm.value = {
    title: '',
    description: '',
    learningDate: getTodayString(),
    durationMinutes: 30,
    courseId: undefined,
    bookId: undefined,
    skillId: undefined,
    notes: ''
  }
  showSessionDialog.value = true
}

const openEditModal = (s: LearningSession) => {
  isEditMode.value = true
  editingSessionId.value = s.id
  sessionForm.value = {
    title: s.title,
    description: s.description || '',
    learningDate: s.learningDate,
    durationMinutes: s.durationMinutes,
    courseId: s.courseId || undefined,
    bookId: s.bookId || undefined,
    skillId: s.skillId || undefined,
    notes: s.notes || ''
  }
  showSessionDialog.value = true
}

const saveSession = async () => {
  if (!sessionForm.value.title.trim()) {
    ElMessage.warning('Vui lòng nhập tiêu đề phiên học')
    return
  }
  if (!sessionForm.value.durationMinutes || sessionForm.value.durationMinutes <= 0) {
    ElMessage.warning('Thời lượng học phải lớn hơn 0')
    return
  }

  savingSession.value = true
  try {
    if (isEditMode.value && editingSessionId.value) {
      await learningApi.updateSession(editingSessionId.value, sessionForm.value)
      ElMessage.success('Cập nhật phiên học thành công!')
    } else {
      await learningApi.createSession(sessionForm.value)
      ElMessage.success('Lưu phiên học thành công!')
    }
    showSessionDialog.value = false
    await loadSessions()
  } catch (err: any) {
    console.error('Failed to save session', err)
    ElMessage.error(err.response?.data?.message || 'Lỗi khi lưu phiên học')
  } finally {
    savingSession.value = false
  }
}

const deleteSession = async (s: LearningSession) => {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc muốn xóa phiên học "${s.title}" (${s.durationMinutes} phút)?`,
      'Xác nhận xóa',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning'
      }
    )
    await learningApi.deleteSession(s.id)
    ElMessage.success('Đã xóa phiên học')
    await loadSessions()
  } catch {
    // User cancelled
  }
}

const openQuickNotesModal = (s: LearningSession) => {
  selectedSessionForNotes.value = s
  sessionNotesText.value = s.notes || ''
  showNotesDialog.value = true
}

const saveSessionNotes = async () => {
  if (!selectedSessionForNotes.value) return
  savingNotes.value = true
  try {
    const updated = await learningApi.updateSessionNotes(
      selectedSessionForNotes.value.id,
      sessionNotesText.value
    )
    selectedSessionForNotes.value.notes = updated.notes
    const found = sessions.value.find(s => s.id === updated.id)
    if (found) found.notes = updated.notes
    ElMessage.success('Đã lưu ghi chú phiên học!')
    showNotesDialog.value = false
  } catch (err: any) {
    console.error('Failed to save session notes', err)
    ElMessage.error(err.response?.data?.message || 'Lỗi khi lưu ghi chú')
  } finally {
    savingNotes.value = false
  }
}

onMounted(() => {
  loadSessions()
  loadOptions()
})
</script>

<style scoped lang="scss">
.sessions-page {
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
  padding: 16px;
  margin-bottom: 24px;

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }
}

.sessions-container {
  .empty-state {
    padding: 60px 0;
  }

  .sessions-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .session-card {
      background: var(--app-card-bg, #ffffff);
      border: 1px solid var(--app-card-border, #e2e8f0);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .session-main {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;

        .session-badge-col {
          .dur-circle {
            width: 54px;
            height: 54px;
            border-radius: 12px;
            background: #dbeafe;
            color: #1d4ed8;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            .dur-val {
              font-size: 17px;
              font-weight: 700;
              line-height: 1;
            }
            .dur-txt {
              font-size: 10px;
              font-weight: 500;
            }
          }
        }

        .session-info {
          flex: 1;

          .title-bar {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 4px;

            .session-title {
              margin: 0;
              font-size: 15px;
              font-weight: 600;
              color: var(--app-text, #1e293b);
            }

            .session-date-tag {
              font-size: 12px;
              color: var(--app-text-muted, #94a3b8);
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }

          .session-desc {
            font-size: 13px;
            color: var(--app-text, #475569);
            margin: 0 0 6px 0;
          }

          .linked-tags {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            margin-bottom: 6px;
          }

          .session-notes-box {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-size: 12.5px;
            color: var(--app-text, #334155);
            background: var(--app-bg-secondary, #f8fafc);
            border: 1px dashed var(--app-card-border, #cbd5e1);
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            max-width: 100%;
            margin-top: 4px;

            &:hover {
              border-color: #f59e0b;
              background: rgba(245, 158, 11, 0.04);
            }

            .notes-text-span {
              white-space: pre-wrap;
              line-height: 1.5;
              word-break: break-word;
            }
          }
        }
      }

      .session-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .pagination-wrap {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }
}

.session-notes-dialog {
  .notes-meta-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 12px;
    color: var(--app-text-muted, #64748b);
    padding: 8px 12px;
    background: var(--app-bg-secondary, #f8fafc);
    border-radius: 8px;
    margin-bottom: 14px;
  }

  .notes-textarea textarea {
    font-family: inherit;
    font-size: 13.5px;
    line-height: 1.6;
    padding: 12px;
    border-radius: 8px;
  }

  .notes-char-count {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--app-text-muted, #94a3b8);
    margin-top: 6px;
    padding: 0 4px;
  }
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 768px) {
  .sessions-page {
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
  .form-row-2 {
    grid-template-columns: 1fr;
  }
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    .filter-item, .el-select, .el-input, .date-filter {
      width: 100% !important;
    }
  }
  .session-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    .session-actions {
      align-self: flex-end;
    }
  }
}
</style>

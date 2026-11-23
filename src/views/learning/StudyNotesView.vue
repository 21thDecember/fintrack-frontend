<template>
  <div class="study-notes-page">
    <!-- Page Header & Sub Navigation -->
    <LearningSubNav
      title="Sổ tay Ghi chú"
      subtitle="Tổng hợp lý thuyết khóa học, đúc kết sách đã đọc và bài học ghi chép từ các phiên học."
    >
      <template #action>
        <el-button type="warning" round size="default" :icon="Plus" @click="openCreateNoteModal">
          Viết ghi chú mới
        </el-button>
      </template>
    </LearningSubNav>

    <!-- Filter & Search Card -->
    <div class="filter-card">
      <div class="tabs-wrap">
        <el-radio-group v-model="selectedTab" size="default">
          <el-radio-button value="ALL">
            Tất cả ({{ totalNotesCount }})
          </el-radio-button>
          <el-radio-button value="COURSE">
            🎓 Lý thuyết Khóa học ({{ courseNotesCount }})
          </el-radio-button>
          <el-radio-button value="BOOK">
            📖 Đúc kết Sách ({{ bookNotesCount }})
          </el-radio-button>
          <el-radio-button value="SESSION">
            ⏱️ Ghi chép Phiên học ({{ sessionNotesCount }})
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="search-inputs">
        <el-input
          v-model="searchKeyword"
          placeholder="Tìm trong nội dung ghi chú..."
          :prefix-icon="Search"
          clearable
          style="width: 260px"
        />
        <el-checkbox v-model="onlyWithNotes" label="Chỉ hiện mục đã có ghi chú" border size="default" />
      </div>
    </div>

    <!-- Notes Grid -->
    <div v-loading="loading" class="notes-grid-container">
      <div v-if="!filteredNotes.length" class="empty-state">
        <el-empty description="Không tìm thấy ghi chú nào phù hợp">
          <el-button type="warning" round @click="openCreateNoteModal">
            Viết ghi chú đầu tiên
          </el-button>
        </el-empty>
      </div>

      <div v-else class="notes-cards-grid">
        <div
          v-for="item in filteredNotes"
          :key="item.id"
          class="note-card"
          :class="`type-${item.type.toLowerCase()}`"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="type-pill">
              <el-tag :type="getTypeTagColor(item.type)" size="small" effect="light" round>
                <el-icon><component :is="getTypeIcon(item.type)" /></el-icon>
                {{ getTypeLabel(item.type) }}
              </el-tag>
              <span v-if="item.subtitle" class="card-subtitle">{{ item.subtitle }}</span>
            </div>

            <div class="card-top-actions">
              <el-button size="small" text @click="copyNote(item)" title="Sao chép ghi chú">
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
              <el-button size="small" type="primary" text @click="openEditModal(item)" title="Chỉnh sửa">
                <el-icon><Edit /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- Title -->
          <h3 class="note-target-title">{{ item.title }}</h3>

          <!-- Note Content Body -->
          <div class="note-body">
            <div v-if="item.notes" class="note-text-content">
              {{ item.notes }}
            </div>
            <div v-else class="empty-note-placeholder" @click="openEditModal(item)">
              <em>Chưa có nội dung ghi chú. Bấm vào đây để bắt đầu viết...</em>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <span class="note-stat-info">
              {{ item.notes ? item.notes.length : 0 }} ký tự
            </span>
            <div class="footer-btns">
              <el-button
                size="small"
                :type="item.notes ? 'default' : 'warning'"
                plain
                round
                @click="openEditModal(item)"
              >
                <el-icon><EditPen /></el-icon>
                {{ item.notes ? 'Chỉnh sửa' : '+ Viết ghi chú' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Note Dialog -->
    <el-dialog
      v-model="showEditDialog"
      :title="`📝 Ghi chú: ${editingItem?.title || ''}`"
      width="720px"
      destroy-on-close
      class="edit-note-dialog"
    >
      <div v-if="editingItem" class="edit-note-content">
        <div class="dialog-meta-bar">
          <el-tag :type="getTypeTagColor(editingItem.type)" size="small" effect="light" round>
            <el-icon><component :is="getTypeIcon(editingItem.type)" /></el-icon>
            {{ getTypeLabel(editingItem.type) }}
          </el-tag>
          <span v-if="editingItem.subtitle" class="dialog-subtitle">{{ editingItem.subtitle }}</span>

          <div class="dialog-actions-right">
            <el-button size="small" text type="primary" @click="insertTemplateForEditing">
              💡 Chèn mẫu gợi ý
            </el-button>
            <el-button size="small" text @click="copyEditingText">
              📋 Sao chép
            </el-button>
          </div>
        </div>

        <div class="editor-wrap">
          <el-input
            v-model="editingText"
            type="textarea"
            :autosize="{ minRows: 12, maxRows: 26 }"
            :placeholder="getPlaceholder(editingItem.type)"
            class="note-textarea-full"
          />
        </div>

        <div class="dialog-char-counter">
          <span>{{ editingText ? editingText.length : 0 }} ký tự</span>
          <span>Tự động co giãn dòng, không giới hạn độ dài</span>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">Hủy</el-button>
          <el-button type="primary" :loading="savingNote" @click="saveEditingNote">
            Lưu ghi chú
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Create New Note Modal (Select Target) -->
    <el-dialog
      v-model="showCreateModal"
      title="Viết ghi chú học tập mới"
      width="560px"
      destroy-on-close
    >
      <div class="create-note-wizard">
        <el-form label-position="top">
          <el-form-item label="1. Chọn loại ghi chú muốn viết" required>
            <el-radio-group v-model="newNoteType" style="width: 100%" @change="handleTypeChange">
              <el-radio-button value="COURSE">🎓 Lý thuyết Khóa học</el-radio-button>
              <el-radio-button value="BOOK">📖 Đúc kết Sách</el-radio-button>
              <el-radio-button value="SESSION">⏱️ Ghi chép Phiên học</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            v-if="newNoteType === 'COURSE'"
            label="2. Chọn khóa học cần ghi chú lý thuyết"
            required
          >
            <el-select v-model="selectedTargetId" placeholder="Chọn khóa học..." filterable style="width: 100%">
              <el-option
                v-for="c in courses"
                :key="c.id"
                :label="c.title + (c.provider ? ` (${c.provider})` : '')"
                :value="c.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item
            v-else-if="newNoteType === 'BOOK'"
            label="2. Chọn cuốn sách cần ghi chú đúc kết"
            required
          >
            <el-select v-model="selectedTargetId" placeholder="Chọn cuốn sách..." filterable style="width: 100%">
              <el-option
                v-for="b in books"
                :key="b.id"
                :label="b.title + (b.author ? ` - ${b.author}` : '')"
                :value="b.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item
            v-else-if="newNoteType === 'SESSION'"
            label="2. Chọn phiên học cần ghi chép"
            required
          >
            <el-select v-model="selectedTargetId" placeholder="Chọn phiên học gần đây..." filterable style="width: 100%">
              <el-option
                v-for="s in sessions"
                :key="s.id"
                :label="`${s.learningDate} - ${s.title} (${s.durationMinutes}p)`"
                :value="s.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateModal = false">Hủy</el-button>
          <el-button type="primary" :disabled="!selectedTargetId" @click="proceedToNoteEditor">
            Tiếp tục viết ghi chú →
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import LearningSubNav from '@/components/learning/LearningSubNav.vue'
import {
  VideoPlay,
  Reading,
  Timer,
  Plus,
  Search,
  Edit,
  EditPen,
  DocumentCopy
} from '@element-plus/icons-vue'
import { learningApi } from '@/api/learningApi'
import type { Course, Book, LearningSession } from '@/types/learning'

interface NoteItem {
  id: string
  type: 'COURSE' | 'BOOK' | 'SESSION'
  title: string
  subtitle?: string
  notes?: string
}

const loading = ref(false)
const courses = ref<Course[]>([])
const books = ref<Book[]>([])
const sessions = ref<LearningSession[]>([])

const selectedTab = ref<'ALL' | 'COURSE' | 'BOOK' | 'SESSION'>('ALL')
const searchKeyword = ref('')
const onlyWithNotes = ref(false)

const showEditDialog = ref(false)
const editingItem = ref<NoteItem | null>(null)
const editingText = ref('')
const savingNote = ref(false)

const showCreateModal = ref(false)
const newNoteType = ref<'COURSE' | 'BOOK' | 'SESSION'>('COURSE')
const selectedTargetId = ref<string | null>(null)

const allNoteItems = computed<NoteItem[]>(() => {
  const items: NoteItem[] = []

  courses.value.forEach(c => {
    items.push({
      id: c.id,
      type: 'COURSE',
      title: c.title,
      subtitle: c.provider ? `Nền tảng: ${c.provider}` : undefined,
      notes: c.notes || ''
    })
  })

  books.value.forEach(b => {
    items.push({
      id: b.id,
      type: 'BOOK',
      title: b.title,
      subtitle: b.author ? `Tác giả: ${b.author}` : undefined,
      notes: b.notes || ''
    })
  })

  sessions.value.forEach(s => {
    items.push({
      id: s.id,
      type: 'SESSION',
      title: s.title,
      subtitle: `${s.learningDate} • ${s.durationMinutes} phút`,
      notes: s.notes || ''
    })
  })

  return items
})

const totalNotesCount = computed(() => allNoteItems.value.filter(i => !!i.notes?.trim()).length)
const courseNotesCount = computed(() => allNoteItems.value.filter(i => i.type === 'COURSE' && !!i.notes?.trim()).length)
const bookNotesCount = computed(() => allNoteItems.value.filter(i => i.type === 'BOOK' && !!i.notes?.trim()).length)
const sessionNotesCount = computed(() => allNoteItems.value.filter(i => i.type === 'SESSION' && !!i.notes?.trim()).length)

const filteredNotes = computed(() => {
  return allNoteItems.value.filter(item => {
    if (selectedTab.value !== 'ALL' && item.type !== selectedTab.value) {
      return false
    }
    if (onlyWithNotes.value && !item.notes?.trim()) {
      return false
    }
    if (searchKeyword.value.trim()) {
      const kw = searchKeyword.value.trim().toLowerCase()
      const matchTitle = item.title.toLowerCase().includes(kw)
      const matchSub = item.subtitle?.toLowerCase().includes(kw)
      const matchNotes = item.notes?.toLowerCase().includes(kw)
      if (!matchTitle && !matchSub && !matchNotes) {
        return false
      }
    }
    return true
  })
})

const getTypeTagColor = (type: string) => {
  if (type === 'COURSE') return 'primary'
  if (type === 'BOOK') return 'success'
  return 'warning'
}

const getTypeIcon = (type: string) => {
  if (type === 'COURSE') return VideoPlay
  if (type === 'BOOK') return Reading
  return Timer
}

const getTypeLabel = (type: string) => {
  if (type === 'COURSE') return 'Khóa học'
  if (type === 'BOOK') return 'Sách'
  return 'Phiên học'
}

const getPlaceholder = (type: string) => {
  if (type === 'COURSE') {
    return 'Ghi chép lý thuyết quan trọng, bài học rút ra, mã code, phím tắt hoặc kiến thức cần nhớ...'
  }
  if (type === 'BOOK') {
    return 'Ghi lại tóm tắt nội dung cuốn sách, bài học tâm đắc, trích dẫn hay (quotes) hoặc hành động rút ra...'
  }
  return 'Ghi lại kiến thức chi tiết, câu hỏi hoặc suy nghĩ sau phiên học...'
}

const openEditModal = (item: NoteItem) => {
  editingItem.value = item
  editingText.value = item.notes || ''
  showEditDialog.value = true
}

const insertTemplateForEditing = () => {
  if (!editingItem.value) return

  let template = ''
  if (editingItem.value.type === 'COURSE') {
    template = `💡 KIẾN THỨC TRỌNG TÂM:
- 

📖 LÝ THUYẾT & KHÁI NIỆM QUAN TRỌNG:
- 

⚙️ VÍ DỤ / CÔNG THỨC / CODE MẪU:
- 

⚠️ LƯU Ý / CÂU HỎI CẦN ÔN LẠI:
- `
  } else if (editingItem.value.type === 'BOOK') {
    template = `🌟 TỔNG QUAN & ĐÁNH GIÁ CUỐN SÁCH:
- 

💡 BÀI HỌC TÂM ĐẮC NHẤT (KEY TAKEAWAYS):
1. 
2. 
3. 

💬 TRÍCH DẪN ĐẮC GIÁ (QUOTES):
- "..."

🚀 HÀNH ĐỘNG / THỰC HÀNH RÚT RA:
- `
  } else {
    template = `🎯 MỤC TIÊU BUỔI HỌC:
- 

📝 NỘI DUNG ĐÃ TIẾP THU:
- 

🤔 VẤN ĐỀ CẦN TÌM HIỂU THÊM:
- `
  }

  if (!editingText.value.trim()) {
    editingText.value = template
  } else {
    editingText.value = editingText.value + '\n\n' + template
  }
}

const copyNote = async (item: NoteItem) => {
  if (!item.notes?.trim()) {
    ElMessage.info('Mục này chưa có nội dung ghi chú')
    return
  }
  try {
    await navigator.clipboard.writeText(item.notes)
    ElMessage.success('Đã sao chép ghi chú vào bộ nhớ tạm!')
  } catch {
    ElMessage.error('Không thể tự động sao chép')
  }
}

const copyEditingText = async () => {
  if (!editingText.value.trim()) {
    ElMessage.info('Chưa có nội dung để sao chép')
    return
  }
  try {
    await navigator.clipboard.writeText(editingText.value)
    ElMessage.success('Đã sao chép ghi chú vào bộ nhớ tạm!')
  } catch {
    ElMessage.error('Không thể tự động sao chép')
  }
}

const saveEditingNote = async () => {
  if (!editingItem.value) return

  savingNote.value = true
  try {
    const text = editingText.value
    if (editingItem.value.type === 'COURSE') {
      await learningApi.updateCourseNotes(editingItem.value.id, text)
      const found = courses.value.find(c => c.id === editingItem.value!.id)
      if (found) found.notes = text
    } else if (editingItem.value.type === 'BOOK') {
      await learningApi.updateBookNotes(editingItem.value.id, text)
      const found = books.value.find(b => b.id === editingItem.value!.id)
      if (found) found.notes = text
    } else if (editingItem.value.type === 'SESSION') {
      await learningApi.updateSessionNotes(editingItem.value.id, text)
      const found = sessions.value.find(s => s.id === editingItem.value!.id)
      if (found) found.notes = text
    }

    editingItem.value.notes = text
    ElMessage.success('Đã lưu ghi chú thành công!')
    showEditDialog.value = false
  } catch (err: any) {
    console.error('Failed to save note', err)
    ElMessage.error(err.response?.data?.message || 'Lỗi khi lưu ghi chú')
  } finally {
    savingNote.value = false
  }
}

const openCreateNoteModal = () => {
  selectedTargetId.value = null
  showCreateModal.value = true
}

const handleTypeChange = () => {
  selectedTargetId.value = null
}

const proceedToNoteEditor = () => {
  if (!selectedTargetId.value) return

  const item = allNoteItems.value.find(
    i => i.id === selectedTargetId.value && i.type === newNoteType.value
  )

  showCreateModal.value = false
  if (item) {
    openEditModal(item)
  }
}

const loadAllData = async () => {
  loading.value = true
  try {
    const [cRes, bRes, sRes] = await Promise.all([
      learningApi.getCourses({ size: 100 }),
      learningApi.getBooks({ size: 100 }),
      learningApi.getSessions({ size: 100 })
    ])
    courses.value = cRes.content || []
    books.value = bRes.content || []
    sessions.value = sRes.content || []
  } catch (err) {
    console.error('Failed to load study notes data', err)
    ElMessage.error('Không thể tải danh sách ghi chú')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAllData()
})
</script>

<style scoped lang="scss">
.study-notes-page {
  padding: 24px;
  max-width: 1360px;
  margin: 0 auto;
}

.filter-card {
  background: var(--app-card-bg, #ffffff);
  border: 1px solid var(--app-card-border, #e2e8f0);
  border-radius: 14px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  .tabs-wrap {
    overflow-x: auto;
    max-width: 100%;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      display: none;
    }

    :deep(.el-radio-group) {
      flex-wrap: nowrap;
    }
  }

  .search-inputs {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.notes-grid-container {
  .empty-state {
    padding: 60px 0;
    text-align: center;
  }

  .notes-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 20px;
  }
}

.note-card {
  background: var(--app-card-bg, #ffffff);
  border: 1px solid var(--app-card-border, #e2e8f0);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  }

  &.type-course {
    border-top: 3px solid #3b82f6;
    &:hover { border-color: rgba(59, 130, 246, 0.35); border-top-color: #3b82f6; }
  }
  &.type-book {
    border-top: 3px solid #10b981;
    &:hover { border-color: rgba(16, 185, 129, 0.35); border-top-color: #10b981; }
  }
  &.type-session {
    border-top: 3px solid #f59e0b;
    &:hover { border-color: rgba(245, 158, 11, 0.35); border-top-color: #f59e0b; }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .type-pill {
      display: flex;
      align-items: center;
      gap: 8px;

      .card-subtitle {
        font-size: 11.5px;
        color: var(--app-text-muted, #94a3b8);
      }
    }

    .card-top-actions {
      display: flex;
      gap: 2px;
    }
  }

  .note-target-title {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--app-text, #1e293b);
    line-height: 1.4;
  }

  .note-body {
    flex: 1;
    margin-bottom: 14px;
    background: var(--app-bg-secondary, #f8fafc);
    border: 1px solid var(--app-card-border, #f1f5f9);
    border-radius: 10px;
    padding: 12px;
    min-height: 120px;
    max-height: 240px;
    overflow-y: auto;

    .note-text-content {
      font-size: 13px;
      color: var(--app-text, #334155);
      white-space: pre-wrap;
      line-height: 1.6;
      word-break: break-word;
    }

    .empty-note-placeholder {
      font-size: 12.5px;
      color: var(--app-text-muted, #94a3b8);
      cursor: pointer;
      padding: 20px 0;
      text-align: center;
      &:hover {
        color: #3b82f6;
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid var(--app-card-border, #f1f5f9);

    .note-stat-info {
      font-size: 11.5px;
      color: var(--app-text-muted, #94a3b8);
    }
  }
}

.edit-note-dialog {
  .dialog-meta-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    background: var(--app-bg-secondary, #f8fafc);
    padding: 8px 12px;
    border-radius: 8px;
    margin-bottom: 14px;

    .dialog-subtitle {
      font-size: 12px;
      color: var(--app-text-muted, #64748b);
      margin-left: 8px;
    }
  }

  .note-textarea-full textarea {
    font-family: inherit;
    font-size: 14px;
    line-height: 1.6;
    padding: 14px;
    border-radius: 8px;
  }

  .dialog-char-counter {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--app-text-muted, #94a3b8);
    margin-top: 8px;
    padding: 0 4px;
  }
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .study-notes-page {
    padding: 14px;
  }
  .filter-card {
    flex-direction: column;
    align-items: stretch;
    .search-inputs {
      flex-direction: column;
      align-items: stretch;
      input, .el-input {
        width: 100% !important;
      }
    }
  }
  .notes-cards-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>

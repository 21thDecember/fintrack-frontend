<template>
  <div class="books-page">
    <!-- Page Header & Sub Navigation -->
    <LearningSubNav
      title="Tủ sách cá nhân"
      subtitle="Theo dõi sách muốn đọc, đang đọc, ghi chép ý tưởng và số trang đã hoàn thành."
    >
      <template #action>
        <el-button type="primary" round size="default" :icon="Plus" @click="openCreateModal">
          Thêm sách mới
        </el-button>
      </template>
    </LearningSubNav>

    <!-- Filter & Search Bar -->
    <div class="filter-card">
      <div class="status-tabs-wrap">
        <el-radio-group v-model="selectedStatus" size="default" @change="handleFilterChange">
          <el-radio-button :value="''">Tất cả</el-radio-button>
          <el-radio-button value="READING">Đang đọc</el-radio-button>
          <el-radio-button value="WANT_TO_READ">Muốn đọc</el-radio-button>
          <el-radio-button value="COMPLETED">Đã đọc xong</el-radio-button>
          <el-radio-button value="PAUSED">Tạm dừng</el-radio-button>
          <el-radio-button value="DROPPED">Bỏ dở</el-radio-button>
        </el-radio-group>
      </div>

      <div class="search-inputs">
        <el-input
          v-model="searchKeyword"
          placeholder="Tìm theo tên sách, tác giả, ISBN..."
          clearable
          style="width: 280px"
          @input="handleFilterChange"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- Books Grid -->
    <div v-loading="loading" class="books-grid">
      <div v-if="!books.length" class="empty-state">
        <el-empty description="Không tìm thấy cuốn sách nào">
          <el-button type="primary" round @click="openCreateModal">Thêm cuốn sách đầu tiên</el-button>
        </el-empty>
      </div>

      <div
        v-for="b in books"
        :key="b.id"
        class="book-card"
      >
        <div class="card-body-wrap">
          <!-- Book Spine / Mock Icon -->
          <div class="book-spine">
            <div class="spine-icon">
              <el-icon><Reading /></el-icon>
            </div>
            <span class="category-name">{{ b.category || 'Sách' }}</span>
          </div>

          <!-- Book Info -->
          <div class="book-details">
            <div class="title-row">
              <h3 class="book-title">{{ b.title }}</h3>
              <el-tag :type="getStatusTagType(b.status)" size="small" effect="light" round>
                {{ getStatusLabel(b.status) }}
              </el-tag>
            </div>
            <span v-if="b.author" class="book-author">Tác giả: {{ b.author }}</span>
            <p v-if="b.description" class="book-desc">{{ b.description }}</p>

            <!-- Progress bar -->
            <div class="reading-progress-wrap">
              <div v-if="b.totalPages && b.totalPages > 0" class="progress-details">
                <div class="prog-labels">
                  <span>Trang <strong>{{ b.currentPage }}/{{ b.totalPages }}</strong></span>
                  <span class="prog-percent">{{ b.progressPercent }}%</span>
                </div>
                <el-progress :percentage="b.progressPercent || 0" :show-text="false" :stroke-width="8" color="#10b981" />
              </div>
              <div v-else class="no-pages-info">
                <span class="text-muted">Chưa cấu hình tổng số trang</span>
              </div>
            </div>

            <!-- Meta tags -->
            <div class="book-meta">
              <div class="meta-item">
                <el-icon><Timer /></el-icon>
                <span>{{ formatDuration(b.totalDurationMinutes) }} đã đọc</span>
              </div>
              <div class="meta-item" v-if="b.isbn">
                <el-icon><Document /></el-icon>
                <span>ISBN: {{ b.isbn }}</span>
              </div>
              <div class="meta-item" v-if="b.targetDate">
                <el-icon><Calendar /></el-icon>
                <span>Hạn: {{ b.targetDate }}</span>
              </div>
              <div class="meta-item goal-badge" v-if="b.goalTitle">
                <el-tag size="small" type="warning" effect="plain" round>
                  🎯 {{ b.goalTitle }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- Book Notes / Summary Preview -->
        <div v-if="b.notes" class="book-notes-preview" @click="openNotesModal(b)" title="Bấm để xem và sửa đúc kết sách">
          <div class="notes-preview-head">
            <el-icon><Notebook /></el-icon>
            <span>Đúc kết & Ghi chú sách</span>
          </div>
          <p class="notes-preview-text">{{ b.notes }}</p>
        </div>

        <!-- Footer Actions -->
        <div class="card-actions">
          <div class="left-actions">
            <el-button size="small" type="success" plain round @click="openPageModal(b)">
              Cập nhật trang
            </el-button>
            <el-button
              size="small"
              :type="b.notes ? 'warning' : 'default'"
              plain
              round
              @click="openNotesModal(b)"
            >
              <el-icon><Notebook /></el-icon>
              {{ b.notes ? 'Đúc kết sách' : '+ Đúc kết' }}
            </el-button>
            <a v-if="b.url" :href="b.url" target="_blank" rel="noopener noreferrer" class="link-btn">
              <el-button size="small" round plain>
                <el-icon><Link /></el-icon> Link sách
              </el-button>
            </a>
          </div>

          <div class="right-actions">
            <el-dropdown trigger="click" @command="(cmd: string) => handleCardAction(cmd, b)">
              <el-button size="small" circle>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="notes">📖 Ghi chú & Đúc kết sách</el-dropdown-item>
                  <el-dropdown-item command="edit">Chỉnh sửa</el-dropdown-item>
                  <el-dropdown-item command="status_reading" v-if="b.status !== 'READING'">Chuyển sang: Đang đọc</el-dropdown-item>
                  <el-dropdown-item command="status_completed" v-if="b.status !== 'COMPLETED'">Đánh dấu đã đọc xong</el-dropdown-item>
                  <el-dropdown-item command="status_paused" v-if="b.status !== 'PAUSED'">Tạm dừng đọc</el-dropdown-item>
                  <el-dropdown-item command="delete" divided style="color: #ef4444">Xóa cuốn sách</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Book Dialog -->
    <el-dialog
      v-model="showBookDialog"
      :title="isEditMode ? 'Chỉnh sửa thông tin sách' : 'Thêm sách vào tủ'"
      width="540px"
      destroy-on-close
    >
      <el-form :model="bookForm" label-position="top">
        <el-form-item label="Tên sách" required>
          <el-input v-model="bookForm.title" placeholder="VD: Clean Code, Designing Data-Intensive Applications..." />
        </el-form-item>

        <div class="form-row-2">
          <el-form-item label="Tác giả">
            <el-input v-model="bookForm.author" placeholder="VD: Robert C. Martin, Martin Kleppmann..." />
          </el-form-item>
          <el-form-item label="Danh mục">
            <el-input v-model="bookForm.category" placeholder="VD: Công nghệ, Kỹ năng, Tư duy..." />
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="Mã ISBN">
            <el-input v-model="bookForm.isbn" placeholder="VD: 978-0132350884" />
          </el-form-item>
          <el-form-item label="Đường dẫn tham khảo (URL)">
            <el-input v-model="bookForm.url" placeholder="https://..." />
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="Trạng thái đọc">
            <el-select v-model="bookForm.status" style="width: 100%">
              <el-option label="Muốn đọc (Want to read)" value="WANT_TO_READ" />
              <el-option label="Đang đọc (Reading)" value="READING" />
              <el-option label="Đã hoàn thành (Completed)" value="COMPLETED" />
              <el-option label="Tạm dừng (Paused)" value="PAUSED" />
              <el-option label="Bỏ dở (Dropped)" value="DROPPED" />
            </el-select>
          </el-form-item>
          <el-form-item label="Mục tiêu liên kết (Goal)">
            <el-select v-model="bookForm.goalId" placeholder="Chọn mục tiêu (nếu có)" clearable filterable style="width: 100%">
              <el-option v-for="g in goalOptions" :key="g.id" :label="g.title" :value="g.id" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="Trang hiện tại">
            <el-input-number v-model="bookForm.currentPage" :min="0" style="width: 100%" />
          </el-form-item>
          <el-form-item label="Tổng số trang">
            <el-input-number v-model="bookForm.totalPages" :min="1" style="width: 100%" />
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="Ngày bắt đầu đọc">
            <el-date-picker v-model="bookForm.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
          <el-form-item label="Hạn dự kiến xong">
            <el-date-picker v-model="bookForm.targetDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </div>

        <el-form-item label="Ghi chú & Trích dẫn ngắn">
          <el-input
            v-model="bookForm.notes"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 6 }"
            placeholder="Ghi chú ý tưởng, bài học rút ra từ sách..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBookDialog = false">Hủy</el-button>
          <el-button type="primary" :loading="savingBook" @click="saveBook">
            {{ isEditMode ? 'Lưu thay đổi' : 'Thêm sách' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Quick Page Update Dialog -->
    <el-dialog
      v-model="showPageDialog"
      title="Cập nhật trang sách đang đọc"
      width="420px"
      destroy-on-close
    >
      <div v-if="selectedBookForPage" class="page-dialog-content">
        <h4 class="dialog-book-title">{{ selectedBookForPage.title }}</h4>
        <div class="counter-inputs">
          <div class="form-item">
            <label>Trang hiện tại:</label>
            <el-input-number
              v-model="progressCurrentPage"
              :min="0"
              :max="progressTotalPages || 99999"
              style="width: 100%"
            />
          </div>
          <div class="form-item">
            <label>Tổng số trang của sách:</label>
            <el-input-number
              v-model="progressTotalPages"
              :min="1"
              style="width: 100%"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPageDialog = false">Hủy</el-button>
          <el-button type="primary" :loading="savingPage" @click="savePage">Lưu trang đọc</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Book Summary & Notes Dialog -->
    <el-dialog
      v-model="showNotesDialog"
      :title="`📖 Ghi chú & Đúc kết sách: ${selectedBookForNotes?.title || ''}`"
      width="720px"
      destroy-on-close
      class="book-notes-dialog"
    >
      <div v-if="selectedBookForNotes" class="book-notes-content">
        <div class="notes-info-bar">
          <div class="info-left">
            <span v-if="selectedBookForNotes.author" class="author-pill">
              <el-icon><Document /></el-icon> {{ selectedBookForNotes.author }}
            </span>
            <span class="pages-pill">
              <el-icon><Reading /></el-icon> Tiến độ: {{ selectedBookForNotes.currentPage || 0 }}/{{ selectedBookForNotes.totalPages || '?' }} trang ({{ selectedBookForNotes.progressPercent || 0 }}%)
            </span>
          </div>
          <div class="template-actions">
            <el-button size="small" text type="success" @click="insertBookTemplate">
              💡 Chèn mẫu đúc kết
            </el-button>
            <el-button size="small" text @click="copyNotesToClipboard">
              📋 Sao chép
            </el-button>
          </div>
        </div>

        <div class="notes-form-item">
          <el-input
            v-model="bookNotesText"
            type="textarea"
            :autosize="{ minRows: 10, maxRows: 26 }"
            placeholder="Ghi lại tóm tắt nội dung cuốn sách, những bài học tâm đắc nhất, trích dẫn hay (quotes) hoặc hành động rút ra..."
            class="notes-textarea"
          />
        </div>
        <div class="notes-char-count">
          <span>{{ bookNotesText ? bookNotesText.length : 0 }} ký tự</span>
          <span>Tự do ghi chép dài không giới hạn</span>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNotesDialog = false">Đóng</el-button>
          <el-button type="primary" :loading="savingNotes" @click="saveBookNotes">
            Lưu đúc kết sách
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import LearningSubNav from '@/components/learning/LearningSubNav.vue'
import {
  Reading,
  Timer,
  Plus,
  Search,
  Document,
  Calendar,
  Link,
  MoreFilled,
  Notebook
} from '@element-plus/icons-vue'
import { learningApi } from '@/api/learningApi'
import { goalApi } from '@/api/goalApi'
import type { Book, BookRequest, BookStatus } from '@/types/learning'
import type { Goal } from '@/types/goal'

const loading = ref(false)
const books = ref<Book[]>([])
const goalOptions = ref<Goal[]>([])

const selectedStatus = ref<string>('')
const searchKeyword = ref<string>('')

const showBookDialog = ref(false)
const isEditMode = ref(false)
const editingBookId = ref<string | null>(null)
const savingBook = ref(false)

const showPageDialog = ref(false)
const selectedBookForPage = ref<Book | null>(null)
const progressCurrentPage = ref<number>(0)
const progressTotalPages = ref<number | undefined>(undefined)
const savingPage = ref(false)

const showNotesDialog = ref(false)
const selectedBookForNotes = ref<Book | null>(null)
const bookNotesText = ref('')
const savingNotes = ref(false)

const bookForm = ref<BookRequest>({
  title: '',
  author: '',
  description: '',
  isbn: '',
  category: '',
  url: '',
  status: 'WANT_TO_READ',
  totalPages: undefined,
  currentPage: 0,
  startDate: '',
  targetDate: '',
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

const getStatusTagType = (status: BookStatus): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  switch (status) {
    case 'READING': return 'primary'
    case 'COMPLETED': return 'success'
    case 'WANT_TO_READ': return 'info'
    case 'PAUSED': return 'warning'
    case 'DROPPED': return 'danger'
    default: return 'info'
  }
}

const getStatusLabel = (status: BookStatus): string => {
  switch (status) {
    case 'READING': return 'Đang đọc'
    case 'COMPLETED': return 'Đã xong'
    case 'WANT_TO_READ': return 'Muốn đọc'
    case 'PAUSED': return 'Tạm dừng'
    case 'DROPPED': return 'Bỏ dở'
    default: return status
  }
}

const loadBooks = async () => {
  loading.value = true
  try {
    const res = await learningApi.getBooks({
      status: (selectedStatus.value as BookStatus) || undefined,
      keyword: searchKeyword.value?.trim() || undefined,
      size: 100
    })
    books.value = res.content || []
  } catch (err) {
    console.error('Failed to load books', err)
    ElMessage.error('Không thể tải danh sách sách')
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
    loadBooks()
  }, 250)
}

const openCreateModal = () => {
  isEditMode.value = false
  editingBookId.value = null
  bookForm.value = {
    title: '',
    author: '',
    description: '',
    isbn: '',
    category: '',
    url: '',
    status: 'WANT_TO_READ',
    totalPages: undefined,
    currentPage: 0,
    startDate: '',
    targetDate: '',
    goalId: undefined,
    notes: ''
  }
  showBookDialog.value = true
}

const openEditModal = (b: Book) => {
  isEditMode.value = true
  editingBookId.value = b.id
  bookForm.value = {
    title: b.title,
    author: b.author || '',
    description: b.description || '',
    isbn: b.isbn || '',
    category: b.category || '',
    url: b.url || '',
    status: b.status,
    totalPages: b.totalPages || undefined,
    currentPage: b.currentPage || 0,
    startDate: b.startDate || '',
    targetDate: b.targetDate || '',
    goalId: b.goalId || undefined,
    notes: b.notes || ''
  }
  showBookDialog.value = true
}

const saveBook = async () => {
  if (!bookForm.value.title.trim()) {
    ElMessage.warning('Vui lòng nhập tên cuốn sách')
    return
  }
  if (
    bookForm.value.totalPages != null &&
    bookForm.value.currentPage != null &&
    bookForm.value.currentPage > bookForm.value.totalPages
  ) {
    ElMessage.warning('Trang hiện tại không được vượt quá tổng số trang')
    return
  }

  savingBook.value = true
  try {
    if (isEditMode.value && editingBookId.value) {
      await learningApi.updateBook(editingBookId.value, bookForm.value)
      ElMessage.success('Cập nhật sách thành công!')
    } else {
      await learningApi.addBook(bookForm.value)
      ElMessage.success('Thêm sách thành công!')
    }
    showBookDialog.value = false
    await loadBooks()
  } catch (err: any) {
    console.error('Failed to save book', err)
    ElMessage.error(err.response?.data?.message || 'Lỗi khi lưu sách')
  } finally {
    savingBook.value = false
  }
}

const openPageModal = (b: Book) => {
  selectedBookForPage.value = b
  progressCurrentPage.value = b.currentPage || 0
  progressTotalPages.value = b.totalPages || undefined
  showPageDialog.value = true
}

const savePage = async () => {
  if (!selectedBookForPage.value) return
  if (
    progressTotalPages.value != null &&
    progressCurrentPage.value > progressTotalPages.value
  ) {
    ElMessage.warning('Trang hiện tại không được vượt quá tổng số trang')
    return
  }

  savingPage.value = true
  try {
    await learningApi.updateReadingProgress(
      selectedBookForPage.value.id,
      progressCurrentPage.value,
      progressTotalPages.value
    )
    ElMessage.success('Đã cập nhật trang đọc!')
    showPageDialog.value = false
    await loadBooks()
  } catch (err: any) {
    console.error('Failed to update page', err)
    ElMessage.error(err.response?.data?.message || 'Lỗi khi cập nhật trang')
  } finally {
    savingPage.value = false
  }
}

const openNotesModal = (b: Book) => {
  selectedBookForNotes.value = b
  bookNotesText.value = b.notes || ''
  showNotesDialog.value = true
}

const insertBookTemplate = () => {
  const template = `🌟 TỔNG QUAN & ĐÁNH GIÁ CUỐN SÁCH:
- 

💡 BÀI HỌC TÂM ĐẮC NHẤT (KEY TAKEAWAYS):
1. 
2. 
3. 

💬 TRÍCH DẪN ĐẮC GIÁ (QUOTES):
- "..."

🚀 HÀNH ĐỘNG / THỰC HÀNH RÚT RA:
- `
  if (!bookNotesText.value.trim()) {
    bookNotesText.value = template
  } else {
    bookNotesText.value = bookNotesText.value + '\n\n' + template
  }
}

const copyNotesToClipboard = async () => {
  if (!bookNotesText.value) {
    ElMessage.info('Chưa có nội dung ghi chú để sao chép')
    return
  }
  try {
    await navigator.clipboard.writeText(bookNotesText.value)
    ElMessage.success('Đã sao chép ghi chú vào bộ nhớ tạm!')
  } catch {
    ElMessage.error('Không thể tự động sao chép')
  }
}

const saveBookNotes = async () => {
  if (!selectedBookForNotes.value) return
  savingNotes.value = true
  try {
    const updated = await learningApi.updateBookNotes(
      selectedBookForNotes.value.id,
      bookNotesText.value
    )
    selectedBookForNotes.value.notes = updated.notes
    const found = books.value.find(b => b.id === updated.id)
    if (found) found.notes = updated.notes
    ElMessage.success('Đã lưu đúc kết sách thành công!')
    showNotesDialog.value = false
  } catch (err: any) {
    console.error('Failed to save book notes', err)
    ElMessage.error(err.response?.data?.message || 'Lỗi khi lưu đúc kết')
  } finally {
    savingNotes.value = false
  }
}

const handleCardAction = async (command: string, b: Book) => {
  if (command === 'notes') {
    openNotesModal(b)
  } else if (command === 'edit') {
    openEditModal(b)
  } else if (command.startsWith('status_')) {
    const newStatus = command.replace('status_', '').toUpperCase() as BookStatus
    try {
      await learningApi.updateBookStatus(b.id, newStatus)
      ElMessage.success('Đã thay đổi trạng thái đọc')
      await loadBooks()
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái')
    }
  } else if (command === 'delete') {
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc chắn muốn xóa cuốn sách "${b.title}"? Lịch sử các phiên học đã ghi sẽ được bảo lưu.`,
        'Xác nhận xóa',
        {
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
          type: 'warning'
        }
      )
      await learningApi.deleteBook(b.id)
      ElMessage.success('Đã xóa cuốn sách')
      await loadBooks()
    } catch {
      // User cancelled
    }
  }
}

onMounted(() => {
  loadBooks()
  loadGoals()
})
</script>

<style scoped lang="scss">
.books-page {
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

  .status-tabs-wrap {
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
    gap: 10px;
    align-items: center;
  }
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;

  .empty-state {
    grid-column: 1 / -1;
    padding: 60px 0;
  }

  .book-card {
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
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
      transform: translateY(-3px);
      border-color: rgba(16, 185, 129, 0.35);

      .book-spine {
        transform: rotate(-1.5deg) translateY(-2px);
      }
    }

    .card-body-wrap {
      display: flex;
      gap: 16px;
      margin-bottom: 14px;

      .book-spine {
        width: 60px;
        background: linear-gradient(145deg, #10b981 0%, #059669 100%);
        border-radius: 6px;
        padding: 10px 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        color: #ffffff;
        flex-shrink: 0;
        box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

        .spine-icon {
          font-size: 20px;
        }

        .category-name {
          font-size: 10px;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          letter-spacing: 1px;
          opacity: 0.9;
          max-height: 80px;
          overflow: hidden;
        }
      }

      .book-details {
        flex: 1;

        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 4px;

          .book-title {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
            color: var(--app-text, #1e293b);
            line-height: 1.3;
          }
        }

        .book-author {
          font-size: 12px;
          color: var(--app-text-muted, #64748b);
          display: block;
          margin-bottom: 6px;
        }

        .book-desc {
          font-size: 13px;
          color: var(--app-text, #475569);
          margin: 0 0 10px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .reading-progress-wrap {
          background: var(--app-bg-secondary, #f8fafc);
          padding: 8px 10px;
          border-radius: 6px;
          margin-bottom: 10px;

          .prog-labels {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: var(--app-text, #334155);
            margin-bottom: 4px;

            .prog-percent {
              font-weight: 700;
              color: #10b981;
            }
          }

          .no-pages-info {
            font-size: 11px;
            color: var(--app-text-muted, #94a3b8);
            text-align: center;
          }
        }

        .book-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 11px;
          color: var(--app-text-muted, #64748b);

          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }

    .card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
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

.book-notes-preview {
  background: var(--app-bg-secondary, #f8fafc);
  border: 1px dashed var(--app-card-border, #cbd5e1);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              background-color 0.2s ease,
              border-color 0.2s ease,
              box-shadow 0.2s ease;

  &:hover {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.08);
  }

  .notes-preview-head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #059669;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .notes-preview-text {
    font-size: 12px;
    color: var(--app-text, #334155);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
    white-space: pre-wrap;
  }
}

.book-notes-dialog {
  .notes-info-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    padding: 8px 12px;
    background: var(--app-bg-secondary, #f8fafc);
    border-radius: 8px;
    margin-bottom: 14px;

    .info-left {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: var(--app-text-muted, #64748b);
      .author-pill, .pages-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .notes-form-item {
    margin-bottom: 8px;
    .notes-textarea textarea {
      font-family: inherit;
      font-size: 13.5px;
      line-height: 1.6;
      padding: 12px;
      border-radius: 8px;
    }
  }

  .notes-char-count {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--app-text-muted, #94a3b8);
    padding: 0 4px;
  }
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.page-dialog-content {
  .dialog-book-title {
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
  .books-page {
    padding: 14px;
  }
  .books-grid {
    grid-template-columns: 1fr;
  }
  .form-row-2 {
    grid-template-columns: 1fr;
  }
  .filter-card {
    flex-direction: column;
    align-items: stretch;
    .search-inputs {
      input, .el-input {
        width: 100% !important;
      }
    }
  }
}
</style>

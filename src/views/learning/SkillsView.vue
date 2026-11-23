<template>
  <div class="skills-page">
    <!-- Page Header & Sub Navigation -->
    <LearningSubNav
      title="Kỹ năng & Năng lực"
      subtitle="Theo dõi các kỹ năng chuyên môn, ngoại ngữ và kỹ năng mềm đang phát triển theo 5 cấp độ."
    >
      <template #action>
        <el-button type="primary" round size="default" :icon="Plus" @click="openCreateModal">
          Thêm kỹ năng
        </el-button>
      </template>
    </LearningSubNav>

    <!-- Filter & Search Bar -->
    <div class="filter-card">
      <div class="category-tabs-wrap">
        <el-radio-group v-model="selectedCategory" size="default" @change="handleFilterChange">
          <el-radio-button :value="''">Tất cả</el-radio-button>
          <el-radio-button value="TECHNICAL">Kỹ thuật</el-radio-button>
          <el-radio-button value="LANGUAGE">Ngoại ngữ</el-radio-button>
          <el-radio-button value="SOFT_SKILL">Kỹ năng mềm</el-radio-button>
          <el-radio-button value="PERSONAL">Cá nhân</el-radio-button>
          <el-radio-button value="OTHER">Khác</el-radio-button>
        </el-radio-group>
      </div>

      <div class="search-inputs">
        <el-input
          v-model="searchKeyword"
          placeholder="Tìm kỹ năng..."
          clearable
          style="width: 240px"
          @input="handleFilterChange"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- Skills Grid -->
    <div v-loading="loading" class="skills-grid">
      <div v-if="!skills.length" class="empty-state">
        <el-empty description="Chưa có kỹ năng nào trong danh mục này">
          <el-button type="primary" round @click="openCreateModal">Thêm kỹ năng mới</el-button>
        </el-empty>
      </div>

      <div
        v-for="s in skills"
        :key="s.id"
        class="skill-card"
      >
        <div class="card-head-row">
          <div class="title-group">
            <h3 class="skill-name">{{ s.name }}</h3>
            <el-tag :type="getCategoryTagType(s.category)" size="small" effect="light" round>
              {{ getCategoryLabel(s.category) }}
            </el-tag>
          </div>
          <el-dropdown trigger="click" @command="(cmd: string) => handleCardAction(cmd, s)">
            <el-button size="small" circle>
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">Chỉnh sửa</el-dropdown-item>
                <el-dropdown-item command="history">Xem lịch sử tiến bộ</el-dropdown-item>
                <el-dropdown-item command="delete" divided style="color: #ef4444">Xóa kỹ năng</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <p v-if="s.description" class="skill-desc">{{ s.description }}</p>

        <!-- Skill Levels Display -->
        <div class="skill-level-block">
          <div class="level-indicator-row">
            <div class="level-badge">
              <span class="lvl-num">Level {{ s.currentLevel }}</span>
              <span class="lvl-title">{{ getLevelTitle(s.currentLevel) }}</span>
            </div>
            <div class="stars-list">
              <span
                v-for="i in 5"
                :key="i"
                class="star-item"
                :class="{ active: i <= s.currentLevel }"
              >★</span>
            </div>
          </div>

          <!-- Target Progress -->
          <div v-if="s.targetLevel" class="target-prog-row">
            <span>Mục tiêu hướng tới: <strong>Level {{ s.targetLevel }} ({{ getLevelTitle(s.targetLevel) }})</strong></span>
            <el-progress
              :percentage="Math.min(100, Math.round((s.currentLevel / s.targetLevel) * 100))"
              :show-text="false"
              :stroke-width="6"
              color="#f59e0b"
            />
          </div>
        </div>

        <!-- Meta info -->
        <div class="meta-row">
          <div class="meta-item">
            <el-icon><Timer /></el-icon>
            <span>{{ formatDuration(s.totalDurationMinutes) }} thực hành</span>
          </div>
          <div class="meta-item goal-badge" v-if="s.goalTitle">
            <el-tag size="small" type="warning" effect="plain" round>
              🎯 {{ s.goalTitle }}
            </el-tag>
          </div>
        </div>

        <!-- Actions -->
        <div class="card-footer-actions">
          <el-button size="small" type="warning" plain round @click="openLevelModal(s)">
            Điều chỉnh Level
          </el-button>
          <el-button size="small" round @click="openHistoryDrawer(s)">
            Lịch sử
          </el-button>
        </div>
      </div>
    </div>

    <!-- Create / Edit Skill Dialog -->
    <el-dialog
      v-model="showSkillDialog"
      :title="isEditMode ? 'Chỉnh sửa kỹ năng' : 'Thêm kỹ năng mới'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="skillForm" label-position="top">
        <el-form-item label="Tên kỹ năng" required>
          <el-input v-model="skillForm.name" placeholder="VD: Java, Spring Boot, English Speaking, Thuyết trình..." />
        </el-form-item>

        <div class="form-row-2">
          <el-form-item label="Phân nhóm">
            <el-select v-model="skillForm.category" style="width: 100%">
              <el-option label="Kỹ thuật & Công nghệ" value="TECHNICAL" />
              <el-option label="Ngoại ngữ" value="LANGUAGE" />
              <el-option label="Kỹ năng mềm" value="SOFT_SKILL" />
              <el-option label="Cá nhân" value="PERSONAL" />
              <el-option label="Khác" value="OTHER" />
            </el-select>
          </el-form-item>
          <el-form-item label="Mục tiêu liên kết (Goal)">
            <el-select v-model="skillForm.goalId" placeholder="Chọn mục tiêu (nếu có)" clearable filterable style="width: 100%">
              <el-option v-for="g in goalOptions" :key="g.id" :label="g.title" :value="g.id" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="Trình độ hiện tại (1 - 5)" required>
            <el-select v-model="skillForm.currentLevel" style="width: 100%">
              <el-option :value="1" label="1 - Beginner (Mới bắt đầu)" />
              <el-option :value="2" label="2 - Basic (Cơ bản)" />
              <el-option :value="3" label="3 - Intermediate (Độc lập/Khá)" />
              <el-option :value="4" label="4 - Advanced (Thành thạo/Tốt)" />
              <el-option :value="5" label="5 - Expert (Chuyên gia/Xuất sắc)" />
            </el-select>
          </el-form-item>
          <el-form-item label="Trình độ mục tiêu (1 - 5)">
            <el-select v-model="skillForm.targetLevel" clearable placeholder="Chưa đặt mục tiêu" style="width: 100%">
              <el-option :value="1" label="1 - Beginner" />
              <el-option :value="2" label="2 - Basic" />
              <el-option :value="3" label="3 - Intermediate" />
              <el-option :value="4" label="4 - Advanced" />
              <el-option :value="5" label="5 - Expert" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="Mô tả kỹ năng">
          <el-input
            v-model="skillForm.description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="Mục đích rèn luyện hoặc phạm vi áp dụng..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSkillDialog = false">Hủy</el-button>
          <el-button type="primary" :loading="savingSkill" @click="saveSkill">
            {{ isEditMode ? 'Lưu thay đổi' : 'Tạo kỹ năng' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Adjust Level Dialog -->
    <el-dialog
      v-model="showLevelDialog"
      title="Điều chỉnh cấp độ kỹ năng"
      width="440px"
      destroy-on-close
    >
      <div v-if="selectedSkillForLevel" class="level-dialog-content">
        <h4 class="dialog-skill-title">{{ selectedSkillForLevel.name }}</h4>
        <p class="current-level-p">
          Cấp độ hiện tại: <strong>Level {{ selectedSkillForLevel.currentLevel }} - {{ getLevelTitle(selectedSkillForLevel.currentLevel) }}</strong>
        </p>

        <div class="form-item">
          <label>Cấp độ mới (1 - 5):</label>
          <el-select v-model="newLevelValue" style="width: 100%">
            <el-option :value="1" label="Level 1 - Beginner (Mới bắt đầu)" />
            <el-option :value="2" label="Level 2 - Basic (Cơ bản)" />
            <el-option :value="3" label="Level 3 - Intermediate (Khá / Độc lập)" />
            <el-option :value="4" label="Level 4 - Advanced (Thành thạo / Tốt)" />
            <el-option :value="5" label="Level 5 - Expert (Chuyên gia / Xuất sắc)" />
          </el-select>
        </div>

        <div class="form-item" style="margin-top: 14px">
          <label>Ghi chú lý do thay đổi (Tùy chọn):</label>
          <el-input
            v-model="levelChangeNote"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="VD: Đã hoàn thành khóa học, tự làm được project thực tế..."
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showLevelDialog = false">Hủy</el-button>
          <el-button type="warning" :loading="savingLevel" @click="saveLevelAdjustment">Cập nhật Level</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Skill Evolution History Drawer -->
    <el-drawer
      v-model="showHistoryDrawer"
      title="Lịch sử phát triển kỹ năng"
      size="420px"
      destroy-on-close
    >
      <div v-if="selectedSkillForHistory" class="history-drawer-content">
        <h3 class="drawer-skill-name">{{ selectedSkillForHistory.name }}</h3>
        <p class="drawer-skill-desc">{{ selectedSkillForHistory.description || 'Chưa có mô tả' }}</p>

        <el-divider />

        <div v-if="loadingHistory" class="loading-wrap">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else-if="!skillHistoryList.length" class="empty-history">
          Chưa có bản ghi lịch sử nào.
        </div>
        <el-timeline v-else>
          <el-timeline-item
            v-for="item in skillHistoryList"
            :key="item.id"
            :timestamp="formatTime(item.changedAt)"
            placement="top"
            type="primary"
          >
            <div class="history-item-body">
              <div class="level-transition">
                <span class="badge-prev">Lv.{{ item.previousLevel }}</span>
                <span class="arrow-sym">➔</span>
                <span class="badge-new">Lv.{{ item.newLevel }}</span>
                <span class="level-txt">({{ getLevelTitle(item.newLevel) }})</span>
              </div>
              <p v-if="item.note" class="history-note">{{ item.note }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import LearningSubNav from '@/components/learning/LearningSubNav.vue'
import {
  Timer,
  Plus,
  Search,
  MoreFilled
} from '@element-plus/icons-vue'
import { learningApi } from '@/api/learningApi'
import { goalApi } from '@/api/goalApi'
import type { Skill, SkillRequest, SkillCategory, SkillHistory } from '@/types/learning'
import type { Goal } from '@/types/goal'

const loading = ref(false)
const skills = ref<Skill[]>([])
const goalOptions = ref<Goal[]>([])

const selectedCategory = ref<string>('')
const searchKeyword = ref<string>('')

const showSkillDialog = ref(false)
const isEditMode = ref(false)
const editingSkillId = ref<string | null>(null)
const savingSkill = ref(false)

const showLevelDialog = ref(false)
const selectedSkillForLevel = ref<Skill | null>(null)
const newLevelValue = ref<number>(1)
const levelChangeNote = ref<string>('')
const savingLevel = ref(false)

const showHistoryDrawer = ref(false)
const selectedSkillForHistory = ref<Skill | null>(null)
const skillHistoryList = ref<SkillHistory[]>([])
const loadingHistory = ref(false)

const skillForm = ref<SkillRequest>({
  name: '',
  description: '',
  category: 'TECHNICAL',
  currentLevel: 1,
  targetLevel: undefined,
  isActive: true,
  goalId: undefined
})

const formatDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0p'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}p`
  if (m === 0) return `${h}h`
  return `${h}h ${m}p`
}

const formatTime = (ts: string): string => {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCategoryTagType = (cat: SkillCategory): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  switch (cat) {
    case 'TECHNICAL': return 'primary'
    case 'LANGUAGE': return 'success'
    case 'SOFT_SKILL': return 'warning'
    case 'PERSONAL': return 'danger'
    default: return 'info'
  }
}

const getCategoryLabel = (cat: SkillCategory): string => {
  const map: Record<string, string> = {
    TECHNICAL: 'Kỹ thuật',
    LANGUAGE: 'Ngoại ngữ',
    SOFT_SKILL: 'Kỹ năng mềm',
    PERSONAL: 'Cá nhân',
    OTHER: 'Khác'
  }
  return map[cat] || cat
}

const getLevelTitle = (lvl: number): string => {
  const map: Record<number, string> = {
    1: 'Beginner',
    2: 'Basic',
    3: 'Intermediate',
    4: 'Advanced',
    5: 'Expert'
  }
  return map[lvl] || `Lv.${lvl}`
}

const loadSkills = async () => {
  loading.value = true
  try {
    const res = await learningApi.getSkills({
      category: (selectedCategory.value as SkillCategory) || undefined,
      keyword: searchKeyword.value?.trim() || undefined,
      size: 100
    })
    skills.value = res.content || []
  } catch (err) {
    console.error('Failed to load skills', err)
    ElMessage.error('Không thể tải danh sách kỹ năng')
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
    loadSkills()
  }, 250)
}

const openCreateModal = () => {
  isEditMode.value = false
  editingSkillId.value = null
  skillForm.value = {
    name: '',
    description: '',
    category: 'TECHNICAL',
    currentLevel: 1,
    targetLevel: undefined,
    isActive: true,
    goalId: undefined
  }
  showSkillDialog.value = true
}

const openEditModal = (s: Skill) => {
  isEditMode.value = true
  editingSkillId.value = s.id
  skillForm.value = {
    name: s.name,
    description: s.description || '',
    category: s.category,
    currentLevel: s.currentLevel,
    targetLevel: s.targetLevel || undefined,
    isActive: s.isActive,
    goalId: s.goalId || undefined
  }
  showSkillDialog.value = true
}

const saveSkill = async () => {
  if (!skillForm.value.name.trim()) {
    ElMessage.warning('Vui lòng nhập tên kỹ năng')
    return
  }

  savingSkill.value = true
  try {
    if (isEditMode.value && editingSkillId.value) {
      await learningApi.updateSkill(editingSkillId.value, skillForm.value)
      ElMessage.success('Cập nhật kỹ năng thành công!')
    } else {
      await learningApi.createSkill(skillForm.value)
      ElMessage.success('Tạo kỹ năng thành công!')
    }
    showSkillDialog.value = false
    await loadSkills()
  } catch (err: any) {
    console.error('Failed to save skill', err)
    ElMessage.error(err.response?.data?.message || 'Lỗi khi lưu kỹ năng')
  } finally {
    savingSkill.value = false
  }
}

const openLevelModal = (s: Skill) => {
  selectedSkillForLevel.value = s
  newLevelValue.value = s.currentLevel
  levelChangeNote.value = ''
  showLevelDialog.value = true
}

const saveLevelAdjustment = async () => {
  if (!selectedSkillForLevel.value) return

  savingLevel.value = true
  try {
    await learningApi.updateSkillLevel(
      selectedSkillForLevel.value.id,
      newLevelValue.value,
      levelChangeNote.value?.trim() || undefined
    )
    ElMessage.success('Đã cập nhật cấp độ kỹ năng!')
    showLevelDialog.value = false
    await loadSkills()
  } catch (err: any) {
    console.error('Failed to adjust level', err)
    ElMessage.error(err.response?.data?.message || 'Lỗi khi cập nhật level')
  } finally {
    savingLevel.value = false
  }
}

const openHistoryDrawer = async (s: Skill) => {
  selectedSkillForHistory.value = s
  showHistoryDrawer.value = true
  loadingHistory.value = true
  try {
    skillHistoryList.value = await learningApi.getSkillHistory(s.id)
  } catch (err) {
    console.error('Failed to load history', err)
  } finally {
    loadingHistory.value = false
  }
}

const handleCardAction = async (command: string, s: Skill) => {
  if (command === 'edit') {
    openEditModal(s)
  } else if (command === 'history') {
    openHistoryDrawer(s)
  } else if (command === 'delete') {
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc chắn muốn xóa kỹ năng "${s.name}"? Lịch sử các phiên học đã ghi sẽ được bảo lưu an toàn.`,
        'Xác nhận xóa',
        {
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
          type: 'warning'
        }
      )
      await learningApi.deleteSkill(s.id)
      ElMessage.success('Đã xóa kỹ năng')
      await loadSkills()
    } catch {
      // User cancelled
    }
  }
}

onMounted(() => {
  loadSkills()
  loadGoals()
})
</script>

<style scoped lang="scss">
.skills-page {
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

  .category-tabs-wrap {
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

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;

  .empty-state {
    grid-column: 1 / -1;
    padding: 60px 0;
  }

  .skill-card {
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

    .card-head-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;

      .title-group {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;

        .skill-name {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--app-text, #1e293b);
        }
      }
    }

    .skill-desc {
      font-size: 13px;
      color: var(--app-text, #475569);
      margin: 0 0 12px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .skill-level-block {
      background: var(--app-bg-secondary, #f8fafc);
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;

      .level-indicator-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .level-badge {
          display: flex;
          align-items: center;
          gap: 6px;

          .lvl-num {
            font-size: 14px;
            font-weight: 700;
            color: #d97706;
          }
          .lvl-title {
            font-size: 12px;
            color: var(--app-text-muted, #64748b);
          }
        }

        .stars-list {
          display: flex;
          gap: 3px;
          .star-item {
            font-size: 14px;
            color: #cbd5e1;
            &.active {
              color: #f59e0b;
            }
          }
        }
      }

      .target-prog-row {
        font-size: 11px;
        color: var(--app-text-muted, #64748b);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
    }

    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 12px;
      color: var(--app-text-muted, #64748b);
      margin-bottom: 14px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .card-footer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid var(--app-card-border, #f1f5f9);
    }
  }
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.level-dialog-content {
  .dialog-skill-title {
    margin: 0 0 6px 0;
    font-size: 16px;
    color: var(--app-text, #1e293b);
  }
  .current-level-p {
    margin: 0 0 16px 0;
    font-size: 13px;
    color: var(--app-text-muted, #64748b);
  }
  label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 6px;
    color: var(--app-text, #334155);
  }
}

.history-drawer-content {
  .drawer-skill-name {
    margin: 0 0 6px 0;
    font-size: 18px;
    color: var(--app-text, #1e293b);
  }
  .drawer-skill-desc {
    font-size: 13px;
    color: var(--app-text-muted, #64748b);
    margin: 0;
  }
  .history-item-body {
    .level-transition {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;

      .badge-prev {
        color: var(--app-text-muted, #64748b);
      }
      .arrow-sym {
        color: #f59e0b;
      }
      .badge-new {
        color: #d97706;
      }
      .level-txt {
        font-weight: 400;
        color: var(--app-text-muted, #94a3b8);
      }
    }
    .history-note {
      font-size: 12px;
      color: var(--app-text, #475569);
      margin: 4px 0 0 0;
    }
  }
}

@media (max-width: 768px) {
  .skills-page {
    padding: 14px;
  }
  .skills-grid {
    grid-template-columns: 1fr;
  }
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <div class="learning-overview-page">
    <!-- Page Header & Sub Navigation -->
    <LearningSubNav
      title="Tổng quan Học tập"
      subtitle="Theo dõi tiến độ học tập, tủ sách, phát triển kỹ năng và thời gian học thực tế."
    >
      <template #action>
        <el-button type="primary" round size="default" :icon="Plus" @click="openQuickSessionModal">
          Ghi phiên học
        </el-button>
      </template>
    </LearningSubNav>

    <!-- 4 High-Impact Hero Stats Cards -->
    <div class="stats-grid" v-loading="loading">
      <!-- Card 1: Learning Time (Hero Week + Today/Month pill) -->
      <div class="stat-card time-card">
        <div class="stat-header">
          <span class="stat-title">Thời gian học tập</span>
          <div class="stat-icon-wrapper week-icon">
            <el-icon><Timer /></el-icon>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ formatDuration(dashboard?.learningTimeThisWeekMinutes || 0) }}</span>
          <span class="stat-subtext">Tuần này</span>
        </div>
        <div class="stat-sub-pills">
          <span class="sub-pill">Hôm nay: <strong>{{ formatDuration(dashboard?.learningTimeTodayMinutes || 0) }}</strong></span>
          <span class="sub-pill">Tháng này: <strong>{{ formatDuration(dashboard?.learningTimeThisMonthMinutes || 0) }}</strong></span>
        </div>
      </div>

      <!-- Card 2: Courses in Progress -->
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Khóa học đang học</span>
          <div class="stat-icon-wrapper course-icon">
            <el-icon><VideoPlay /></el-icon>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ dashboard?.activeCoursesCount || 0 }} <small>khóa</small></span>
          <span class="stat-subtext">Đang trong tiến trình học tập</span>
        </div>
      </div>

      <!-- Card 3: Books Reading -->
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Sách đang đọc</span>
          <div class="stat-icon-wrapper book-icon">
            <el-icon><Reading /></el-icon>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ dashboard?.readingBooksCount || 0 }} <small>cuốn</small></span>
          <span class="stat-subtext">Đang tích cực nghiền ngẫm</span>
        </div>
      </div>

      <!-- Card 4: Skills Practice -->
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Kỹ năng rèn luyện</span>
          <div class="stat-icon-wrapper skill-icon">
            <el-icon><Aim /></el-icon>
          </div>
        </div>
        <div class="stat-value-group">
          <span class="stat-value">{{ dashboard?.activeSkillsCount || 0 }} <small>kỹ năng</small></span>
          <span class="stat-subtext">Đang chủ động phát triển</span>
        </div>
      </div>
    </div>

    <!-- Weekly Activity & Quick Entry Row -->
    <div class="activity-quick-row">
      <!-- 7-Day Activity Chart Card -->
      <div class="card-box activity-card">
        <div class="card-head">
          <div class="head-title">
            <el-icon class="head-icon"><Histogram /></el-icon>
            <h3>Hoạt động học 7 ngày qua</h3>
          </div>
          <span class="head-note">Tính theo phút học thực tế</span>
        </div>
        <div class="chart-container">
          <div v-if="!dashboard?.weeklyActivity?.length" class="empty-chart">
            Chưa có phiên học nào trong 7 ngày qua
          </div>
          <div v-else class="bar-chart">
            <div
              v-for="item in dashboard.weeklyActivity"
              :key="item.date"
              class="bar-col"
            >
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ height: getBarHeightPercent(item.durationMinutes) + '%' }"
                  :class="{ 'has-activity': item.durationMinutes > 0 }"
                >
                  <span v-if="item.durationMinutes > 0" class="bar-tooltip">{{ item.durationMinutes }}p</span>
                </div>
              </div>
              <span class="bar-date">{{ formatShortDate(item.date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Session Log Card -->
      <div class="card-box quick-log-card">
        <div class="card-head">
          <div class="head-title">
            <el-icon class="head-icon"><Lightning /></el-icon>
            <h3>Ghi nhanh phiên học</h3>
          </div>
        </div>
        <el-form :model="quickForm" label-position="top" class="quick-log-form">
          <el-form-item label="Nội dung học" required>
            <el-input v-model="quickForm.title" placeholder="VD: Luyện nghe tiếng Anh, Học Spring Security..." />
          </el-form-item>
          <div class="form-row-2">
            <el-form-item label="Thời lượng (phút)" required>
              <el-input-number v-model="quickForm.durationMinutes" :min="1" :max="1440" :step="5" style="width: 100%" />
            </el-form-item>
            <el-form-item label="Ngày học" required>
              <el-date-picker v-model="quickForm.learningDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </div>
          <div class="form-row-2">
            <el-form-item label="Khóa học liên quan">
              <el-select v-model="quickForm.courseId" placeholder="Chọn khóa học" clearable filterable style="width: 100%">
                <el-option v-for="c in courseOptions" :key="c.id" :label="c.title" :value="c.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="Sách liên quan">
              <el-select v-model="quickForm.bookId" placeholder="Chọn sách" clearable filterable style="width: 100%">
                <el-option v-for="b in bookOptions" :key="b.id" :label="b.title" :value="b.id" />
              </el-select>
            </el-form-item>
          </div>
          <el-form-item label="Kỹ năng liên quan">
            <el-select v-model="quickForm.skillId" placeholder="Chọn kỹ năng" clearable filterable style="width: 100%">
              <el-option v-for="s in skillOptions" :key="s.id" :label="s.name" :value="s.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="Ghi chú chi tiết phiên học">
            <el-input
              v-model="quickForm.notes"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 6 }"
              placeholder="Kiến thức rút ra, bài học cần nhớ hoặc thắc mắc từ buổi học..."
            />
          </el-form-item>
          <el-button type="primary" round :loading="savingQuick" class="submit-btn" @click="submitQuickSession">
            Lưu phiên học ngay
          </el-button>
        </el-form>
      </div>
    </div>

    <!-- Currently Learning Section -->
    <div class="currently-learning-section">
      <div class="section-header">
        <h2 class="section-title">
          <span>Đang học & Rèn luyện</span>
        </h2>
      </div>

      <div class="three-cols-grid">
        <!-- In Progress Courses -->
        <div class="card-box col-card">
          <div class="card-head">
            <div class="head-title">
              <el-icon class="head-icon course-color"><VideoPlay /></el-icon>
              <h3>Khóa học đang theo ({{ dashboard?.inProgressCourses?.length || 0 }})</h3>
            </div>
            <router-link to="/learning/courses" class="see-more">Xem tất cả</router-link>
          </div>
          <div class="items-list">
            <div v-if="!dashboard?.inProgressCourses?.length" class="empty-list">
              Chưa có khóa học nào đang học.
            </div>
            <div
              v-for="c in dashboard?.inProgressCourses"
              :key="c.id"
              class="learning-item-card"
            >
              <div class="item-main">
                <span class="item-title">{{ c.title }}</span>
                <span v-if="c.provider" class="item-subtitle">{{ c.provider }}</span>
              </div>
              <div v-if="c.totalLessons" class="progress-wrap">
                <div class="progress-info">
                  <span>{{ c.completedLessons }}/{{ c.totalLessons }} bài</span>
                  <span>{{ c.progressPercent }}%</span>
                </div>
                <el-progress :percentage="c.progressPercent || 0" :show-text="false" :stroke-width="6" />
              </div>
              <div class="item-meta">
                <el-tag size="small" type="primary" effect="light">{{ c.category || 'Chung' }}</el-tag>
                <span class="time-spent">{{ formatDuration(c.totalDurationMinutes) }} đã học</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Books Reading -->
        <div class="card-box col-card">
          <div class="card-head">
            <div class="head-title">
              <el-icon class="head-icon book-color"><Reading /></el-icon>
              <h3>Sách đang đọc ({{ dashboard?.readingBooks?.length || 0 }})</h3>
            </div>
            <router-link to="/learning/books" class="see-more">Xem tất cả</router-link>
          </div>
          <div class="items-list">
            <div v-if="!dashboard?.readingBooks?.length" class="empty-list">
              Chưa có sách nào đang đọc.
            </div>
            <div
              v-for="b in dashboard?.readingBooks"
              :key="b.id"
              class="learning-item-card"
            >
              <div class="item-main">
                <span class="item-title">{{ b.title }}</span>
                <span v-if="b.author" class="item-subtitle">{{ b.author }}</span>
              </div>
              <div v-if="b.totalPages" class="progress-wrap">
                <div class="progress-info">
                  <span>Trang {{ b.currentPage }}/{{ b.totalPages }}</span>
                  <span>{{ b.progressPercent }}%</span>
                </div>
                <el-progress :percentage="b.progressPercent || 0" :show-text="false" :stroke-width="6" color="#67c23a" />
              </div>
              <div class="item-meta">
                <el-tag size="small" type="success" effect="light">{{ b.category || 'Sách' }}</el-tag>
                <span class="time-spent">{{ formatDuration(b.totalDurationMinutes) }} đã đọc</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Skills -->
        <div class="card-box col-card">
          <div class="card-head">
            <div class="head-title">
              <el-icon class="head-icon skill-color"><Aim /></el-icon>
              <h3>Kỹ năng rèn luyện ({{ dashboard?.activeSkills?.length || 0 }})</h3>
            </div>
            <router-link to="/learning/skills" class="see-more">Xem tất cả</router-link>
          </div>
          <div class="items-list">
            <div v-if="!dashboard?.activeSkills?.length" class="empty-list">
              Chưa có kỹ năng nào đang kích hoạt.
            </div>
            <div
              v-for="s in dashboard?.activeSkills"
              :key="s.id"
              class="learning-item-card"
            >
              <div class="item-main">
                <span class="item-title">{{ s.name }}</span>
                <span class="item-subtitle">{{ getSkillCategoryLabel(s.category) }}</span>
              </div>
              <div class="skill-level-row">
                <div class="level-badge-wrap">
                  <span class="level-name">{{ getSkillLevelName(s.currentLevel) }}</span>
                  <div class="stars-row">
                    <span
                      v-for="i in 5"
                      :key="i"
                      class="star-dot"
                      :class="{ filled: i <= s.currentLevel }"
                    >★</span>
                  </div>
                </div>
                <span v-if="s.targetLevel" class="target-text">Mục tiêu: Lv.{{ s.targetLevel }}</span>
              </div>
              <div class="item-meta">
                <span class="time-spent">{{ formatDuration(s.totalDurationMinutes) }} thực hành</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Sessions Section -->
    <div class="recent-sessions-card card-box">
      <div class="card-head">
        <div class="head-title">
          <el-icon class="head-icon"><List /></el-icon>
          <h3>Phiên học gần đây</h3>
        </div>
        <router-link to="/learning/sessions" class="see-more">Xem tất cả</router-link>
      </div>

      <div class="sessions-list">
        <div v-if="!dashboard?.recentSessions?.length" class="empty-list">
          Chưa có phiên học nào được ghi nhận. Hãy bấm "Ghi phiên học" để bắt đầu!
        </div>
        <div
          v-for="item in dashboard?.recentSessions"
          :key="item.id"
          class="session-row"
        >
          <div class="session-left">
            <div class="duration-badge">
              <span class="dur-num">{{ item.durationMinutes }}</span>
              <span class="dur-unit">phút</span>
            </div>
            <div class="session-details">
              <span class="session-title">{{ item.title }}</span>
              <div class="session-tags">
                <el-tag v-if="item.courseTitle" size="small" type="primary" effect="plain">
                  📚 {{ item.courseTitle }}
                </el-tag>
                <el-tag v-if="item.bookTitle" size="small" type="success" effect="plain">
                  📖 {{ item.bookTitle }}
                </el-tag>
                <el-tag v-if="item.skillName" size="small" type="warning" effect="plain">
                  🎯 {{ item.skillName }}
                </el-tag>
              </div>
              <p v-if="item.notes" class="session-notes">{{ item.notes }}</p>
            </div>
          </div>
          <div class="session-right">
            <span class="session-date">{{ item.learningDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import LearningSubNav from '@/components/learning/LearningSubNav.vue'
import {
  VideoPlay,
  Reading,
  Aim,
  Timer,
  Plus,
  Histogram,
  Lightning,
  List
} from '@element-plus/icons-vue'
import { learningApi } from '@/api/learningApi'
import type {
  LearningDashboard,
  Course,
  Book,
  Skill,
  LearningSessionRequest
} from '@/types/learning'

const loading = ref(false)
const savingQuick = ref(false)
const dashboard = ref<LearningDashboard | null>(null)

const courseOptions = ref<Course[]>([])
const bookOptions = ref<Book[]>([])
const skillOptions = ref<Skill[]>([])

const getTodayString = () => new Date().toISOString().split('T')[0]

const quickForm = ref<LearningSessionRequest>({
  title: '',
  learningDate: getTodayString(),
  durationMinutes: 30,
  courseId: undefined,
  bookId: undefined,
  skillId: undefined,
  notes: ''
})

const formatDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0 phút'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}p`
  if (m === 0) return `${h}h`
  return `${h}h ${m}p`
}

const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`
  }
  return dateStr
}

const getBarHeightPercent = (minutes: number): number => {
  if (!dashboard.value?.weeklyActivity) return 0
  const max = Math.max(...dashboard.value.weeklyActivity.map(i => i.durationMinutes), 60)
  return Math.min(100, Math.round((minutes / max) * 100))
}

const getSkillCategoryLabel = (category: string): string => {
  const map: Record<string, string> = {
    TECHNICAL: 'Kỹ thuật & Công nghệ',
    LANGUAGE: 'Ngoại ngữ',
    SOFT_SKILL: 'Kỹ năng mềm',
    PERSONAL: 'Cá nhân',
    OTHER: 'Khác'
  }
  return map[category] || category
}

const getSkillLevelName = (level: number): string => {
  const map: Record<number, string> = {
    1: 'Lv.1 Beginner',
    2: 'Lv.2 Basic',
    3: 'Lv.3 Intermediate',
    4: 'Lv.4 Advanced',
    5: 'Lv.5 Expert'
  }
  return map[level] || `Lv.${level}`
}

const openQuickSessionModal = () => {
  const el = document.querySelector('.quick-log-card')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const loadDashboard = async () => {
  loading.value = true
  try {
    dashboard.value = await learningApi.getDashboard()
  } catch (err: any) {
    console.error('Failed to load learning dashboard', err)
    ElMessage.error('Không thể tải dữ liệu học tập')
  } finally {
    loading.value = false
  }
}

const loadOptions = async () => {
  try {
    const [cRes, bRes, sRes] = await Promise.all([
      learningApi.getCourses({ size: 100 }),
      learningApi.getBooks({ size: 100 }),
      learningApi.getSkills({ size: 100, isActive: true })
    ])
    courseOptions.value = cRes.content || []
    bookOptions.value = bRes.content || []
    skillOptions.value = sRes.content || []
  } catch (err) {
    console.error('Failed to load selection options', err)
  }
}

const submitQuickSession = async () => {
  if (!quickForm.value.title.trim()) {
    ElMessage.warning('Vui lòng nhập nội dung phiên học')
    return
  }
  if (!quickForm.value.durationMinutes || quickForm.value.durationMinutes <= 0) {
    ElMessage.warning('Thời lượng học phải lớn hơn 0')
    return
  }

  savingQuick.value = true
  try {
    await learningApi.createSession({
      title: quickForm.value.title.trim(),
      learningDate: quickForm.value.learningDate,
      durationMinutes: quickForm.value.durationMinutes,
      courseId: quickForm.value.courseId || undefined,
      bookId: quickForm.value.bookId || undefined,
      skillId: quickForm.value.skillId || undefined,
      notes: quickForm.value.notes?.trim() || undefined
    })
    ElMessage.success('Đã lưu phiên học thành công!')
    quickForm.value.title = ''
    quickForm.value.notes = ''
    await loadDashboard()
  } catch (err: any) {
    console.error('Failed to save session', err)
    ElMessage.error(err.response?.data?.message || 'Lỗi khi lưu phiên học')
  } finally {
    savingQuick.value = false
  }
}

onMounted(() => {
  loadDashboard()
  loadOptions()
})
</script>

<style scoped lang="scss">
.learning-overview-page {
  padding: 24px;
  max-width: 1360px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  .stat-card {
    background: var(--app-card-bg);
    border: 1px solid var(--app-card-border);
    border-radius: 12px;
    padding: 16px 18px;
    box-shadow: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &:hover {
      border-color: rgba(59, 130, 246, 0.4);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .stat-title {
        font-size: 13.5px;
        color: var(--app-text-muted, #64748b);
        font-weight: 500;
      }

      .stat-icon-wrapper {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

        &.week-icon { background: #ede9fe; color: #7c3aed; }
        &.course-icon { background: #dbeafe; color: #2563eb; }
        &.book-icon { background: #dcfce7; color: #16a34a; }
        &.skill-icon { background: #fef3c7; color: #d97706; }
      }
    }

    .stat-value-group {
      .stat-value {
        display: block;
        font-size: 24px;
        font-weight: 700;
        color: var(--app-text, #1e293b);
        line-height: 1.2;

        small {
          font-size: 14px;
          font-weight: 500;
          color: var(--app-text-muted, #64748b);
        }
      }

      .stat-subtext {
        font-size: 12px;
        color: var(--app-text-muted, #94a3b8);
        margin-top: 4px;
        display: block;
      }
    }

    .stat-sub-pills {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dashed var(--app-card-border, #e2e8f0);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      flex-wrap: wrap;

      .sub-pill {
        font-size: 11.5px;
        color: var(--app-text-muted, #64748b);

        strong {
          color: var(--app-text, #1e293b);
          font-weight: 600;
        }
      }
    }
  }
}

.activity-quick-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.card-box {
  background: var(--app-card-bg);
  border: 1px solid var(--app-card-border);
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: none;

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .head-title {
      display: flex;
      align-items: center;
      gap: 8px;

      .head-icon {
        font-size: 18px;
        color: #3b82f6;

        &.course-color { color: #2563eb; }
        &.book-color { color: #16a34a; }
        &.skill-color { color: #dc2626; }
      }

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--app-text, #1e293b);
      }
    }

    .head-note, .see-more {
      font-size: 12px;
      color: var(--app-text-muted, #64748b);
      text-decoration: none;
    }

    .see-more:hover {
      color: #3b82f6;
    }
  }
}

.activity-card {
  .chart-container {
    height: 220px;
    display: flex;
    align-items: flex-end;
    padding-top: 10px;

    .empty-chart {
      width: 100%;
      text-align: center;
      color: var(--app-text-muted, #94a3b8);
      font-size: 13px;
      margin-bottom: 60px;
    }

    .bar-chart {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      gap: 12px;

      .bar-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        cursor: pointer;

        .bar-track {
          flex: 1;
          width: 32px;
          background: var(--app-bg-secondary, #f1f5f9);
          border-radius: 6px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          transition: background-color 0.2s ease;

          .bar-fill {
            width: 100%;
            background: #cbd5e1;
            border-radius: 6px 6px 0 0;
            transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease;
            position: relative;

            &.has-activity {
              background: linear-gradient(180deg, #38bdf8 0%, #0284c7 100%);
              box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
            }

            .bar-tooltip {
              position: absolute;
              top: -20px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 10px;
              font-weight: 600;
              color: var(--app-text, #1e293b);
              white-space: nowrap;
              transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            }
          }
        }

        &:hover {
          .bar-track {
            background: rgba(0, 0, 0, 0.05);
          }
          .bar-fill.has-activity {
            filter: brightness(1.12);
          }
          .bar-tooltip {
            transform: translateX(-50%) translateY(-2px);
          }
          .bar-date {
            color: #0284c7;
            font-weight: 600;
          }
        }

        .bar-date {
          font-size: 11px;
          color: var(--app-text-muted, #64748b);
          margin-top: 8px;
          transition: color 0.2s ease;
        }
      }
    }
  }
}

.quick-log-card {
  .quick-log-form {
    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .submit-btn {
      width: 100%;
      margin-top: 6px;
    }
  }
}

.currently-learning-section {
  margin-bottom: 24px;

  .section-header {
    margin-bottom: 16px;
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--app-text, #1e293b);
      margin: 0;
    }
  }

  .three-cols-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    .col-card {
      padding: 16px;

      .items-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .empty-list {
          padding: 20px 0;
          text-align: center;
          font-size: 13px;
          color: var(--app-text-muted, #94a3b8);
        }

        .learning-item-card {
          padding: 12px;
          border-radius: 10px;
          background: var(--app-bg-secondary, #f8fafc);
          border: 1px solid var(--app-card-border, #f1f5f9);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.2s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
            border-color: rgba(59, 130, 246, 0.3);
          }

          .item-main {
            display: flex;
            flex-direction: column;
            gap: 2px;
            margin-bottom: 8px;

            .item-title {
              font-size: 14px;
              font-weight: 600;
              color: var(--app-text, #1e293b);
            }
            .item-subtitle {
              font-size: 12px;
              color: var(--app-text-muted, #64748b);
            }
          }

          .progress-wrap {
            margin-bottom: 8px;

            .progress-info {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: var(--app-text-muted, #64748b);
              margin-bottom: 4px;
            }
          }

          .skill-level-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .level-badge-wrap {
              display: flex;
              align-items: center;
              gap: 6px;

              .level-name {
                font-size: 12px;
                font-weight: 600;
                color: #e11d48;
              }

              .stars-row {
                display: flex;
                gap: 2px;
                .star-dot {
                  font-size: 12px;
                  color: #e2e8f0;
                  &.filled {
                    color: #f59e0b;
                  }
                }
              }
            }

            .target-text {
              font-size: 11px;
              color: var(--app-text-muted, #64748b);
            }
          }

          .item-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;

            .time-spent {
              color: var(--app-text-muted, #64748b);
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}

.recent-sessions-card {
  .sessions-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .empty-list {
      text-align: center;
      padding: 24px;
      color: var(--app-text-muted, #94a3b8);
      font-size: 13px;
    }

    .session-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      border-radius: 10px;
      background: var(--app-bg-secondary, #f8fafc);
      border: 1px solid var(--app-card-border, #f1f5f9);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
        border-color: rgba(59, 130, 246, 0.3);

        .duration-badge {
          transform: scale(1.06);
        }
      }

      .session-left {
        display: flex;
        align-items: center;
        gap: 14px;

        .duration-badge {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: #e0f2fe;
          color: #0284c7;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);

          .dur-num {
            font-size: 16px;
            font-weight: 700;
            line-height: 1;
          }
          .dur-unit {
            font-size: 10px;
            font-weight: 500;
          }
        }

        .session-details {
          .session-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--app-text, #1e293b);
            display: block;
            margin-bottom: 4px;
          }

          .session-tags {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            margin-bottom: 4px;
          }

          .session-notes {
            margin: 0;
            font-size: 12px;
            color: var(--app-text-muted, #64748b);
          }
        }
      }

      .session-right {
        .session-date {
          font-size: 12px;
          color: var(--app-text-muted, #94a3b8);
          font-weight: 500;
        }
      }
    }
  }
}

/* Mobile Responsiveness */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .currently-learning-section .three-cols-grid {
    grid-template-columns: 1fr;
  }
  .activity-quick-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .learning-overview-page {
    padding: 16px;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .quick-log-card .quick-log-form .form-row-2 {
    grid-template-columns: 1fr;
  }
  .session-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    .session-right {
      align-self: flex-end;
    }
  }
}
</style>

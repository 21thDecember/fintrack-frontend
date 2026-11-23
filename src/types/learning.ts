export type CourseStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
export type CoursePriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Course {
  id: string
  userId: string
  goalId?: string | null
  goalTitle?: string | null
  title: string
  description?: string | null
  provider?: string | null
  url?: string | null
  category?: string | null
  status: CourseStatus
  priority: CoursePriority
  startDate?: string | null
  targetDate?: string | null
  estimatedHours?: number | null
  totalLessons?: number | null
  completedLessons: number
  progressPercent?: number | null
  totalDurationMinutes: number
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface CourseRequest {
  title: string
  description?: string
  provider?: string
  url?: string
  category?: string
  status?: CourseStatus
  priority?: CoursePriority
  startDate?: string
  targetDate?: string
  estimatedHours?: number
  totalLessons?: number
  completedLessons?: number
  goalId?: string | null
  notes?: string
}

export type BookStatus = 'WANT_TO_READ' | 'READING' | 'COMPLETED' | 'PAUSED' | 'DROPPED'

export interface Book {
  id: string
  userId: string
  goalId?: string | null
  goalTitle?: string | null
  title: string
  author?: string | null
  description?: string | null
  isbn?: string | null
  category?: string | null
  url?: string | null
  status: BookStatus
  totalPages?: number | null
  currentPage: number
  progressPercent?: number | null
  totalDurationMinutes: number
  startDate?: string | null
  targetDate?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface BookRequest {
  title: string
  author?: string
  description?: string
  isbn?: string
  category?: string
  url?: string
  status?: BookStatus
  totalPages?: number
  currentPage?: number
  startDate?: string
  targetDate?: string
  goalId?: string | null
  notes?: string
}

export type SkillCategory = 'TECHNICAL' | 'LANGUAGE' | 'SOFT_SKILL' | 'PERSONAL' | 'OTHER'

export interface SkillHistory {
  id: string
  skillId: string
  previousLevel: number
  newLevel: number
  note?: string | null
  changedAt: string
}

export interface Skill {
  id: string
  userId: string
  goalId?: string | null
  goalTitle?: string | null
  name: string
  description?: string | null
  category: SkillCategory
  currentLevel: number
  targetLevel?: number | null
  isActive: boolean
  totalDurationMinutes: number
  history?: SkillHistory[]
  createdAt: string
  updatedAt: string
}

export interface SkillRequest {
  name: string
  description?: string
  category?: SkillCategory
  currentLevel: number
  targetLevel?: number
  isActive?: boolean
  goalId?: string | null
}

export type SessionSource = 'MANUAL' | 'TIMER'

export interface LearningSession {
  id: string
  userId: string
  courseId?: string | null
  courseTitle?: string | null
  bookId?: string | null
  bookTitle?: string | null
  skillId?: string | null
  skillName?: string | null
  title: string
  description?: string | null
  learningDate: string
  startTime?: string | null
  endTime?: string | null
  durationMinutes: number
  source: SessionSource
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface LearningSessionRequest {
  title: string
  description?: string
  learningDate: string
  startTime?: string
  endTime?: string
  durationMinutes: number
  courseId?: string | null
  bookId?: string | null
  skillId?: string | null
  source?: SessionSource
  notes?: string
}

export interface DailyLearningTimeItem {
  date: string
  durationMinutes: number
}

export interface CategoryTimeItem {
  id: string
  name: string
  durationMinutes: number
}

export interface LearningDashboard {
  learningTimeTodayMinutes: number
  learningTimeThisWeekMinutes: number
  learningTimeThisMonthMinutes: number
  activeCoursesCount: number
  readingBooksCount: number
  activeSkillsCount: number
  inProgressCourses: Course[]
  readingBooks: Book[]
  activeSkills: Skill[]
  recentSessions: LearningSession[]
  weeklyActivity: DailyLearningTimeItem[]
}

export interface LearningStatistics {
  totalDurationMinutes: number
  totalSessionsCount: number
  activeDaysCount: number
  timeByCourse: CategoryTimeItem[]
  timeByBook: CategoryTimeItem[]
  timeBySkill: CategoryTimeItem[]
}

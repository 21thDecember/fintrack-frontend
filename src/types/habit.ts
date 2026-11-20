export type HabitFrequency = 'DAILY' | 'WEEKLY'

export interface CheckinResponse {
  id: string
  habitId: string
  completionDate: string
  count: number
  note?: string | null
  createdAt: string
}

export interface Habit {
  id: string
  userId: string
  goalId?: string | null
  goalTitle?: string | null
  name: string
  description?: string | null
  frequency: HabitFrequency
  targetCount: number
  activeDays: string[]
  startDate: string
  endDate?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string

  // Progress & Streak Metrics
  currentStreak: number
  longestStreak: number
  totalCompletedDays: number
  completionRate: number
  isCompletedToday?: boolean
  completedToday?: boolean
  todayCount: number
  recentCheckins?: CheckinResponse[]
}

export interface HabitRequest {
  name: string
  description?: string | null
  frequency?: HabitFrequency
  targetCount?: number
  activeDays?: string[]
  startDate?: string | null
  endDate?: string | null
  goalId?: string | null
  isActive?: boolean
}

export interface CheckinRequest {
  date?: string
  count?: number
  note?: string
}

export interface TodayHabit {
  id: string
  name: string
  description?: string | null
  frequency: HabitFrequency
  targetCount: number
  todayCount: number
  isCompletedToday?: boolean
  completedToday?: boolean
  currentStreak: number
  goalId?: string | null
  goalTitle?: string | null
}

export interface HabitStatistics {
  totalHabits: number
  activeHabits: number
  todayScheduledCount: number
  completedTodayCount: number
  overallCompletionRate: number
}

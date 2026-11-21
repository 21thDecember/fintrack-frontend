export type ReviewStatus = 'DRAFT' | 'COMPLETED'

export interface WeeklyReview {
  id: string
  userId: string
  weekStartDate: string
  weekEndDate: string
  summary?: string | null
  wins?: string | null
  challenges?: string | null
  lessonsLearned?: string | null
  improvements?: string | null
  nextWeekPriorities?: string | null
  additionalNotes?: string | null
  status: ReviewStatus
  completedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface WeeklyReviewRequest {
  weekStartDate: string
  summary?: string | null
  wins?: string | null
  challenges?: string | null
  lessonsLearned?: string | null
  improvements?: string | null
  nextWeekPriorities?: string | null
  additionalNotes?: string | null
  status?: ReviewStatus
}

export interface WeeklySummary {
  weekStartDate: string
  weekEndDate: string
  journalDaysCount: number
  moodDaysCount: number
  averageMood?: number | null
  averageEnergy?: number | null
  completedTasksCount: number
  totalTasksCount: number
  habitCheckinsCount: number
}

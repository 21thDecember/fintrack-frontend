import type { Task } from './task'
import type { Habit } from './habit'

export type GoalCategory = 'CAREER' | 'LEARNING' | 'FINANCE' | 'HEALTH' | 'PERSONAL' | 'OTHER'

export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type MilestoneStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED'

export interface Milestone {
  id: string
  goalId: string
  title: string
  description?: string | null
  dueDate?: string | null
  status: MilestoneStatus
  displayOrder: number
  completedAt?: string | null
  createdAt: string
}

export interface MilestoneRequest {
  title: string
  description?: string | null
  dueDate?: string | null
  status?: MilestoneStatus
  displayOrder?: number
}

export interface Goal {
  id: string
  userId: string
  title: string
  description?: string | null
  category: GoalCategory
  priority: GoalPriority
  status: GoalStatus
  startDate?: string | null
  targetDate?: string | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
  isOverdue?: boolean

  progressPercentage: number
  totalMilestones: number
  completedMilestones: number

  milestones?: Milestone[]
  linkedTasks?: Task[]
  linkedHabits?: Habit[]
}

export interface GoalRequest {
  title: string
  description?: string | null
  category?: GoalCategory
  priority?: GoalPriority
  status?: GoalStatus
  startDate?: string | null
  targetDate?: string | null
}

export interface GoalProgress {
  goalId: string
  totalMilestones: number
  completedMilestones: number
  progressPercentage: number
  linkedTasksCount: number
  completedTasksCount: number
  linkedHabitsCount: number
}

export interface GoalStatistics {
  totalGoals: number
  notStartedGoals: number
  inProgressGoals: number
  completedGoals: number
  cancelledGoals: number
  overdueGoals: number
  averageProgressPercentage: number
}

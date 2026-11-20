export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Task {
  id: string
  userId: string
  parentTaskId?: string | null
  goalId?: string | null
  goalTitle?: string | null
  title: string
  description?: string | null
  priority: TaskPriority
  status: TaskStatus
  startDate?: string | null
  dueDate?: string | null
  estimatedMinutes?: number | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
  isOverdue?: boolean
  subtasks?: Task[]
  subtaskCount: number
  completedSubtaskCount: number
}

export interface TaskRequest {
  title: string
  description?: string | null
  priority?: TaskPriority
  status?: TaskStatus
  startDate?: string | null
  dueDate?: string | null
  goalId?: string | null
  parentTaskId?: string | null
  estimatedMinutes?: number | null
}

export interface TaskStatusUpdateRequest {
  status: TaskStatus
}

export interface TaskStatistics {
  totalTasks: number
  todoTasks: number
  inProgressTasks: number
  completedTasks: number
  cancelledTasks: number
  overdueTasks: number
  completionRate: number
}

export interface TaskFilterParams {
  page?: number
  size?: number
  keyword?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDateFrom?: string
  dueDateTo?: string
  goalId?: string
  view?: 'today' | 'upcoming' | 'overdue' | 'completed' | 'all'
  parentOnly?: boolean
}

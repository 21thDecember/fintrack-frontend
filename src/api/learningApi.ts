import apiClient from './client'
import type {
  Course,
  CourseRequest,
  CourseStatus,
  Book,
  BookRequest,
  BookStatus,
  Skill,
  SkillRequest,
  SkillCategory,
  SkillHistory,
  LearningSession,
  LearningSessionRequest,
  LearningDashboard,
  LearningStatistics
} from '@/types/learning'
import type { ApiResponse, PageResponse } from '@/types/api'

export const learningApi = {
  // --- COURSES ---
  getCourses: async (params?: {
    keyword?: string
    status?: CourseStatus
    category?: string
    goalId?: string
    page?: number
    size?: number
    sortBy?: string
    direction?: string
  }): Promise<PageResponse<Course>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Course>>>('/learning/courses', { params })
    return res.data.data
  },

  getCourseById: async (id: string): Promise<Course> => {
    const res = await apiClient.get<ApiResponse<Course>>(`/learning/courses/${id}`)
    return res.data.data
  },

  createCourse: async (data: CourseRequest): Promise<Course> => {
    const res = await apiClient.post<ApiResponse<Course>>('/learning/courses', data)
    return res.data.data
  },

  updateCourse: async (id: string, data: CourseRequest): Promise<Course> => {
    const res = await apiClient.put<ApiResponse<Course>>(`/learning/courses/${id}`, data)
    return res.data.data
  },

  updateCourseStatus: async (id: string, status: CourseStatus): Promise<Course> => {
    const res = await apiClient.patch<ApiResponse<Course>>(`/learning/courses/${id}/status`, { status })
    return res.data.data
  },

  updateCourseProgress: async (id: string, completedLessons: number, totalLessons?: number): Promise<Course> => {
    const res = await apiClient.patch<ApiResponse<Course>>(`/learning/courses/${id}/progress`, {
      completedLessons,
      totalLessons
    })
    return res.data.data
  },

  deleteCourse: async (id: string): Promise<void> => {
    await apiClient.delete(`/learning/courses/${id}`)
  },

  // --- BOOKS ---
  getBooks: async (params?: {
    keyword?: string
    status?: BookStatus
    category?: string
    goalId?: string
    page?: number
    size?: number
    sortBy?: string
    direction?: string
  }): Promise<PageResponse<Book>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Book>>>('/learning/books', { params })
    return res.data.data
  },

  getBookById: async (id: string): Promise<Book> => {
    const res = await apiClient.get<ApiResponse<Book>>(`/learning/books/${id}`)
    return res.data.data
  },

  addBook: async (data: BookRequest): Promise<Book> => {
    const res = await apiClient.post<ApiResponse<Book>>('/learning/books', data)
    return res.data.data
  },

  updateBook: async (id: string, data: BookRequest): Promise<Book> => {
    const res = await apiClient.put<ApiResponse<Book>>(`/learning/books/${id}`, data)
    return res.data.data
  },

  updateBookStatus: async (id: string, status: BookStatus): Promise<Book> => {
    const res = await apiClient.patch<ApiResponse<Book>>(`/learning/books/${id}/status`, { status })
    return res.data.data
  },

  updateReadingProgress: async (id: string, currentPage: number, totalPages?: number): Promise<Book> => {
    const res = await apiClient.patch<ApiResponse<Book>>(`/learning/books/${id}/progress`, {
      currentPage,
      totalPages
    })
    return res.data.data
  },

  deleteBook: async (id: string): Promise<void> => {
    await apiClient.delete(`/learning/books/${id}`)
  },

  // --- SKILLS ---
  getSkills: async (params?: {
    keyword?: string
    category?: SkillCategory
    isActive?: boolean
    goalId?: string
    page?: number
    size?: number
    sortBy?: string
    direction?: string
  }): Promise<PageResponse<Skill>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Skill>>>('/learning/skills', { params })
    return res.data.data
  },

  getSkillById: async (id: string): Promise<Skill> => {
    const res = await apiClient.get<ApiResponse<Skill>>(`/learning/skills/${id}`)
    return res.data.data
  },

  createSkill: async (data: SkillRequest): Promise<Skill> => {
    const res = await apiClient.post<ApiResponse<Skill>>('/learning/skills', data)
    return res.data.data
  },

  updateSkill: async (id: string, data: SkillRequest): Promise<Skill> => {
    const res = await apiClient.put<ApiResponse<Skill>>(`/learning/skills/${id}`, data)
    return res.data.data
  },

  updateSkillLevel: async (id: string, newLevel: number, note?: string): Promise<Skill> => {
    const res = await apiClient.patch<ApiResponse<Skill>>(`/learning/skills/${id}/level`, { newLevel, note })
    return res.data.data
  },

  getSkillHistory: async (id: string): Promise<SkillHistory[]> => {
    const res = await apiClient.get<ApiResponse<SkillHistory[]>>(`/learning/skills/${id}/history`)
    return res.data.data
  },

  deleteSkill: async (id: string): Promise<void> => {
    await apiClient.delete(`/learning/skills/${id}`)
  },

  // --- LEARNING SESSIONS ---
  getSessions: async (params?: {
    from?: string
    to?: string
    courseId?: string
    bookId?: string
    skillId?: string
    keyword?: string
    page?: number
    size?: number
    sortBy?: string
    direction?: string
  }): Promise<PageResponse<LearningSession>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<LearningSession>>>('/learning/sessions', { params })
    return res.data.data
  },

  getSessionById: async (id: string): Promise<LearningSession> => {
    const res = await apiClient.get<ApiResponse<LearningSession>>(`/learning/sessions/${id}`)
    return res.data.data
  },

  createSession: async (data: LearningSessionRequest): Promise<LearningSession> => {
    const res = await apiClient.post<ApiResponse<LearningSession>>('/learning/sessions', data)
    return res.data.data
  },

  updateSession: async (id: string, data: LearningSessionRequest): Promise<LearningSession> => {
    const res = await apiClient.put<ApiResponse<LearningSession>>(`/learning/sessions/${id}`, data)
    return res.data.data
  },

  deleteSession: async (id: string): Promise<void> => {
    await apiClient.delete(`/learning/sessions/${id}`)
  },

  // --- DASHBOARD & STATISTICS ---
  getDashboard: async (): Promise<LearningDashboard> => {
    const res = await apiClient.get<ApiResponse<LearningDashboard>>('/learning/dashboard')
    return res.data.data
  },

  getStatistics: async (): Promise<LearningStatistics> => {
    const res = await apiClient.get<ApiResponse<LearningStatistics>>('/learning/statistics')
    return res.data.data
  }
}

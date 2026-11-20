import { defineStore } from 'pinia'
import { ref } from 'vue'
import { taskApi } from '@/api/taskApi'
import type { Task, TaskRequest, TaskStatistics, TaskStatus, TaskPriority } from '@/types/task'
import { ElMessage } from 'element-plus'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const statistics = ref<TaskStatistics | null>(null)
  const totalElements = ref(0)
  const totalPages = ref(1)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)
  const statsLoading = ref(false)

  const activeView = ref<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('today')

  const filters = ref<{
    keyword?: string
    status?: TaskStatus
    priority?: TaskPriority
    goalId?: string
    dueDateFrom?: string
    dueDateTo?: string
  }>({})

  async function fetchTasks(page = currentPage.value) {
    loading.value = true
    currentPage.value = page
    try {
      const res = await taskApi.getTasks({
        page: currentPage.value - 1,
        size: pageSize.value,
        keyword: filters.value.keyword || undefined,
        status: filters.value.status || undefined,
        priority: filters.value.priority || undefined,
        goalId: filters.value.goalId || undefined,
        dueDateFrom: filters.value.dueDateFrom || undefined,
        dueDateTo: filters.value.dueDateTo || undefined,
        view: activeView.value === 'all' ? undefined : activeView.value,
        parentOnly: true
      })
      tasks.value = res.content || []
      totalElements.value = res.totalElements || 0
      totalPages.value = res.totalPages || 1
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể tải danh sách công việc')
    } finally {
      loading.value = false
    }
  }

  async function fetchStatistics() {
    statsLoading.value = true
    try {
      statistics.value = await taskApi.getStatistics()
    } catch (err) {
      console.error('Failed to load task statistics', err)
    } finally {
      statsLoading.value = false
    }
  }

  async function createTask(data: TaskRequest): Promise<Task> {
    try {
      const created = await taskApi.createTask(data)
      ElMessage.success('Tạo công việc mới thành công')
      await Promise.all([fetchTasks(), fetchStatistics()])
      return created
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể tạo công việc')
      throw err
    }
  }

  async function updateTask(id: string, data: TaskRequest): Promise<Task> {
    try {
      const updated = await taskApi.updateTask(id, data)
      ElMessage.success('Cập nhật công việc thành công')
      await Promise.all([fetchTasks(), fetchStatistics()])
      return updated
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể cập nhật công việc')
      throw err
    }
  }

  async function updateStatus(id: string, status: TaskStatus): Promise<Task> {
    try {
      const updated = await taskApi.updateStatus(id, { status })
      // Update local state optimistically or with server data
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = { ...tasks.value[index], ...updated }
        if (status === 'COMPLETED' && tasks.value[index].subtasks) {
          tasks.value[index].subtasks = tasks.value[index].subtasks.map(s => ({
            ...s,
            status: 'COMPLETED'
          }))
          tasks.value[index].completedSubtaskCount = tasks.value[index].subtasks.length
        }
      }
      fetchStatistics()
      return updated
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể cập nhật trạng thái')
      throw err
    }
  }

  async function deleteTask(id: string): Promise<void> {
    try {
      await taskApi.deleteTask(id)
      ElMessage.success('Xóa công việc thành công')
      await Promise.all([fetchTasks(), fetchStatistics()])
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể xóa công việc')
      throw err
    }
  }

  async function toggleSubtask(parentTask: Task, subtask: Task): Promise<void> {
    const newStatus: TaskStatus = subtask.status === 'COMPLETED' ? 'TODO' : 'COMPLETED'
    try {
      const updated = await taskApi.updateStatus(subtask.id, { status: newStatus })
      if (parentTask.subtasks) {
        const subIndex = parentTask.subtasks.findIndex(s => s.id === subtask.id)
        if (subIndex !== -1) {
          parentTask.subtasks[subIndex] = { ...parentTask.subtasks[subIndex], ...updated }
        }
        parentTask.completedSubtaskCount = parentTask.subtasks.filter(s => s.status === 'COMPLETED').length
      }
      fetchStatistics()
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể cập nhật công việc phụ')
    }
  }

  return {
    tasks,
    statistics,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    loading,
    statsLoading,
    activeView,
    filters,
    fetchTasks,
    fetchStatistics,
    createTask,
    updateTask,
    updateStatus,
    deleteTask,
    toggleSubtask
  }
})

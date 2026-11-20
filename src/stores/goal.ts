import { defineStore } from 'pinia'
import { ref } from 'vue'
import { goalApi } from '@/api/goalApi'
import type { Goal, GoalRequest, MilestoneRequest, GoalStatistics, GoalCategory, GoalStatus } from '@/types/goal'
import { ElMessage } from 'element-plus'

export const useGoalStore = defineStore('goal', () => {
  const goals = ref<Goal[]>([])
  const currentGoal = ref<Goal | null>(null)
  const statistics = ref<GoalStatistics | null>(null)
  const loading = ref(false)
  const detailLoading = ref(false)

  const selectedCategory = ref<GoalCategory | 'ALL'>('ALL')
  const selectedStatus = ref<GoalStatus | 'ALL'>('ALL')

  async function fetchGoals() {
    loading.value = true
    try {
      const categoryParam = selectedCategory.value === 'ALL' ? undefined : selectedCategory.value
      const statusParam = selectedStatus.value === 'ALL' ? undefined : selectedStatus.value
      goals.value = await goalApi.getGoals({ category: categoryParam, status: statusParam })
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể tải danh sách mục tiêu')
    } finally {
      loading.value = false
    }
  }

  async function fetchGoalById(id: string) {
    detailLoading.value = true
    try {
      currentGoal.value = await goalApi.getGoalById(id)
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể tải chi tiết mục tiêu')
    } finally {
      detailLoading.value = false
    }
  }

  async function fetchStatistics() {
    try {
      statistics.value = await goalApi.getStatistics()
    } catch (err) {
      console.error('Failed to load goal statistics', err)
    }
  }

  async function createGoal(data: GoalRequest): Promise<Goal> {
    try {
      const created = await goalApi.createGoal(data)
      ElMessage.success('Tạo mục tiêu thành công')
      await Promise.all([fetchGoals(), fetchStatistics()])
      return created
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể tạo mục tiêu')
      throw err
    }
  }

  async function updateGoal(id: string, data: GoalRequest): Promise<Goal> {
    try {
      const updated = await goalApi.updateGoal(id, data)
      ElMessage.success('Cập nhật mục tiêu thành công')
      if (currentGoal.value?.id === id) {
        await fetchGoalById(id)
      }
      await Promise.all([fetchGoals(), fetchStatistics()])
      return updated
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể cập nhật mục tiêu')
      throw err
    }
  }

  async function deleteGoal(id: string): Promise<void> {
    try {
      await goalApi.deleteGoal(id)
      ElMessage.success('Xóa mục tiêu thành công')
      await Promise.all([fetchGoals(), fetchStatistics()])
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể xóa mục tiêu')
      throw err
    }
  }

  async function addMilestone(goalId: string, data: MilestoneRequest): Promise<void> {
    try {
      await goalApi.createMilestone(goalId, data)
      ElMessage.success('Thêm cột mốc thành công')
      await fetchGoalById(goalId)
      fetchGoals()
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể thêm cột mốc')
      throw err
    }
  }

  async function updateMilestone(goalId: string, milestoneId: string, data: MilestoneRequest): Promise<void> {
    try {
      await goalApi.updateMilestone(goalId, milestoneId, data)
      await fetchGoalById(goalId)
      fetchGoals()
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể cập nhật cột mốc')
      throw err
    }
  }

  async function deleteMilestone(goalId: string, milestoneId: string): Promise<void> {
    try {
      await goalApi.deleteMilestone(goalId, milestoneId)
      ElMessage.success('Xóa cột mốc thành công')
      await fetchGoalById(goalId)
      fetchGoals()
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể xóa cột mốc')
      throw err
    }
  }

  return {
    goals,
    currentGoal,
    statistics,
    loading,
    detailLoading,
    selectedCategory,
    selectedStatus,
    fetchGoals,
    fetchGoalById,
    fetchStatistics,
    createGoal,
    updateGoal,
    deleteGoal,
    addMilestone,
    updateMilestone,
    deleteMilestone
  }
})

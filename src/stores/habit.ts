import { defineStore } from 'pinia'
import { ref } from 'vue'
import { habitApi } from '@/api/habitApi'
import type { Habit, HabitRequest, TodayHabit, HabitStatistics, CheckinResponse } from '@/types/habit'
import { ElMessage } from 'element-plus'

function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const useHabitStore = defineStore('habit', () => {
  const habits = ref<Habit[]>([])
  const todayHabits = ref<TodayHabit[]>([])
  const selectedDate = ref<string>(getTodayDateString())
  const dateHabits = ref<TodayHabit[]>([])
  const weekCheckins = ref<CheckinResponse[]>([])
  const statistics = ref<HabitStatistics | null>(null)
  const loading = ref(false)
  const todayLoading = ref(false)
  const dateLoading = ref(false)

  async function fetchHabits(goalId?: string) {
    loading.value = true
    try {
      habits.value = await habitApi.getHabits({ goalId })
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể tải danh sách thói quen')
    } finally {
      loading.value = false
    }
  }

  async function fetchTodayHabits() {
    todayLoading.value = true
    try {
      todayHabits.value = await habitApi.getTodayHabits()
    } catch (err) {
      console.error('Failed to load today habits', err)
    } finally {
      todayLoading.value = false
    }
  }

  async function fetchHabitsByDate(date?: string) {
    const target = date || selectedDate.value || getTodayDateString()
    selectedDate.value = target
    dateLoading.value = true
    try {
      dateHabits.value = await habitApi.getHabitsByDate(target)
    } catch (err) {
      console.error('Failed to load habits by date', err)
    } finally {
      dateLoading.value = false
    }
  }

  async function fetchWeekCheckins(from?: string, to?: string) {
    try {
      weekCheckins.value = await habitApi.getCheckins({ from, to })
    } catch (err) {
      console.error('Failed to load week checkins', err)
    }
  }

  async function fetchStatistics() {
    try {
      statistics.value = await habitApi.getStatistics()
    } catch (err) {
      console.error('Failed to load habit statistics', err)
    }
  }

  async function createHabit(data: HabitRequest): Promise<Habit> {
    try {
      const created = await habitApi.createHabit(data)
      ElMessage.success('Tạo thói quen mới thành công')
      await Promise.all([fetchHabits(), fetchTodayHabits(), fetchStatistics()])
      return created
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể tạo thói quen')
      throw err
    }
  }

  async function updateHabit(id: string, data: HabitRequest): Promise<Habit> {
    try {
      const updated = await habitApi.updateHabit(id, data)
      ElMessage.success('Cập nhật thói quen thành công')
      await Promise.all([fetchHabits(), fetchTodayHabits(), fetchStatistics()])
      return updated
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể cập nhật thói quen')
      throw err
    }
  }

  async function deleteHabit(id: string): Promise<void> {
    try {
      await habitApi.deleteHabit(id)
      ElMessage.success('Xóa thói quen thành công')
      await Promise.all([fetchHabits(), fetchTodayHabits(), fetchStatistics()])
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể xóa thói quen')
      throw err
    }
  }

  async function checkin(habitId: string, date?: string): Promise<void> {
    try {
      await habitApi.checkin(habitId, { date })
      ElMessage.success('Đã điểm danh thói quen thành công! 🎉')
      await Promise.all([
        fetchHabits(),
        fetchTodayHabits(),
        fetchHabitsByDate(selectedDate.value),
        fetchStatistics()
      ])
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể điểm danh')
      throw err
    }
  }

  async function removeCheckin(habitId: string, date: string): Promise<void> {
    try {
      await habitApi.removeCheckin(habitId, date)
      ElMessage.success('Đã hủy điểm danh')
      await Promise.all([
        fetchHabits(),
        fetchTodayHabits(),
        fetchHabitsByDate(selectedDate.value),
        fetchStatistics()
      ])
    } catch (err: any) {
      ElMessage.error(err.response?.data?.message || 'Không thể hủy điểm danh')
      throw err
    }
  }

  return {
    habits,
    todayHabits,
    selectedDate,
    dateHabits,
    weekCheckins,
    statistics,
    loading,
    todayLoading,
    dateLoading,
    fetchHabits,
    fetchTodayHabits,
    fetchHabitsByDate,
    fetchWeekCheckins,
    fetchStatistics,
    createHabit,
    updateHabit,
    deleteHabit,
    checkin,
    removeCheckin
  }
})

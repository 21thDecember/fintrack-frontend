import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categoryApi } from '@/api/categoryApi'
import type { Category, CreateCategoryDto, UpdateCategoryDto, CategoryType } from '@/types/category'
import { ElMessage } from 'element-plus'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)

  const activeCategories = computed(() => categories.value.filter(c => c.isActive))
  const activeIncomeCategories = computed(() => activeCategories.value.filter(c => c.type === 'INCOME'))
  const activeExpenseCategories = computed(() => activeCategories.value.filter(c => c.type === 'EXPENSE'))
  const incomeCategories = computed(() => categories.value.filter(c => c.type === 'INCOME'))
  const expenseCategories = computed(() => categories.value.filter(c => c.type === 'EXPENSE'))

  async function fetchCategories(type?: CategoryType) {
    loading.value = true
    try {
      const data = await categoryApi.getCategories(type)
      categories.value = data || []
    } catch (err) {
      console.error('Failed to fetch categories', err)
    } finally {
      loading.value = false
    }
  }

  async function createCategory(data: CreateCategoryDto) {
    loading.value = true
    try {
      const created = await categoryApi.createCategory(data)
      categories.value.push(created)
      ElMessage.success('Đã thêm danh mục thành công')
      return created
    } catch (err) {
      console.error('Failed to create category', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCategory(id: string, data: UpdateCategoryDto) {
    loading.value = true
    try {
      const updated = await categoryApi.updateCategory(id, data)
      const idx = categories.value.findIndex(c => c.id === id)
      if (idx !== -1) categories.value[idx] = updated
      ElMessage.success('Đã cập nhật danh mục')
      return updated
    } catch (err) {
      console.error('Failed to update category', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const updated = await categoryApi.toggleActive(id, isActive)
      const idx = categories.value.findIndex(c => c.id === id)
      if (idx !== -1) categories.value[idx] = updated
      ElMessage.success(isActive ? 'Đã kích hoạt danh mục' : 'Đã ẩn danh mục')
    } catch (err) {
      console.error('Failed to toggle category active status', err)
      throw err
    }
  }

  return {
    categories,
    activeCategories,
    activeIncomeCategories,
    activeExpenseCategories,
    incomeCategories,
    expenseCategories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    toggleActive
  }
})

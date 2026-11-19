import { defineStore } from 'pinia'
import { ref } from 'vue'
import { personApi } from '@/api/personApi'
import type { Person, CreatePersonDto } from '@/types/person'
import { ElMessage } from 'element-plus'

export const usePersonStore = defineStore('person', () => {
  const persons = ref<Person[]>([])
  const loading = ref(false)

  async function fetchPersons(search?: string) {
    loading.value = true
    try {
      const data = await personApi.getPersons(search)
      persons.value = data || []
    } catch (err) {
      console.error('Failed to fetch persons', err)
    } finally {
      loading.value = false
    }
  }

  async function createPerson(data: CreatePersonDto): Promise<Person> {
    loading.value = true
    try {
      const created = await personApi.createPerson(data)
      persons.value.push(created)
      ElMessage.success(`Đã thêm người liên hệ: ${created.name}`)
      return created
    } catch (err) {
      console.error('Failed to create person', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    persons,
    loading,
    fetchPersons,
    createPerson
  }
})

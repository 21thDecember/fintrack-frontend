import apiClient from './client'
import type { Person, CreatePersonDto, UpdatePersonDto } from '@/types/person'
import type { ApiResponse } from '@/types/api'

export const personApi = {
  getPersons: async (search?: string): Promise<Person[]> => {
    const res = await apiClient.get<ApiResponse<Person[]>>('/persons', {
      params: { search }
    })
    return res.data.data
  },

  getPersonById: async (id: string): Promise<Person> => {
    const res = await apiClient.get<ApiResponse<Person>>(`/persons/${id}`)
    return res.data.data
  },

  createPerson: async (data: CreatePersonDto): Promise<Person> => {
    const res = await apiClient.post<ApiResponse<Person>>('/persons', data)
    return res.data.data
  },

  updatePerson: async (id: string, data: UpdatePersonDto): Promise<Person> => {
    const res = await apiClient.put<ApiResponse<Person>>(`/persons/${id}`, data)
    return res.data.data
  },

  deletePerson: async (id: string): Promise<void> => {
    await apiClient.delete(`/persons/${id}`)
  }
}

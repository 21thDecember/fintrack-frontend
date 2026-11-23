import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/authApi'
import type { User, LoginCredentials } from '@/types/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return null
    const parsed = JSON.parse(raw)
    if (parsed && (parsed.fullName === 'Quản trị viên' || parsed.fullName === 'Nguyễn Quản Trị')) {
      parsed.fullName = 'Phạm Huỳnh Văn Phát'
      localStorage.setItem('user', JSON.stringify(parsed))
    }
    return parsed
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(getStoredUser())
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials: LoginCredentials) {
    loading.value = true
    try {
      const response = await authApi.login(credentials)
      token.value = response.token
      
      const username = response.username || response.user?.username || credentials.username
      const userObj: User = {
        id: response.user?.id || 'usr-admin',
        username: username,
        fullName: response.user?.fullName || 'Phạm Huỳnh Văn Phát',
        role: response.user?.role || 'ROLE_ADMIN'
      }
      user.value = userObj
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(userObj))
      
      ElMessage.success(`Xin chào, ${userObj.fullName || userObj.username}!`)
      await router.push('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      ElMessage.error(err.response?.data?.message || 'Đăng nhập không thành công, vui lòng kiểm tra lại!')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch (err) {
      console.warn('Logout warning:', err)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      ElMessage.info('Đã đăng xuất thành công.')
      router.push('/login')
    }
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    login,
    logout
  }
})

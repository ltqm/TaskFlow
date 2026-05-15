import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { register, login, getUser } from '@/services/api'
import { toast } from 'vue-sonner'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function handleLogin(email: string, password: string) {
    loading.value = true
    try {
      const result = await login(email, password)
      token.value = result.token
      user.value = result.user
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function handleRegister(username: string, email: string, password: string) {
    loading.value = true
    try {
      const result = await register(username, email, password)
      token.value = result.token
      user.value = result.user
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function loadUser() {
    if (token.value && !user.value) {
      try {
        user.value = await getUser()
      } catch (error) {
        console.error('Failed to load user:', error)
        toast.error('登录状态已失效或网络异常，请重新登录')
        logout()
      }
    } else if (localStorage.getItem('user')) {
      user.value = JSON.parse(localStorage.getItem('user')!)
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    handleLogin,
    handleRegister,
    loadUser,
    logout
  }
})
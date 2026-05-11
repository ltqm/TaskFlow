<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const username = ref('')
const showPassword = ref(false)
const error = ref('')

const title = computed(() => isLogin.value ? '登录' : '注册')

async function handleSubmit() {
  error.value = ''
  
  if (!email.value || !password.value) {
    error.value = '请填写所有必填字段'
    return
  }
  
  if (!isLogin.value && !username.value) {
    error.value = '请填写用户名'
    return
  }

  try {
    if (isLogin.value) {
      await authStore.handleLogin(email.value, password.value)
    } else {
      await authStore.handleRegister(username.value, email.value, password.value)
    }
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.error || '操作失败，请重试'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div class="w-full max-w-md p-6">
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
            <span class="text-white text-2xl font-bold">T</span>
          </div>
          <h1 class="text-3xl font-bold text-white">{{ title }}</h1>
          <p class="text-gray-400 mt-2">管理你的日常任务</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="!isLogin" class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">用户名</label>
            <input
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">邮箱</label>
            <input
              v-model="email"
              type="email"
              placeholder="请输入邮箱"
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">密码</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="w-full px-4 py-3 pr-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <Eye v-if="showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div v-if="error" class="text-red-400 text-sm text-center">{{ error }}</div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <LogIn v-if="isLogin" class="w-5 h-5" />
            <UserPlus v-else class="w-5 h-5" />
            {{ authStore.loading ? '处理中...' : title }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <button
            @click="isLogin = !isLogin"
            class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {{ isLogin ? '还没有账号？点击注册' : '已有账号？点击登录' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRemindersStore } from '@/stores/reminders'
import { Home, ListChecks, GitBranch, BarChart2, Settings, LogOut, Bell } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const remindersStore = useRemindersStore()

const navItems = [
  { name: '首页', icon: Home, path: '/' },
  { name: '任务', icon: ListChecks, path: '/tasks' },
  { name: '版本', icon: GitBranch, path: '/versions' },
  { name: '统计', icon: BarChart2, path: '/stats' },
  { name: '设置', icon: Settings, path: '/settings' }
]

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="fixed left-0 top-0 h-screen w-64 bg-gray-800 border-r border-gray-700">
    <div class="p-6">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold">T</span>
        </div>
        <span class="text-xl font-bold text-white">任务管理</span>
      </div>

      <div class="space-y-2">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
          :class="router.currentRoute.value.path === item.path ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
        >
          <component :is="item.icon" class="w-5 h-5" />
          {{ item.name }}
        </router-link>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
      <router-link
        to="/reminders"
        class="flex items-center gap-3 px-4 py-3 mb-4 rounded-lg hover:bg-gray-700 cursor-pointer transition-all"
        :class="router.currentRoute.value.path === '/reminders' ? 'bg-blue-600 text-white' : 'text-gray-300'"
      >
        <Bell class="w-5 h-5" :class="router.currentRoute.value.path === '/reminders' ? 'text-white' : 'text-gray-400'" />
        <span>提醒</span>
        <span 
          v-if="remindersStore.unreadCount > 0"
          class="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
        >
          {{ remindersStore.unreadCount }}
        </span>
      </router-link>
      
      <button
        @click="logout"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
      >
        <LogOut class="w-5 h-5" />
        退出登录
      </button>
    </div>
  </nav>
</template>
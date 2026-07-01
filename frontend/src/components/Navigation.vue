<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRemindersStore } from '@/stores/reminders'
import { Home, ListChecks, GitBranch, BarChart2, Settings, LogOut, Bell } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'

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
  <nav class="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card">
    <div class="p-6">
      <div class="mb-8 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <span class="text-white font-bold">T</span>
        </div>
        <span class="text-xl font-bold tracking-tight text-foreground">任务管理</span>
      </div>

      <div class="space-y-1.5">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors"
          :class="router.currentRoute.value.path === item.path ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'"
        >
          <component :is="item.icon" class="w-5 h-5" />
          {{ item.name }}
        </router-link>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 right-0 border-t border-border/80 p-6">
      <router-link
        to="/reminders"
        class="mb-4 flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-all hover:bg-secondary"
        :class="router.currentRoute.value.path === '/reminders' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'"
      >
        <Bell class="w-5 h-5" :class="router.currentRoute.value.path === '/reminders' ? 'text-primary-foreground' : 'text-muted-foreground'" />
        <span>提醒</span>
        <Badge 
          v-if="remindersStore.unreadCount > 0"
          variant="destructive"
          class="ml-auto"
        >
          {{ remindersStore.unreadCount }}
        </Badge>
      </router-link>
      
      <Button
        @click="logout"
        variant="ghost"
        class="w-full justify-start gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <LogOut class="w-5 h-5" />
        退出登录
      </Button>
    </div>
  </nav>
</template>
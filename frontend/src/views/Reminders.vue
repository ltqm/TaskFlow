<script setup lang="ts">
import { computed } from 'vue'
import { useRemindersStore } from '@/stores/reminders'
import { useTasksStore } from '@/stores/tasks'
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  X, 
  ChevronRight,
  Tag,
  Eye
} from 'lucide-vue-next'

const remindersStore = useRemindersStore()
const tasksStore = useTasksStore()

const selectedFilter = computed(() => 'all')

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500'
}

const priorityLabels = {
  high: '高',
  medium: '中',
  low: '低'
}

const hasDismissedReminders = computed(() => {
  return remindersStore.allReminders.length > remindersStore.unreadCount
})

function getTimeRemaining(dueDate: string): string {
  const now = new Date()
  const due = new Date(dueDate)
  const diff = due.getTime() - now.getTime()
  
  if (diff < 0) {
    const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60))
    if (hours < 1) {
      const minutes = Math.floor(Math.abs(diff) / (1000 * 60))
      return `已过期 ${minutes} 分钟`
    }
    return `已过期 ${hours} 小时`
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours === 0) {
    return `${minutes} 分钟后到期`
  }
  return `${hours} 小时 ${minutes} 分钟后到期`
}

function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getCategoryName(categoryId: string | null): string {
  if (!categoryId) return '未分类'
  const category = tasksStore.categories.find(c => c.id === categoryId)
  return category?.name || '未分类'
}
</script>

<template>
  <div class="ml-64 p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bell class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-white">提醒中心</h1>
            <p class="text-gray-400 mt-1">
              {{ remindersStore.allReminders.length }} 条待处理提醒
            </p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="remindersStore.allReminders.length > 0"
          @click="remindersStore.dismissAll"
          class="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          全部忽略
        </button>
        <button
          v-if="hasDismissedReminders"
          @click="remindersStore.restoreAll"
          class="px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          恢复提醒
        </button>
      </div>
    </div>

    <div class="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <Bell class="w-5 h-5 text-gray-400" />
          <span class="text-gray-300">筛选:</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="px-4 py-2 rounded-lg transition-colors"
            :class="selectedFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
          >
            全部
          </button>
          <button
            class="px-4 py-2 rounded-lg transition-colors"
            :class="selectedFilter === 'overdue' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
          >
            已过期
          </button>
          <button
            class="px-4 py-2 rounded-lg transition-colors"
            :class="selectedFilter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
          >
            即将到期
          </button>
        </div>
      </div>
    </div>

    <div v-if="remindersStore.allReminders.length === 0" class="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
      <div class="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle class="w-10 h-10 text-green-500" />
      </div>
      <h3 class="text-xl font-semibold text-gray-300 mb-2">暂无待处理提醒</h3>
      <p class="text-gray-500">所有任务都已按时完成，继续保持！</p>
    </div>

    <div v-else class="space-y-4">
      <div v-if="remindersStore.expiredTasks.length > 0" class="space-y-3">
        <div class="flex items-center gap-2 mb-3">
          <AlertTriangle class="w-5 h-5 text-red-500" />
          <h3 class="text-lg font-semibold text-red-400">已过期</h3>
          <span class="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
            {{ remindersStore.expiredTasks.length }}
          </span>
        </div>
        
        <div
          v-for="task in remindersStore.expiredTasks"
          :key="task.id"
          class="bg-gray-800 rounded-xl p-4 border border-red-900/30 hover:border-red-700/50 transition-all cursor-pointer"
        >
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle class="w-5 h-5 text-red-500" />
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <h4 class="font-medium text-white truncate">{{ task.title }}</h4>
                <span 
                  v-if="task.priority"
                  class="px-2 py-0.5 text-xs rounded-full text-white flex-shrink-0"
                  :class="priorityColors[task.priority]"
                >
                  {{ priorityLabels[task.priority] }}
                </span>
              </div>
              
              <div class="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span class="flex items-center gap-1">
                  <Tag class="w-4 h-4" />
                  {{ getCategoryName(task.categoryId) }}
                </span>
                <span class="flex items-center gap-1">
                  <Clock class="w-4 h-4 text-red-400" />
                  {{ formatDueDate(task.dueDate!) }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm text-red-400">{{ getTimeRemaining(task.dueDate!) }}</span>
                <div class="flex items-center gap-2">
                  <button
                    @click="remindersStore.markTaskComplete(task.id)"
                    class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                  >
                    <CheckCircle class="w-4 h-4" />
                    标记完成
                  </button>
                  <button
                    @click="remindersStore.dismissReminder(task.id)"
                    class="px-3 py-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700 text-sm rounded-lg transition-colors flex items-center gap-1"
                  >
                    <X class="w-4 h-4" />
                    忽略
                  </button>
                  <button
                    class="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <ChevronRight class="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      <div v-if="remindersStore.upcomingTasks.length > 0" class="space-y-3">
        <div class="flex items-center gap-2 mb-3">
          <Clock class="w-5 h-5 text-blue-400" />
          <h3 class="text-lg font-semibold text-blue-400">即将到期</h3>
          <span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
            {{ remindersStore.upcomingTasks.length }}
          </span>
        </div>
        
        <div
          v-for="task in remindersStore.upcomingTasks"
          :key="task.id"
          class="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer"
        >
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock class="w-5 h-5 text-blue-500" />
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <h4 class="font-medium text-white truncate">{{ task.title }}</h4>
                <span 
                  v-if="task.priority"
                  class="px-2 py-0.5 text-xs rounded-full text-white flex-shrink-0"
                  :class="priorityColors[task.priority]"
                >
                  {{ priorityLabels[task.priority] }}
                </span>
              </div>
              
              <div class="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span class="flex items-center gap-1">
                  <Tag class="w-4 h-4" />
                  {{ getCategoryName(task.categoryId) }}
                </span>
                <span class="flex items-center gap-1">
                  <Clock class="w-4 h-4 text-blue-400" />
                  {{ formatDueDate(task.dueDate!) }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm text-blue-400">{{ getTimeRemaining(task.dueDate!) }}</span>
                <div class="flex items-center gap-2">
                  <button
                    @click="remindersStore.markTaskComplete(task.id)"
                    class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                  >
                    <CheckCircle class="w-4 h-4" />
                    标记完成
                  </button>
                  <button
                    @click="remindersStore.dismissReminder(task.id)"
                    class="px-3 py-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700 text-sm rounded-lg transition-colors flex items-center gap-1"
                  >
                    <X class="w-4 h-4" />
                    忽略
                  </button>
                  <button
                    class="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <ChevronRight class="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
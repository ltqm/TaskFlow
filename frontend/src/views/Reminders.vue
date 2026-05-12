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
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'

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
  <div class="ml-64 min-h-screen bg-background p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Bell class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-foreground">提醒中心</h1>
            <p class="mt-1 text-muted-foreground">
              {{ remindersStore.allReminders.length }} 条待处理提醒
            </p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Button
          v-if="remindersStore.allReminders.length > 0"
          @click="remindersStore.dismissAll"
          variant="outline"
        >
          全部忽略
        </Button>
        <Button
          v-if="hasDismissedReminders"
          @click="remindersStore.restoreAll"
          variant="secondary"
        >
          恢复提醒
        </Button>
      </div>
    </div>

    <div class="mb-6 rounded-xl border border-border/80 bg-card p-4">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <Bell class="w-5 h-5 text-muted-foreground" />
          <span class="text-foreground/90">筛选:</span>
        </div>
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            class="px-4 py-2 rounded-lg transition-colors"
            :class="selectedFilter === 'all' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'"
          >
            全部
          </Button>
          <Button
            variant="ghost"
            class="px-4 py-2 rounded-lg transition-colors"
            :class="selectedFilter === 'overdue' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'"
          >
            已过期
          </Button>
          <Button
            variant="ghost"
            class="px-4 py-2 rounded-lg transition-colors"
            :class="selectedFilter === 'upcoming' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'"
          >
            即将到期
          </Button>
        </div>
      </div>
    </div>

    <div v-if="remindersStore.allReminders.length === 0" class="rounded-xl border border-border/80 bg-card p-12 text-center">
      <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
        <CheckCircle class="w-10 h-10 text-green-500" />
      </div>
      <h3 class="mb-2 text-xl font-semibold text-foreground">暂无待处理提醒</h3>
      <p class="text-muted-foreground">所有任务都已按时完成，继续保持！</p>
    </div>

    <div v-else class="space-y-4">
      <div v-if="remindersStore.expiredTasks.length > 0" class="space-y-3">
        <div class="flex items-center gap-2 mb-3">
          <AlertTriangle class="w-5 h-5 text-red-500" />
          <h3 class="text-lg font-semibold text-red-400">已过期</h3>
          <Badge variant="destructive" class="bg-red-500/20 text-red-400">
            {{ remindersStore.expiredTasks.length }}
          </Badge>
        </div>
        
        <div
          v-for="task in remindersStore.expiredTasks"
          :key="task.id"
          class="cursor-pointer rounded-xl border border-red-500/25 bg-card p-4 transition-all hover:border-red-400/45"
        >
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle class="w-5 h-5 text-red-500" />
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <h4 class="truncate font-medium text-foreground">{{ task.title }}</h4>
                <span 
                  v-if="task.priority"
                  class="px-2 py-0.5 text-xs rounded-full text-white flex-shrink-0"
                  :class="priorityColors[task.priority]"
                >
                  {{ priorityLabels[task.priority] }}
                </span>
              </div>
              
              <div class="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
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
                  <Button
                    @click="remindersStore.markTaskComplete(task.id)"
                    size="sm"
                    class="h-8 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle class="w-4 h-4" />
                    标记完成
                  </Button>
                  <Button
                    @click="remindersStore.dismissReminder(task.id)"
                    size="sm"
                    variant="outline"
                    class="h-8 border-border text-muted-foreground hover:text-foreground"
                  >
                    <X class="w-4 h-4" />
                    忽略
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    class="h-8 w-8 text-muted-foreground hover:text-primary"
                  >
                    <Eye class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <ChevronRight class="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div v-if="remindersStore.upcomingTasks.length > 0" class="space-y-3">
        <div class="flex items-center gap-2 mb-3">
          <Clock class="w-5 h-5 text-blue-400" />
          <h3 class="text-lg font-semibold text-blue-400">即将到期</h3>
          <Badge class="bg-blue-500/20 text-blue-400">
            {{ remindersStore.upcomingTasks.length }}
          </Badge>
        </div>
        
        <div
          v-for="task in remindersStore.upcomingTasks"
          :key="task.id"
          class="cursor-pointer rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-border"
        >
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock class="w-5 h-5 text-blue-500" />
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <h4 class="truncate font-medium text-foreground">{{ task.title }}</h4>
                <span 
                  v-if="task.priority"
                  class="px-2 py-0.5 text-xs rounded-full text-white flex-shrink-0"
                  :class="priorityColors[task.priority]"
                >
                  {{ priorityLabels[task.priority] }}
                </span>
              </div>
              
              <div class="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
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
                  <Button
                    @click="remindersStore.markTaskComplete(task.id)"
                    size="sm"
                    class="h-8 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle class="w-4 h-4" />
                    标记完成
                  </Button>
                  <Button
                    @click="remindersStore.dismissReminder(task.id)"
                    size="sm"
                    variant="outline"
                    class="h-8 border-border text-muted-foreground hover:text-foreground"
                  >
                    <X class="w-4 h-4" />
                    忽略
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    class="h-8 w-8 text-muted-foreground hover:text-primary"
                  >
                    <Eye class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <ChevronRight class="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
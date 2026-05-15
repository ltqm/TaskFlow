<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useAuthStore } from '@/stores/auth'
import TaskCard from '@/components/TaskCard.vue'
import { Plus, Clock, CheckCircle, AlertCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/card/Card.vue'
import Button from '@/components/ui/button/Button.vue'

const tasksStore = useTasksStore()
const authStore = useAuthStore()
const router = useRouter()

const todayTasks = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return tasksStore.pendingTasks.filter(task => {
    if (!task.dueDate) return false
    return task.dueDate === today || task.dueDate < today
  }).slice(0, 5)
})

const upcomingTasks = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return tasksStore.pendingTasks.filter(task => {
    if (!task.dueDate) return false
    return task.dueDate > today
  }).slice(0, 5)
})
</script>

<template>
  <div class="ml-64 min-h-screen bg-background p-8">
    <div class="mb-8">
      <h1 class="mb-2 text-3xl font-bold tracking-tight text-foreground">欢迎回来，{{ authStore.user?.username }}</h1>
      <p class="text-muted-foreground">今天是 {{ new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
    </div>

    <div class="grid grid-cols-4 gap-6 mb-8">
      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <span class="text-muted-foreground">待完成任务</span>
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
            <Clock class="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-foreground">{{ tasksStore.pendingTasks.length }}</div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <span class="text-muted-foreground">已完成</span>
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15">
            <CheckCircle class="w-5 h-5 text-green-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-foreground">{{ tasksStore.completedTasks.length }}</div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <span class="text-muted-foreground">高优先级</span>
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/15">
            <AlertCircle class="w-5 h-5 text-red-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-foreground">{{ tasksStore.highPriorityTasks.length }}</div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <span class="text-muted-foreground">任务总数</span>
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15">
            <Plus class="w-5 h-5 text-purple-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-foreground">{{ tasksStore.tasks.length }}</div>
      </Card>
    </div>

    <div class="grid grid-cols-2 gap-8">
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-foreground">待处理任务</h2>
          <Button
            @click="router.push('/tasks')"
            variant="ghost"
            class="text-primary hover:text-primary"
          >
            查看全部
          </Button>
        </div>
        <div class="space-y-3">
          <TaskCard
            v-for="task in todayTasks"
            :key="task.id"
            :task="task"
          />
          <Card v-if="todayTasks.length === 0" class="p-8 text-center">
            <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p class="text-muted-foreground">暂无今天到期或已逾期的待办</p>
            <p class="mt-1 text-sm text-muted-foreground/80">为任务设置截止日期后，将在此显示</p>
          </Card>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-foreground">即将到期</h2>
          <Button
            @click="router.push('/tasks')"
            variant="ghost"
            class="text-primary hover:text-primary"
          >
            查看全部
          </Button>
        </div>
        <div class="space-y-3">
          <TaskCard
            v-for="task in upcomingTasks"
            :key="task.id"
            :task="task"
          />
          <Card v-if="upcomingTasks.length === 0" class="p-8 text-center">
            <Clock class="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
            <p class="text-muted-foreground">暂无即将到期的任务</p>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
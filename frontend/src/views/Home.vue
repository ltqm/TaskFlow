<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useAuthStore } from '@/stores/auth'
import TaskCard from '@/components/TaskCard.vue'
import { Plus, Clock, CheckCircle, AlertCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

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
  <div class="ml-64 p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">欢迎回来，{{ authStore.user?.username }}</h1>
      <p class="text-gray-400">今天是 {{ new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
    </div>

    <div class="grid grid-cols-4 gap-6 mb-8">
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-400">待完成任务</span>
          <div class="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <Clock class="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-white">{{ tasksStore.pendingTasks.length }}</div>
      </div>

      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-400">已完成</span>
          <div class="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
            <CheckCircle class="w-5 h-5 text-green-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-white">{{ tasksStore.completedTasks.length }}</div>
      </div>

      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-400">高优先级</span>
          <div class="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
            <AlertCircle class="w-5 h-5 text-red-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-white">{{ tasksStore.highPriorityTasks.length }}</div>
      </div>

      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-400">任务总数</span>
          <div class="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <Plus class="w-5 h-5 text-purple-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-white">{{ tasksStore.tasks.length }}</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-8">
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-white">待处理任务</h2>
          <button
            @click="router.push('/tasks')"
            class="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            查看全部
          </button>
        </div>
        <div class="space-y-3">
          <TaskCard
            v-for="task in todayTasks"
            :key="task.id"
            :task="task"
          />
          <div v-if="todayTasks.length === 0" class="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
            <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p class="text-gray-400">今日任务已完成！</p>
          </div>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-white">即将到期</h2>
          <button
            @click="router.push('/tasks')"
            class="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            查看全部
          </button>
        </div>
        <div class="space-y-3">
          <TaskCard
            v-for="task in upcomingTasks"
            :key="task.id"
            :task="task"
          />
          <div v-if="upcomingTasks.length === 0" class="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
            <Clock class="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p class="text-gray-400">暂无即将到期的任务</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
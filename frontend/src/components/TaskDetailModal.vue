<script setup lang="ts">
import type { Task } from '@/types'
import { useTasksStore } from '@/stores/tasks'
import { X, CheckCircle, Circle, Clock, Tag, GitBranch, AlertCircle, FileText } from 'lucide-vue-next'

defineProps<{
  task: Task
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  edit: [task: Task]
}>()

const tasksStore = useTasksStore()

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500'
}

const priorityLabels = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级'
}

const statusLabels = {
  pending: '待处理',
  inProgress: '进行中',
  completed: '已完成'
}

async function toggleComplete(task: Task) {
  await tasksStore.updateTaskById(task.id, { isCompleted: !task.isCompleted })
}

async function deleteTask(task: Task) {
  if (confirm('确定要删除这个任务吗？')) {
    await tasksStore.deleteTaskById(task.id)
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div class="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-white">任务详情</h2>
            <button 
              @click="emit('close')" 
              class="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <div class="flex items-start gap-4">
            <button
              @click="toggleComplete(task)"
              class="mt-1 transition-colors"
              :class="task.isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-white'"
            >
              <CheckCircle v-if="task.isCompleted" class="w-8 h-8" />
              <Circle v-else class="w-8 h-8" />
            </button>
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 
                  class="text-2xl font-bold"
                  :class="task.isCompleted ? 'text-gray-400 line-through' : 'text-white'"
                >
                  {{ task.title }}
                </h3>
                <span 
                  v-if="task.priority"
                  class="px-3 py-1 text-sm rounded-full text-white"
                  :class="priorityColors[task.priority]"
                >
                  {{ priorityLabels[task.priority] }}
                </span>
              </div>
              <span 
                class="px-3 py-1 text-sm rounded-full"
                :class="task.isCompleted ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'"
              >
                {{ task.isCompleted ? '已完成' : '待处理' }}
              </span>
            </div>
          </div>

          <div v-if="task.description" class="bg-gray-700/50 rounded-xl p-4">
            <p class="text-gray-300">{{ task.description }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div v-if="task.categoryName" class="flex items-center gap-2 text-gray-400">
              <Tag class="w-5 h-5 text-blue-400" />
              <span>{{ task.categoryName }}</span>
            </div>
            <div v-if="task.versionName" class="flex items-center gap-2 text-gray-400">
              <GitBranch class="w-5 h-5 text-purple-400" />
              <span>{{ task.versionName }}</span>
            </div>
            <div v-if="task.dueDate" class="flex items-center gap-2 text-gray-400">
              <Clock class="w-5 h-5 text-orange-400" />
              <span>{{ new Date(task.dueDate).toLocaleDateString('zh-CN') }}</span>
            </div>
            <div v-if="task.reminderTime" class="flex items-center gap-2 text-gray-400">
              <AlertCircle class="w-5 h-5 text-yellow-400" />
              <span>{{ task.reminderTime }}</span>
            </div>
          </div>

          <div v-if="task.tags?.length" class="flex flex-wrap gap-2">
            <span
              v-for="tag in task.tags"
              :key="tag"
              class="flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-lg text-gray-300"
            >
              <Tag class="w-3 h-3" />
              {{ tag }}
            </span>
          </div>

          <div v-if="task.notes" class="bg-gray-700/50 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-2 text-gray-400">
              <FileText class="w-5 h-5" />
              <span class="font-medium">备注</span>
            </div>
            <p class="text-gray-300">{{ task.notes }}</p>
          </div>

          <div class="border-t border-gray-700 pt-6">
            <div class="flex items-center justify-between text-sm text-gray-500">
              <span>创建时间: {{ new Date(task.createdAt).toLocaleString('zh-CN') }}</span>
              <span v-if="task.updatedAt !== task.createdAt">
                更新时间: {{ new Date(task.updatedAt).toLocaleString('zh-CN') }}
              </span>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-4 flex items-center justify-end gap-3">
          <button
            @click="deleteTask(task)"
            class="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            删除任务
          </button>
          <button
            @click="emit('edit', task)"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            编辑任务
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { Task } from '@/types'
import { useTasksStore } from '@/stores/tasks'
import { CheckCircle, Circle, Clock, Tag, Trash2, Edit3, FileText, ChevronDown, ChevronUp } from 'lucide-vue-next'

defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  edit: [task: Task]
  view: [task: Task]
}>()

const tasksStore = useTasksStore()
const showFullNotes = ref(false)

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

async function toggleComplete(task: Task) {
  await tasksStore.updateTaskById(task.id, { isCompleted: !task.isCompleted })
}

async function deleteTask(task: Task) {
  if (confirm('确定要删除这个任务吗？')) {
    await tasksStore.deleteTaskById(task.id)
  }
}

function toggleNotes() {
  showFullNotes.value = !showFullNotes.value
}

function getTruncatedNotes(notes: string, maxLength: number = 50) {
  if (notes.length <= maxLength) return notes
  return notes.substring(0, maxLength) + '...'
}
</script>

<template>
  <div 
    class="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer"
    :class="{ 'opacity-60': task.isCompleted }"
    @click="emit('view', task)"
  >
    <div class="flex items-start gap-3">
      <button
        @click.stop="toggleComplete(task)"
        class="mt-1 transition-colors flex-shrink-0"
        :class="task.isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-white'"
      >
        <CheckCircle v-if="task.isCompleted" class="w-5 h-5" />
        <Circle v-else class="w-5 h-5" />
      </button>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h3 
            class="font-medium truncate"
            :class="task.isCompleted ? 'text-gray-400 line-through' : 'text-white'"
          >
            {{ task.title }}
          </h3>
          <span 
            v-if="task.priority"
            class="px-2 py-0.5 text-xs rounded-full text-white flex-shrink-0"
            :class="priorityColors[task.priority]"
          >
            {{ priorityLabels[task.priority] }}
          </span>
        </div>

        <p v-if="task.description" class="text-gray-400 text-sm truncate mb-2">
          {{ task.description }}
        </p>

        <div v-if="task.notes" class="mb-2">
          <div class="flex items-start gap-2 bg-gray-700/50 rounded-lg p-3">
            <FileText class="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-gray-300 text-sm">
                {{ showFullNotes ? task.notes : getTruncatedNotes(task.notes) }}
              </p>
              <button 
                v-if="task.notes.length > 50"
                @click.stop="toggleNotes"
                class="text-blue-400 text-xs mt-1 hover:text-blue-300 flex items-center gap-1"
              >
                {{ showFullNotes ? '收起' : '展开' }}
                <ChevronUp v-if="showFullNotes" class="w-3 h-3" />
                <ChevronDown v-else class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <span v-if="task.categoryName" class="flex items-center gap-1">
            <Tag class="w-3 h-3" />
            {{ task.categoryName }}
          </span>
          <span v-if="task.versionName" class="flex items-center gap-1">
            <Tag class="w-3 h-3 text-purple-400" />
            {{ task.versionName }}
          </span>
          <span v-if="task.dueDate" class="flex items-center gap-1">
            <Clock class="w-3 h-3" />
            {{ new Date(task.dueDate).toLocaleDateString('zh-CN') }}
          </span>
          <span v-if="task.tags?.length" class="flex items-center gap-1">
            <span class="flex gap-1">
              <span 
                v-for="tag in task.tags.slice(0, 3)" 
                :key="tag"
                class="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300"
              >
                {{ tag }}
              </span>
              <span v-if="task.tags.length > 3" class="text-gray-400">+{{ task.tags.length - 3 }}</span>
            </span>
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          @click.stop="emit('edit', task)"
          class="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-all"
        >
          <Edit3 class="w-4 h-4" />
        </button>
        <button
          @click.stop="deleteTask(task)"
          class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-all"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { Task, SubTask } from '@/types'
import { useTasksStore } from '@/stores/tasks'
import { 
  X, 
  CheckCircle, 
  Circle, 
  Clock, 
  Tag, 
  GitBranch, 
  AlertCircle, 
  FileText,
  Plus,
  Trash2,
  Edit3,
  ListChecks
} from 'lucide-vue-next'

const props = defineProps<{
  task: Task
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  edit: [task: Task]
}>()

const tasksStore = useTasksStore()

const subTasks = ref<SubTask[]>([])
const newSubTaskTitle = ref('')
const isAddingSubTask = ref(false)

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

const completedCount = computed(() => subTasks.value.filter(st => st.isCompleted).length)
const totalCount = computed(() => subTasks.value.length)
const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

watch(() => props.show, async (newVal) => {
  if (newVal) {
    await nextTick()
    if (props.task) {
      await loadSubTasks()
    }
  }
})

async function loadSubTasks() {
  try {
    const result = await tasksStore.fetchSubTasks(props.task.id)
    subTasks.value = result
  } catch (error) {
    console.error('Failed to load sub tasks:', error)
    subTasks.value = []
  }
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

async function toggleSubTaskComplete(subTask: SubTask) {
  await tasksStore.updateSubTask(subTask.id, { isCompleted: !subTask.isCompleted })
  await loadSubTasks()
}

async function addSubTask() {
  if (!newSubTaskTitle.value.trim()) return
  
  await tasksStore.addSubTask(props.task.id, newSubTaskTitle.value)
  newSubTaskTitle.value = ''
  isAddingSubTask.value = false
  await loadSubTasks()
}

async function deleteSubTask(subTask: SubTask) {
  if (confirm('确定要删除这个子任务吗？')) {
    await tasksStore.deleteSubTask(subTask.id)
    await loadSubTasks()
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
            <div v-if="task.category" class="flex items-center gap-2 text-gray-400">
              <Tag class="w-5 h-5 text-blue-400" />
              <span>{{ task.category }}</span>
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
            <div class="flex items-center gap-3 mb-4">
              <ListChecks class="w-5 h-5 text-blue-400" />
              <h4 class="font-semibold text-white">子任务</h4>
              <span v-if="totalCount > 0" class="text-sm text-gray-400">
                {{ completedCount }}/{{ totalCount }} 完成
              </span>
            </div>

            <div v-if="totalCount > 0" class="mb-4">
              <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-blue-600 transition-all duration-500"
                  :style="{ width: `${progressPercent}%` }"
                ></div>
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <div
                v-for="subTask in subTasks"
                :key="subTask.id"
                class="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg"
              >
                <button
                  @click="toggleSubTaskComplete(subTask)"
                  class="flex-shrink-0 transition-colors"
                  :class="subTask.isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-white'"
                >
                  <CheckCircle v-if="subTask.isCompleted" class="w-5 h-5" />
                  <Circle v-else class="w-5 h-5" />
                </button>
                <span 
                  class="flex-1 text-sm"
                  :class="subTask.isCompleted ? 'text-gray-400 line-through' : 'text-gray-300'"
                >
                  {{ subTask.title }}
                </span>
                <button
                  @click="deleteSubTask(subTask)"
                  class="p-1 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div v-if="isAddingSubTask" class="mb-4">
              <div class="flex items-center gap-2">
                <input
                  v-model="newSubTaskTitle"
                  type="text"
                  placeholder="输入子任务标题"
                  class="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @keyup.enter="addSubTask"
                />
                <button
                  @click="addSubTask"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  添加
                </button>
                <button
                  @click="isAddingSubTask = false"
                  class="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>

            <button
              v-else
              @click="isAddingSubTask = true"
              class="flex items-center gap-2 px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors w-full"
            >
              <Plus class="w-5 h-5" />
              添加子任务
            </button>
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
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Edit3 class="w-4 h-4" />
            编辑任务
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
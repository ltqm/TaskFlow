<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import TaskCard from '@/components/TaskCard.vue'
import TaskDetailModal from '@/components/TaskDetailModal.vue'
import { Plus, Search, Filter, X, Tag, Clock, AlertCircle } from 'lucide-vue-next'
import type { Task } from '@/types'

const tasksStore = useTasksStore()

const showModal = ref(false)
const showDetailModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const selectedCategory = ref<string>('')
const selectedPriority = ref('all')

const form = ref({
  title: '',
  description: '',
  categoryId: null as string | null,
  versionId: null as string | null,
  priority: 'medium' as 'high' | 'medium' | 'low',
  dueDate: '',
  reminderTime: '',
  tags: [] as string[],
  notes: '',
  totalPomodoros: 4
})

const editingTask = ref<Task | null>(null)
const viewingTask = ref<Task | null>(null)

const filteredTasks = computed(() => {
  let result = tasksStore.tasks

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  if (selectedCategory.value) {
    result = result.filter(task => task.categoryId === selectedCategory.value)
  }

  if (selectedPriority.value !== 'all') {
    result = result.filter(task => task.priority === selectedPriority.value)
  }

  return result.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const categoryOptions = computed(() => [
  { id: '', name: '所有分类' },
  ...tasksStore.categories.map(cat => ({ id: cat.id, name: cat.name }))
])

const priorityOptions = [
  { value: 'all', label: '所有优先级' },
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' }
]

watch(showModal, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

function resetForm() {
  form.value = {
    title: '',
    description: '',
    categoryId: null,
    versionId: null,
    priority: 'medium',
    dueDate: '',
    reminderTime: '',
    tags: [],
    notes: '',
    totalPomodoros: 4
  }
  isEditing.value = false
  editingTask.value = null
}

function openModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function openDetailModal(task: Task) {
  viewingTask.value = task
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  viewingTask.value = null
}

function editTask(task: Task) {
  editingTask.value = task
  form.value = {
    title: task.title,
    description: task.description,
    categoryId: task.categoryId,
    versionId: task.versionId || null,
    priority: task.priority,
    dueDate: task.dueDate || '',
    reminderTime: task.reminderTime || '',
    tags: [...task.tags],
    notes: task.notes,
    totalPomodoros: task.totalPomodoros
  }
  isEditing.value = true
  showModal.value = true
}

async function handleSubmit() {
  try {
    if (!form.value.title.trim()) {
      alert('请输入任务标题')
      return
    }

    if (isEditing.value && editingTask.value) {
      await tasksStore.updateTaskById(editingTask.value.id, {
        title: form.value.title,
        description: form.value.description,
        categoryId: form.value.categoryId,
        versionId: form.value.versionId,
        priority: form.value.priority,
        dueDate: form.value.dueDate || null,
        reminderTime: form.value.reminderTime || null,
        tags: form.value.tags,
        notes: form.value.notes,
        totalPomodoros: form.value.totalPomodoros
      })
    } else {
      await tasksStore.addTask({
        title: form.value.title,
        description: form.value.description,
        categoryId: form.value.categoryId,
        versionId: form.value.versionId,
        priority: form.value.priority,
        dueDate: form.value.dueDate || null,
        reminderTime: form.value.reminderTime || null,
        tags: form.value.tags,
        notes: form.value.notes,
        totalPomodoros: form.value.totalPomodoros
      })
    }
    closeModal()
  } catch (error) {
    console.error('Failed to save task:', error)
    alert('保存任务失败')
  }
}

function addTag() {
  const newTag = prompt('输入标签名称：')
  if (newTag && !form.value.tags.includes(newTag.trim())) {
    form.value.tags.push(newTag.trim())
  }
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

onMounted(async () => {
  if (!tasksStore.categories.length) {
    await tasksStore.fetchCategories()
  }
})
</script>

<template>
  <div class="ml-64 p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white">任务管理</h1>
        <p class="text-gray-400 mt-1">管理你的日常任务和待办事项</p>
      </div>
      <button
        @click="openModal"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <Plus class="w-5 h-5" />
        新建任务
      </button>
    </div>

    <div class="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
      <div class="flex items-center gap-4">
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索任务..."
            class="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex items-center gap-2">
          <Filter class="w-5 h-5 text-gray-400" />
          <select
            v-model="selectedCategory"
            class="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="cat in categoryOptions" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
          <select
            v-model="selectedPriority"
            class="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="p in priorityOptions" :key="p.value" :value="p.value">
              {{ p.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="filteredTasks.length === 0" class="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
      <div class="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <Tag class="w-10 h-10 text-gray-500" />
      </div>
      <h3 class="text-xl font-semibold text-gray-300 mb-2">暂无任务</h3>
      <p class="text-gray-500">点击右上角按钮创建你的第一个任务</p>
    </div>

    <div v-else class="grid grid-cols-3 gap-4">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @edit="editTask"
        @view="openDetailModal"
      />
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-gray-800 rounded-xl w-full max-w-lg border border-gray-700">
          <div class="border-b border-gray-700 p-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-white">{{ isEditing ? '编辑任务' : '新建任务' }}</h2>
              <button @click="closeModal" class="p-2 text-gray-400 hover:text-white transition-colors">
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>
          <div class="p-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">任务标题 *</label>
              <input
                v-model="form.title"
                type="text"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入任务标题"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">任务描述</label>
              <textarea
                v-model="form.description"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                placeholder="输入任务描述"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">分类</label>
                <select
                  v-model="form.categoryId"
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option :value="null">未分类</option>
                  <option v-for="cat in tasksStore.categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">优先级</label>
                <select
                  v-model="form.priority"
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">高优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="low">低优先级</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  <Clock class="w-4 h-4 inline mr-1" />
                  截止日期
                </label>
                <input
                  v-model="form.dueDate"
                  type="date"
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  <AlertCircle class="w-4 h-4 inline mr-1" />
                  提醒时间
                </label>
                <input
                  v-model="form.reminderTime"
                  type="time"
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">标签</label>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in form.tags"
                  :key="tag"
                  class="flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg"
                >
                  {{ tag }}
                  <button @click="removeTag(tag)" class="hover:text-blue-300">
                    <X class="w-3 h-3" />
                  </button>
                </span>
                <button
                  @click="addTag"
                  class="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  + 添加标签
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">备注</label>
              <textarea
                v-model="form.notes"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                placeholder="输入备注信息"
              />
            </div>
          </div>
          <div class="border-t border-gray-700 p-4 flex items-center justify-end gap-3">
            <button
              @click="closeModal"
              class="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              @click="handleSubmit"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {{ isEditing ? '保存修改' : '创建任务' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <TaskDetailModal
      v-if="viewingTask"
      :task="viewingTask"
      :show="showDetailModal"
      @close="closeDetailModal"
      @edit="editTask"
    />
  </div>
</template>
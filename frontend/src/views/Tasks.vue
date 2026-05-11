<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useVersionsStore } from '@/stores/versions'
import TaskCard from '@/components/TaskCard.vue'
import TaskDetailModal from '@/components/TaskDetailModal.vue'
import { Plus, Search, Filter, X, Tag, Clock, AlertCircle, GitBranch } from 'lucide-vue-next'
import type { Task } from '@/types'

const tasksStore = useTasksStore()
const versionsStore = useVersionsStore()

const showModal = ref(false)
const showDetailModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const selectedPriority = ref('all')
const selectedVersion = ref<string | null>(null)

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
  totalPomodoros: 1
})

const viewingTask = ref<Task | null>(null)

onMounted(async () => {
  await versionsStore.fetchVersions()
})

const editingTask = ref<Task | null>(null)

const filteredTasks = computed(() => {
  let result = tasksStore.tasks

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(task => 
      task.title.toLowerCase().includes(query) || 
      task.description.toLowerCase().includes(query)
    )
  }

  if (selectedCategory.value) {
    result = result.filter(task => task.categoryId === selectedCategory.value)
  }

  if (selectedPriority.value !== 'all') {
    result = result.filter(task => task.priority === selectedPriority.value)
  }

  return result
})

function openModal(task?: Task) {
  if (task) {
    isEditing.value = true
    editingTask.value = task
    form.value = {
      title: task.title,
      description: task.description,
      categoryId: task.categoryId || null,
      versionId: task.versionId || null,
      priority: task.priority,
      dueDate: task.dueDate || '',
      reminderTime: task.reminderTime || '',
      tags: [...task.tags],
      notes: task.notes,
      totalPomodoros: task.totalPomodoros
    }
  } else {
    isEditing.value = false
    editingTask.value = null
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
      totalPomodoros: 1
    }
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingTask.value = null
}

function openDetailModal(task: Task) {
  viewingTask.value = task
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  viewingTask.value = null
}

async function handleSubmit() {
  if (!form.value.title.trim()) {
    alert('请输入任务标题')
    return
  }

  try {
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
    alert('保存失败，请重试')
  }
}

function addTag() {
  const newTag = prompt('请输入标签名称：')
  if (newTag && !form.value.tags.includes(newTag)) {
    form.value.tags.push(newTag)
  }
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

watch(() => tasksStore.categories, () => {
  if (selectedCategory.value && !tasksStore.categories.find(c => c.id === selectedCategory.value)) {
    selectedCategory.value = null
  }
})

watch(() => tasksStore.tasks, () => {
  if (viewingTask.value) {
    const updatedTask = tasksStore.tasks.find(t => t.id === viewingTask.value!.id)
    if (updatedTask) {
      viewingTask.value = updatedTask
    }
  }
}, { deep: true })
</script>

<template>
  <div class="ml-64 p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white">任务管理</h1>
        <p class="text-gray-400 mt-2">共 {{ tasksStore.tasks.length }} 个任务</p>
      </div>
      <button
        @click="openModal()"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <Plus class="w-5 h-5" />
        新建任务
      </button>
    </div>

    <div class="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
      <div class="flex items-center gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索任务..."
            class="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div class="flex items-center gap-2">
          <Filter class="w-5 h-5 text-gray-400" />
          <select
            v-model="selectedCategory"
            class="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="null">全部分类</option>
            <option v-for="cat in tasksStore.categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
          <select
            v-model="selectedPriority"
            class="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部优先级</option>
            <option value="high">高优先级</option>
            <option value="medium">中优先级</option>
            <option value="low">低优先级</option>
          </select>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @edit="openModal"
        @view="openDetailModal"
      />
      <div v-if="filteredTasks.length === 0" class="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
        <AlertCircle class="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-400 mb-2">暂无任务</h3>
        <p class="text-gray-500">点击右上角按钮创建你的第一个任务</p>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-gray-800 rounded-2xl w-full max-w-lg p-6 border border-gray-700">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-white">{{ isEditing ? '编辑任务' : '新建任务' }}</h2>
            <button @click="closeModal" class="p-2 text-gray-400 hover:text-white transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">任务标题 *</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="输入任务标题"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">任务描述</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="输入任务描述"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                <label class="block text-sm font-medium text-gray-300 mb-1">关联版本</label>
                <select
                  v-model="form.versionId"
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option :value="null">未关联</option>
                  <option v-for="ver in versionsStore.versions" :key="ver.id" :value="ver.id">
                    {{ ver.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">优先级</label>
                <select
                  v-model="form.priority"
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
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
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">提醒时间</label>
                <input
                  v-model="form.reminderTime"
                  type="time"
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                <Tag class="w-4 h-4 inline mr-1" />
                标签
              </label>
              <div class="flex flex-wrap gap-2 mb-2">
                <span
                  v-for="tag in form.tags"
                  :key="tag"
                  class="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded-lg text-gray-300 text-sm"
                >
                  {{ tag }}
                  <button type="button" @click="removeTag(tag)" class="hover:text-red-400">
                    <X class="w-3 h-3" />
                  </button>
                </span>
              </div>
              <button
                type="button"
                @click="addTag"
                class="text-blue-400 hover:text-blue-300 text-sm"
              >
                + 添加标签
              </button>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">备注</label>
              <textarea
                v-model="form.notes"
                rows="2"
                placeholder="添加备注信息"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div class="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                {{ isEditing ? '保存修改' : '创建任务' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <TaskDetailModal
      v-if="viewingTask"
      :task="viewingTask"
      :show="showDetailModal"
      @close="closeDetailModal"
      @edit="(task) => { closeDetailModal(); openModal(task); }"
    />
  </div>
</template>
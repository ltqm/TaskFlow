<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVersionsStore } from '@/stores/versions'
import { useTasksStore } from '@/stores/tasks'
import TaskCard from '@/components/TaskCard.vue'
import { Plus, Search, X, Calendar, FileText, Trash2, Edit3, ChevronRight } from 'lucide-vue-next'
import type { Version, Task } from '@/types'

const versionsStore = useVersionsStore()
const tasksStore = useTasksStore()

const showModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')

const form = ref({
  name: '',
  description: '',
  releaseDate: ''
})

const editingVersion = ref<Version | null>(null)

onMounted(async () => {
  await versionsStore.fetchVersions()
})

function openModal(version?: Version) {
  if (version) {
    isEditing.value = true
    editingVersion.value = version
    form.value = {
      name: version.name,
      description: version.description,
      releaseDate: version.releaseDate
    }
  } else {
    isEditing.value = false
    editingVersion.value = null
    form.value = {
      name: '',
      description: '',
      releaseDate: new Date().toISOString().split('T')[0]
    }
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingVersion.value = null
}

async function handleSubmit() {
  if (!form.value.name.trim() || !form.value.releaseDate) {
    alert('请填写版本名称和发布日期')
    return
  }

  try {
    if (isEditing.value && editingVersion.value) {
      await versionsStore.updateVersionById(
        editingVersion.value.id,
        form.value.name,
        form.value.description,
        form.value.releaseDate
      )
      if (versionsStore.selectedVersion?.id === editingVersion.value.id) {
        versionsStore.selectedVersion = { ...versionsStore.selectedVersion, ...form.value }
      }
    } else {
      await versionsStore.addVersion(
        form.value.name,
        form.value.description,
        form.value.releaseDate
      )
    }
    closeModal()
  } catch (error) {
    console.error('Failed to save version:', error)
    alert('保存失败，请重试')
  }
}

async function deleteVersion(version: Version) {
  if (confirm('确定要删除这个版本吗？相关任务将不再关联该版本。')) {
    await versionsStore.deleteVersionById(version.id)
  }
}

async function toggleComplete(task: Task) {
  await tasksStore.updateTaskById(task.id, { isCompleted: !task.isCompleted })
  if (versionsStore.selectedVersion) {
    const index = versionsStore.versionTasks.findIndex(t => t.id === task.id)
    if (index !== -1) {
      versionsStore.versionTasks[index] = { ...versionsStore.versionTasks[index], isCompleted: !versionsStore.versionTasks[index].isCompleted }
    }
  }
}
</script>

<template>
  <div class="ml-64 p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white">版本管理</h1>
        <p class="text-gray-400 mt-2">共 {{ versionsStore.versions.length }} 个版本</p>
      </div>
      <button
        @click="openModal()"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <Plus class="w-5 h-5" />
        新建版本
      </button>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div class="col-span-1">
        <div class="bg-gray-800 rounded-xl border border-gray-700">
          <div class="p-4 border-b border-gray-700">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索版本..."
                class="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div class="max-h-[calc(100vh-250px)] overflow-y-auto">
            <div
              v-for="version in versionsStore.versions"
              :key="version.id"
              @click="versionsStore.selectVersion(version)"
              class="p-4 border-b border-gray-700/50 cursor-pointer transition-colors"
              :class="versionsStore.selectedVersion?.id === version.id ? 'bg-blue-600/20 border-l-4 border-blue-500' : 'hover:bg-gray-700/50'"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="font-medium text-white truncate">{{ version.name }}</h3>
                  <div class="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Calendar class="w-3 h-3" />
                    {{ new Date(version.releaseDate).toLocaleDateString('zh-CN') }}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click.stop="openModal(version)"
                    class="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-600 rounded transition-colors"
                  >
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button
                    @click.stop="deleteVersion(version)"
                    class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded transition-colors"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                  <ChevronRight class="w-5 h-5 text-gray-500" />
                </div>
              </div>
              <p v-if="version.description" class="text-sm text-gray-400 mt-2 line-clamp-2">
                {{ version.description }}
              </p>
            </div>

            <div v-if="versionsStore.versions.length === 0" class="p-8 text-center">
              <FileText class="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p class="text-gray-400">暂无版本</p>
              <button
                @click="openModal()"
                class="mt-4 text-blue-400 hover:text-blue-300 text-sm"
              >
                创建第一个版本
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-2">
        <div v-if="versionsStore.selectedVersion" class="bg-gray-800 rounded-xl border border-gray-700 h-full">
          <div class="p-6 border-b border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-white">{{ versionsStore.selectedVersion.name }}</h2>
                <div class="flex items-center gap-4 text-sm text-gray-400 mt-2">
                  <span class="flex items-center gap-1">
                    <Calendar class="w-4 h-4" />
                    {{ new Date(versionsStore.selectedVersion.releaseDate).toLocaleDateString('zh-CN') }}
                  </span>
                </div>
              </div>
              <button
                @click="versionsStore.clearSelection()"
                class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
            <p v-if="versionsStore.selectedVersion.description" class="text-gray-300 mt-4">
              {{ versionsStore.selectedVersion.description }}
            </p>
          </div>

          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white">关联任务</h3>
              <div class="flex items-center gap-4 text-sm">
                <span class="text-gray-400">待完成: <span class="text-white font-medium">{{ versionsStore.pendingVersionTasks.length }}</span></span>
                <span class="text-gray-400">已完成: <span class="text-green-400 font-medium">{{ versionsStore.completedVersionTasks.length }}</span></span>
              </div>
            </div>

            <div class="space-y-3 max-h-[calc(100vh-380px)] overflow-y-auto">
              <div
                v-for="task in versionsStore.versionTasks"
                :key="task.id"
                class="bg-gray-700/50 rounded-xl p-4 border border-gray-600"
                :class="{ 'opacity-60': task.isCompleted }"
              >
                <div class="flex items-start gap-3">
                  <button
                    @click="toggleComplete(task)"
                    class="mt-1 transition-colors"
                    :class="task.isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-white'"
                  >
                    <svg v-if="task.isCompleted" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </button>

                  <div class="flex-1">
                    <h4 :class="task.isCompleted ? 'text-gray-400 line-through' : 'text-white font-medium'">
                      {{ task.title }}
                    </h4>
                    <p v-if="task.description" class="text-gray-400 text-sm mt-1">{{ task.description }}</p>
                    <div class="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span v-if="task.priority" :class="{
                        'text-red-400': task.priority === 'high',
                        'text-yellow-400': task.priority === 'medium',
                        'text-green-400': task.priority === 'low'
                      }">
                        {{ task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低' }}优先级
                      </span>
                      <span v-if="task.dueDate">
                        截止: {{ new Date(task.dueDate).toLocaleDateString('zh-CN') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="versionsStore.versionTasks.length === 0" class="text-center py-12">
                <FileText class="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p class="text-gray-400">该版本暂无关联任务</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="bg-gray-800 rounded-xl border border-gray-700 h-full flex items-center justify-center">
          <div class="text-center">
            <FileText class="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-gray-400 mb-2">选择一个版本</h3>
            <p class="text-gray-500">从左侧列表中选择一个版本查看详情和关联任务</p>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-gray-800 rounded-2xl w-full max-w-lg p-6 border border-gray-700">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-white">{{ isEditing ? '编辑版本' : '新建版本' }}</h2>
            <button @click="closeModal" class="p-2 text-gray-400 hover:text-white transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">版本名称 *</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="例如: v1.0.0"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">发布日期 *</label>
              <input
                v-model="form.releaseDate"
                type="date"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">版本描述</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="添加版本描述..."
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
                {{ isEditing ? '保存修改' : '创建版本' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
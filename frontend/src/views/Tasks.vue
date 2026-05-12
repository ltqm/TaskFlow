<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { useTasksStore } from '@/stores/tasks'
import TaskCard from '@/components/TaskCard.vue'
import TaskDetailModal from '@/components/TaskDetailModal.vue'
import { Plus, Search, Filter, X, Tag, Clock, AlertCircle, Calendar as CalendarIcon } from 'lucide-vue-next'
import type { Task } from '@/types'
import { toast } from 'vue-sonner'
import Button from '@/components/ui/button/Button.vue'
import Calendar from '@/components/ui/calendar/Calendar.vue'
import Input from '@/components/ui/input/Input.vue'
import Popover from '@/components/ui/popover/Popover.vue'
import PopoverContent from '@/components/ui/popover/PopoverContent.vue'
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import Label from '@/components/ui/label/Label.vue'

const tasksStore = useTasksStore()

const showModal = ref(false)
const showDetailModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const dueDateOpen = ref(false)
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

const dueDateValue = computed<DateValue | undefined>(() => {
  if (!form.value.dueDate) return undefined
  try {
    return parseDate(form.value.dueDate.slice(0, 10))
  } catch {
    return undefined
  }
})

const dueDateLabel = computed(() => {
  if (!dueDateValue.value) return '请选择截止日期'
  return dueDateValue.value.toDate(getLocalTimeZone()).toLocaleDateString('zh-CN')
})

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
  dueDateOpen.value = false
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
  if (showDetailModal.value) {
    closeDetailModal()
  }

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
      toast.error('请输入任务标题')
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
    toast.success(isEditing.value ? '任务修改成功' : '任务创建成功')
  } catch (error) {
    console.error('Failed to save task:', error)
    toast.error('保存任务失败')
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

function handleDueDateSelect(value: DateValue | undefined) {
  form.value.dueDate = value ? value.toString() : ''
  dueDateOpen.value = false
}

onMounted(async () => {
  if (!tasksStore.categories.length) {
    await tasksStore.fetchCategories()
  }
})
</script>

<template>
  <div class="ml-64 min-h-screen bg-background p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">任务管理</h1>
        <p class="mt-1 text-muted-foreground">管理你的日常任务和待办事项</p>
      </div>
      <Button
        @click="openModal"
        class="h-10 rounded-lg"
      >
        <Plus class="w-5 h-5" />
        新建任务
      </Button>
    </div>

    <div class="mb-6 rounded-xl border border-border/80 bg-card p-4">
      <div class="flex items-center gap-4">
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            type="text"
            placeholder="搜索任务..."
            class="h-10 rounded-lg bg-secondary pl-10"
          />
        </div>
        <div class="flex items-center gap-2">
          <Filter class="w-5 h-5 text-muted-foreground" />
          <select
            v-model="selectedCategory"
            class="h-10 rounded-lg border border-input bg-secondary px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option v-for="cat in categoryOptions" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
          <select
            v-model="selectedPriority"
            class="h-10 rounded-lg border border-input bg-secondary px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option v-for="p in priorityOptions" :key="p.value" :value="p.value">
              {{ p.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="filteredTasks.length === 0" class="rounded-xl border border-border/80 bg-card p-12 text-center">
      <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
        <Tag class="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 class="mb-2 text-xl font-semibold text-foreground">暂无任务</h3>
      <p class="text-muted-foreground">点击右上角按钮创建你的第一个任务</p>
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
      <div v-if="showModal" class="z-overlay-modal fixed inset-0 flex items-center justify-center bg-black/82 px-4 py-6 backdrop-blur-sm">
        <div class="w-full max-w-2xl overflow-hidden rounded-xl border border-border/95 bg-card shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)]">
          <div class="border-b border-border/80 bg-card/95 px-6 py-4 backdrop-blur">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-foreground">{{ isEditing ? '编辑任务' : '新建任务' }}</h2>
              <button @click="closeModal" class="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>
          <div class="space-y-4 px-6 py-5">
            <div>
              <Label class="mb-1.5 block">任务标题 *</Label>
              <Input
                v-model="form.title"
                type="text"
                placeholder="输入任务标题"
                class="h-10 bg-secondary"
              />
            </div>
            <div>
              <Label class="mb-1.5 block">任务描述</Label>
              <Textarea
                v-model="form.description"
                rows="3"
                placeholder="输入任务描述"
                class="bg-secondary resize-none"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="mb-1.5 block">分类</Label>
                <select
                  v-model="form.categoryId"
                  class="h-10 w-full rounded-md border border-input bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option :value="null">未分类</option>
                  <option v-for="cat in tasksStore.categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div>
                <Label class="mb-1.5 block">优先级</Label>
                <select
                  v-model="form.priority"
                  class="h-10 w-full rounded-md border border-input bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="high">高优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="low">低优先级</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="mb-1.5 block">
                  <Clock class="w-4 h-4 inline mr-1" />
                  截止日期
                </Label>
                <Popover v-model:open="dueDateOpen">
                  <PopoverTrigger as-child>
                    <Button
                      type="button"
                      variant="outline"
                      class="h-10 w-full justify-between bg-secondary font-normal text-foreground"
                    >
                      <span :class="dueDateValue ? 'text-foreground' : 'text-muted-foreground'">
                        {{ dueDateLabel }}
                      </span>
                      <CalendarIcon class="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      :model-value="dueDateValue"
                      layout="month-and-year"
                      @update:model-value="handleDueDateSelect"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label class="mb-1.5 block">
                  <AlertCircle class="w-4 h-4 inline mr-1" />
                  提醒时间
                </Label>
                <Input
                  v-model="form.reminderTime"
                  type="time"
                  class="h-10 bg-secondary"
                />
              </div>
            </div>
            <div>
              <Label class="mb-2 block">标签</Label>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in form.tags"
                  :key="tag"
                  class="flex items-center gap-1 rounded-md border border-blue-400/30 bg-blue-500/15 px-2.5 py-1 text-xs text-blue-200"
                >
                  {{ tag }}
                  <button @click="removeTag(tag)" class="rounded p-0.5 text-blue-300 hover:bg-blue-400/20 hover:text-blue-100">
                    <X class="w-3 h-3" />
                  </button>
                </span>
                <Button
                  @click="addTag"
                  variant="outline"
                  class="rounded-md border border-dashed border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-ring hover:bg-secondary hover:text-foreground"
                >
                  + 添加标签
                </Button>
              </div>
            </div>
            <div>
              <Label class="mb-1.5 block">备注</Label>
              <Textarea
                v-model="form.notes"
                rows="3"
                placeholder="输入备注信息"
                class="bg-secondary resize-none"
              />
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-border/80 bg-card/95 px-6 py-4 backdrop-blur">
            <Button
              @click="closeModal"
              variant="outline"
            >
              取消
            </Button>
            <Button
              @click="handleSubmit"
            >
              {{ isEditing ? '保存修改' : '创建任务' }}
            </Button>
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
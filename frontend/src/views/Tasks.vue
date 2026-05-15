<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { watchDebounced, onKeyStroke } from '@vueuse/core'
import { useTasksStore } from '@/stores/tasks'
import { useVersionsStore } from '@/stores/versions'
import TaskCard from '@/components/TaskCard.vue'
import TaskDetailModal from '@/components/TaskDetailModal.vue'
import TaskImportModal from '@/components/task-import/TaskImportModal.vue'
import {
  Plus,
  Search,
  Filter,
  X,
  Tag,
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  Loader2,
  AlertTriangle
} from 'lucide-vue-next'
import type { Task } from '@/types'
import type { TaskImportCommitResult } from '@/services/api'
import { getTasksPaged } from '@/services/api'
import { toast } from 'vue-sonner'
import { formatApiError } from '@/utils/http-error'
import { reminderIsoToDatetimeLocal, datetimeLocalToIsoOrNull } from '@/utils/task-reminder-form'
import Button from '@/components/ui/button/Button.vue'
import Calendar from '@/components/ui/calendar/Calendar.vue'
import Input from '@/components/ui/input/Input.vue'
import Popover from '@/components/ui/popover/Popover.vue'
import PopoverContent from '@/components/ui/popover/PopoverContent.vue'
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import Label from '@/components/ui/label/Label.vue'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPageSize,
  PaginationPrevious
} from '@/components/ui/pagination'

const tasksStore = useTasksStore()
const versionsStore = useVersionsStore()
const router = useRouter()

const showModal = ref(false)
const showDetailModal = ref(false)
const showImportModal = ref(false)
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

const pagedTasks = ref<Task[]>([])
const listTotal = ref(0)
const listPage = ref(1)
const listPageSize = ref(12)
const listTotalPages = ref(1)
const listLoading = ref(false)
const submitting = ref(false)
const tagDraft = ref('')

const hasActiveFilters = computed(
  () =>
    Boolean(searchQuery.value.trim()) ||
    Boolean(selectedCategory.value) ||
    selectedPriority.value !== 'all'
)

const hasNoVersions = computed(() => versionsStore.versions.length === 0)

onKeyStroke('Escape', e => {
  if (!showModal.value) return
  e.preventDefault()
  closeModal()
})

async function loadPaged() {
  listLoading.value = true
  try {
    const res = await getTasksPaged({
      page: listPage.value,
      pageSize: listPageSize.value,
      search: searchQuery.value.trim() || undefined,
      categoryId: selectedCategory.value || undefined,
      priority: selectedPriority.value
    })
    pagedTasks.value = res.items
    listTotal.value = res.total
    listTotalPages.value = res.totalPages
    if (listPage.value > res.totalPages && res.totalPages >= 1) {
      listPage.value = res.totalPages
      const res2 = await getTasksPaged({
        page: listPage.value,
        pageSize: listPageSize.value,
        search: searchQuery.value.trim() || undefined,
        categoryId: selectedCategory.value || undefined,
        priority: selectedPriority.value
      })
      pagedTasks.value = res2.items
      listTotal.value = res2.total
      listTotalPages.value = res2.totalPages
    }
  } catch (error) {
    console.error('Failed to load tasks page:', error)
    toast.error(formatApiError(error))
  } finally {
    listLoading.value = false
  }
}

watch(listPage, () => {
  void loadPaged()
})

watch(listPageSize, (_n, o) => {
  if (o === undefined) return
  if (listPage.value !== 1) listPage.value = 1
  else void loadPaged()
})

watchDebounced(
  [searchQuery, selectedCategory, selectedPriority],
  () => {
    if (listPage.value !== 1) {
      listPage.value = 1
    } else {
      void loadPaged()
    }
  },
  { debounce: 350 }
)

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

const versionOptions = computed(() => versionsStore.versions)

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
  tagDraft.value = ''
  submitting.value = false
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedPriority.value = 'all'
  if (listPage.value !== 1) {
    listPage.value = 1
  } else {
    void loadPaged()
  }
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
  void loadPaged()
}

function onViewingTaskUpdated(task: Task) {
  viewingTask.value = task
  void loadPaged()
}

function openImportModal() {
  showImportModal.value = true
}

function closeImportModal() {
  showImportModal.value = false
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
    reminderTime: reminderIsoToDatetimeLocal(task.reminderTime),
    tags: [...task.tags],
    notes: task.notes,
    totalPomodoros: task.totalPomodoros
  }
  isEditing.value = true
  showModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return

  if (!form.value.title.trim()) {
    toast.error('请输入任务标题')
    return
  }

  if (!isEditing.value && !form.value.versionId) {
    toast.error('新增任务必须选择关联版本')
    return
  }

  const pomRaw = Number(form.value.totalPomodoros)
  const totalPomodoros = Math.min(99, Math.max(1, Number.isFinite(pomRaw) ? Math.floor(pomRaw) : 1))
  const reminderTime = datetimeLocalToIsoOrNull(form.value.reminderTime)

  submitting.value = true
  try {
    if (isEditing.value && editingTask.value) {
      await tasksStore.updateTaskById(editingTask.value.id, {
        title: form.value.title,
        description: form.value.description,
        categoryId: form.value.categoryId,
        versionId: form.value.versionId,
        priority: form.value.priority,
        dueDate: form.value.dueDate || null,
        reminderTime,
        tags: form.value.tags,
        notes: form.value.notes,
        totalPomodoros
      })
    } else {
      await tasksStore.addTask({
        title: form.value.title,
        description: form.value.description,
        categoryId: form.value.categoryId,
        versionId: form.value.versionId!,
        priority: form.value.priority,
        dueDate: form.value.dueDate || null,
        reminderTime,
        tags: form.value.tags,
        notes: form.value.notes,
        totalPomodoros
      })
    }
    closeModal()
    toast.success(isEditing.value ? '任务修改成功' : '任务创建成功')
    void tasksStore.fetchTasks().catch(err => toast.error(formatApiError(err)))
    await loadPaged()
  } catch (error) {
    console.error('Failed to save task:', error)
    toast.error(formatApiError(error))
  } finally {
    submitting.value = false
  }
}

function commitTag() {
  const t = tagDraft.value.trim()
  if (!t) {
    toast.error('请输入标签内容')
    return
  }
  if (form.value.tags.includes(t)) {
    toast.info('该标签已存在')
    return
  }
  if (form.value.tags.length >= 20) {
    toast.error('标签数量请勿超过 20 个')
    return
  }
  form.value.tags.push(t)
  tagDraft.value = ''
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

function handleDueDateSelect(value: DateValue | undefined) {
  form.value.dueDate = value ? value.toString() : ''
  dueDateOpen.value = false
}

async function handleImportSuccess(result: TaskImportCommitResult) {
  try {
    await tasksStore.fetchTasks()
  } catch (error) {
    toast.error(formatApiError(error))
  }
  listPage.value = 1
  await loadPaged()
  toast.success(`已导入 ${result.createdTaskCount} 条任务，子任务 ${result.createdSubtaskCount} 条`)
}

function goPrevPage() {
  if (listPage.value > 1) listPage.value -= 1
}

function goNextPage() {
  if (listPage.value < listTotalPages.value) listPage.value += 1
}

onMounted(async () => {
  try {
    await tasksStore.fetchCategories()
  } catch (error) {
    toast.error(formatApiError(error))
  }
  if (!versionsStore.versions.length) {
    try {
      await versionsStore.fetchVersions()
    } catch (error) {
      toast.error(formatApiError(error))
    }
  }
  await loadPaged()
})
</script>

<template>
  <div class="ml-64 min-h-screen bg-background p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">任务管理</h1>
        <p class="mt-1 text-muted-foreground">管理你的日常任务和待办事项</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" class="h-10 rounded-lg" @click="openImportModal">
          批量导入
        </Button>
        <Button @click="openModal" class="h-10 rounded-lg">
          <Plus class="w-5 h-5" />
          新建任务
        </Button>
      </div>
    </div>

    <div v-if="hasNoVersions"
      class="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
      <AlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
      <div class="min-w-0 flex-1">
        <p class="font-medium text-foreground">尚未创建版本</p>
        <p class="mt-1 text-muted-foreground">新建任务必须关联版本。请先到「版本管理」中创建至少一个版本。</p>
        <Button type="button" variant="outline" size="sm" class="mt-3 border-amber-500/40 text-foreground hover:bg-amber-500/15"
          @click="router.push('/versions')">
          前往版本管理
        </Button>
      </div>
    </div>

    <div class="mb-6 rounded-xl border border-border/80 bg-card p-4">
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div class="relative min-w-0 flex-1">
            <Search class="absolute left-3 top-1/2 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input v-model="searchQuery" type="search" placeholder="搜索标题或描述…" autocomplete="off"
              class="h-10 rounded-lg bg-secondary pl-10" />
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <Filter class="hidden h-5 w-5 shrink-0 text-muted-foreground sm:block" />
            <select v-model="selectedCategory"
              class="h-10 min-w-[8.5rem] flex-1 rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:flex-none sm:px-4">
              <option v-for="cat in categoryOptions" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <select v-model="selectedPriority"
              class="h-10 min-w-[8.5rem] flex-1 rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:flex-none sm:px-4">
              <option v-for="p in priorityOptions" :key="p.value" :value="p.value">
                {{ p.label }}
              </option>
            </select>
            <Button v-if="hasActiveFilters" type="button" variant="ghost" size="sm"
              class="h-10 shrink-0 text-muted-foreground hover:text-foreground" @click="clearFilters">
              清空筛选
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="listLoading"
      class="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-border/80 bg-card">
      <Loader2 class="h-10 w-10 animate-spin text-muted-foreground" />
      <p class="mt-3 text-sm text-muted-foreground">加载中...</p>
    </div>

    <div v-else-if="listTotal === 0" class="rounded-xl border border-border/80 bg-card p-12 text-center">
      <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
        <Tag class="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 class="mb-2 text-xl font-semibold text-foreground">
        {{ hasActiveFilters ? '没有符合条件的任务' : '暂无任务' }}
      </h3>
      <p class="text-muted-foreground">
        {{ hasActiveFilters ? '可尝试调整关键词、分类或优先级，或清空筛选查看全部任务。' : '点击右上角「新建任务」开始记录，或使用批量导入。' }}
      </p>
      <div v-if="hasActiveFilters" class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" variant="outline" @click="clearFilters">清空筛选</Button>
      </div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TaskCard v-for="task in pagedTasks" :key="task.id" :task="task" @edit="editTask" @view="openDetailModal" />
      </div>

      <Pagination class="mt-8 border-t border-border/80 pt-6">
        <PaginationContent class="w-full flex-wrap items-center justify-between gap-3">
          <PaginationItem
            class="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <span>共 {{ listTotal }} 条</span>
            <span class="hidden sm:inline" aria-hidden="true">·</span>
            <span class="tabular-nums">第 {{ listPage }} / {{ listTotalPages }} 页</span>
            <PaginationPageSize v-model="listPageSize" class="sm:ml-0" />
          </PaginationItem>
          <PaginationItem class="flex shrink-0 items-center gap-1">
            <PaginationPrevious :disabled="listPage <= 1 || listLoading" @click="goPrevPage" />
            <PaginationNext :disabled="listPage >= listTotalPages || listLoading" @click="goNextPage" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </template>

    <Teleport to="body">
      <div v-if="showModal"
        class="z-overlay-modal fixed inset-0 flex items-center justify-center bg-black/82 px-4 py-6 backdrop-blur-sm"
        @click.self="closeModal">
        <div
          class="max-h-[min(92vh,900px)] w-full max-w-2xl overflow-y-auto overflow-x-hidden rounded-xl border border-border/95 bg-card shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-modal-title">
          <div class="sticky top-0 z-10 border-b border-border/80 bg-card/95 px-6 py-4 backdrop-blur">
            <div class="flex items-center justify-between gap-3">
              <h2 id="task-modal-title" class="text-lg font-semibold text-foreground">
                {{ isEditing ? '编辑任务' : '新建任务' }}
              </h2>
              <button type="button" @click="closeModal"
                class="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>
          <div class="space-y-4 px-6 py-5">
            <div v-if="!isEditing && hasNoVersions"
              class="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground/95">
              <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
              <span>请先创建版本并刷新本页，或前往「版本管理」添加后再新建任务。</span>
            </div>
            <div>
              <Label class="mb-1.5 block">任务标题 *</Label>
              <Input v-model="form.title" type="text" placeholder="输入任务标题" class="h-10 bg-secondary" />
            </div>
            <div>
              <Label class="mb-1.5 block">任务描述</Label>
              <Textarea v-model="form.description" rows="3" placeholder="输入任务描述" class="bg-secondary resize-none" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="mb-1.5 block">分类</Label>
                <select v-model="form.categoryId"
                  class="h-10 w-full rounded-md border border-input bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option :value="null">未分类</option>
                  <option v-for="cat in tasksStore.categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div>
                <Label class="mb-1.5 block">关联版本 <span class="text-red-400">*</span></Label>
                <select v-model="form.versionId"
                  class="h-10 w-full rounded-md border border-input bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option :value="null">请选择版本</option>
                  <option v-for="version in versionOptions" :key="version.id" :value="version.id">
                    {{ version.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="mb-1.5 block">优先级</Label>
                <select v-model="form.priority"
                  class="h-10 w-full rounded-md border border-input bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="high">高优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="low">低优先级</option>
                </select>
              </div>
              <div>
                <Label class="mb-1.5 block">预估番茄钟</Label>
                <Input v-model.number="form.totalPomodoros" type="number" min="1" max="99" step="1"
                  class="h-10 bg-secondary tabular-nums" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="mb-1.5 block">
                  <Clock class="mr-1 inline h-4 w-4" />
                  截止日期
                </Label>
                <Popover v-model:open="dueDateOpen">
                  <PopoverTrigger as-child>
                    <Button type="button" variant="outline"
                      class="h-10 w-full justify-between bg-secondary font-normal text-foreground">
                      <span :class="dueDateValue ? 'text-foreground' : 'text-muted-foreground'">
                        {{ dueDateLabel }}
                      </span>
                      <CalendarIcon class="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto overflow-hidden p-0" align="start">
                    <Calendar :model-value="dueDateValue" layout="month-and-year"
                      @update:model-value="handleDueDateSelect" />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label class="mb-1.5 block">
                  <AlertCircle class="mr-1 inline h-4 w-4" />
                  提醒时间
                </Label>
                <Input v-model="form.reminderTime" type="datetime-local" class="h-10 bg-secondary" />
                <p class="mt-1 text-xs text-muted-foreground">留空表示不设提醒；与浏览器通知配合时需保持应用打开。</p>
              </div>
            </div>
            <div>
              <Label class="mb-2 block">标签</Label>
              <div class="mb-2 flex flex-wrap gap-2">
                <span v-for="tag in form.tags" :key="tag"
                  class="flex items-center gap-1 rounded-md border border-blue-400/30 bg-blue-500/15 px-2.5 py-1 text-xs text-blue-200">
                  {{ tag }}
                  <button type="button" @click="removeTag(tag)"
                    class="rounded p-0.5 text-blue-300 hover:bg-blue-400/20 hover:text-blue-100">
                    <X class="h-3 w-3" />
                  </button>
                </span>
              </div>
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input v-model="tagDraft" type="text" placeholder="输入标签后添加" maxlength="32"
                  class="h-10 flex-1 bg-secondary" @keydown.enter.prevent="commitTag" />
                <Button type="button" variant="outline" class="h-10 shrink-0 sm:w-auto" @click="commitTag">
                  添加标签
                </Button>
              </div>
            </div>
            <div>
              <Label class="mb-1.5 block">备注</Label>
              <Textarea v-model="form.notes" rows="3" placeholder="输入备注信息" class="bg-secondary resize-none" />
            </div>
          </div>
          <div class="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border/80 bg-card/95 px-6 py-4 backdrop-blur">
            <Button type="button" variant="outline" :disabled="submitting" @click="closeModal">
              取消
            </Button>
            <Button type="button" :disabled="submitting || (!isEditing && hasNoVersions)" @click="handleSubmit">
              <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
              {{ submitting ? '提交中…' : isEditing ? '保存修改' : '创建任务' }}
            </Button>
          </div>
        </div>
      </div>
    </Teleport>

    <TaskDetailModal v-if="viewingTask" :task="viewingTask" :show="showDetailModal" @close="closeDetailModal"
      @edit="editTask" @task-updated="onViewingTaskUpdated" />

    <TaskImportModal :show="showImportModal" @close="closeImportModal" @imported="handleImportSuccess" />
  </div>
</template>
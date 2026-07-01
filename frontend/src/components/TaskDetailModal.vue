<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { Task, SubTask } from '@/types'
import { resolveTaskWorkflowStatus } from '@/utils/task-workflow'
import { resolveTaskCategoryLabel } from '@/utils/task-display'
import { useTasksStore } from '@/stores/tasks'
import { useVersionsStore } from '@/stores/versions'
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
import { useConfirm } from '@/composables/useConfirm'
import { toast } from 'vue-sonner'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Badge from '@/components/ui/badge/Badge.vue'

const props = withDefaults(defineProps<{
  task: Task
  show: boolean
  allowManage?: boolean
}>(), {
  allowManage: true
})

const emit = defineEmits<{
  close: []
  edit: [task: Task]
  taskUpdated: [task: Task]
}>()

const tasksStore = useTasksStore()
const versionsStore = useVersionsStore()
const { confirm } = useConfirm()

const subTasks = ref<SubTask[]>([])
const newSubTaskTitle = ref('')
const isAddingSubTask = ref(false)
const isSubmittingSubTask = ref(false)
const canSubmitSubTask = computed(() => newSubTaskTitle.value.trim().length > 0 && !isSubmittingSubTask.value)
const subTaskInputId = 'new-subtask-title-input'

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

const workflowState = computed(() => resolveTaskWorkflowStatus(props.task))
const workflowBadgeClass = computed(() => {
  switch (workflowState.value) {
    case 'completed':
      return 'bg-green-500/20 text-green-300 ring-1 ring-green-400/30'
    case 'in_progress':
      return 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/35'
    default:
      return 'bg-secondary text-foreground/85 ring-1 ring-border'
  }
})
const categoryLabel = computed(() =>
  resolveTaskCategoryLabel(props.task, tasksStore.categories)
)

function formatReminderTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const workflowLabel = computed(() => {
  switch (workflowState.value) {
    case 'completed':
      return '已完成'
    case 'in_progress':
      return '处理中'
    default:
      return '待处理'
  }
})

watch(
  [() => props.show, () => props.task?.id],
  async ([isVisible, taskId]) => {
    if (isVisible && taskId) {
      await nextTick()
      await loadSubTasks()
    }
  },
  { immediate: true }
)

watch(isAddingSubTask, async (isAdding) => {
  if (!isAdding) return
  await nextTick()
  const input = document.getElementById(subTaskInputId) as HTMLInputElement | null
  input?.focus()
})

async function loadSubTasks() {
  try {
    const result = await tasksStore.fetchSubTasks(props.task.id)
    subTasks.value = Array.isArray(result) ? result : []
  } catch (error) {
    console.error('Failed to load sub tasks:', error)
    subTasks.value = []
    toast.error('子任务加载失败')
  }
}

async function syncParentTaskFromServer() {
  const fresh = await tasksStore.refreshTaskById(props.task.id)
  if (!fresh) return
  versionsStore.mergeTaskIntoVersionList(fresh)
  emit('taskUpdated', fresh)
}

async function deleteTask(task: Task) {
  const ok = await confirm({
    title: '删除任务',
    description: '确定要删除这个任务吗？此操作不可撤销。',
    confirmText: '删除'
  })
  if (ok) {
    await tasksStore.deleteTaskById(task.id)
    toast.success('任务已删除')
    emit('close')
  }
}

async function toggleSubTaskComplete(subTask: SubTask) {
  await tasksStore.updateSubTask(subTask.id, { isCompleted: !subTask.isCompleted })
  await loadSubTasks()
  await syncParentTaskFromServer()
}

async function addSubTask() {
  const title = newSubTaskTitle.value.trim()
  if (!title) {
    toast.error('请输入子任务标题')
    return
  }

  if (isSubmittingSubTask.value) return
  isSubmittingSubTask.value = true

  try {
    const created = await tasksStore.addSubTask(props.task.id, title)
    newSubTaskTitle.value = ''
    isAddingSubTask.value = false

    try {
      await loadSubTasks()
    } catch {
      if (!subTasks.value.some(item => item.id === created.id)) {
        subTasks.value = [...subTasks.value, created]
      }
    }

    await syncParentTaskFromServer()

    toast.success('子任务添加成功')
  } catch (error) {
    const message = (error as { message?: string; response?: { data?: { msg?: string } } })?.message
      || (error as { response?: { data?: { msg?: string } } })?.response?.data?.msg
    toast.error(message || '添加子任务失败，请重试')
  } finally {
    isSubmittingSubTask.value = false
  }
}

async function deleteSubTask(subTask: SubTask) {
  const ok = await confirm({
    title: '删除子任务',
    description: '确定要删除这个子任务吗？',
    confirmText: '删除'
  })
  if (ok) {
    await tasksStore.deleteSubTask(subTask.id)
    toast.success('子任务已删除')
    await loadSubTasks()
    await syncParentTaskFromServer()
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show"
      class="z-overlay-modal fixed inset-0 flex items-center justify-center bg-black/82 px-4 py-6 backdrop-blur-sm">
      <div
        class="scrollbar-stable max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border/95 bg-card shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)]">
        <div class="sticky top-0 border-b border-border/80 bg-card/95 px-6 py-4 backdrop-blur">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-foreground">任务详情</h2>
            <Button @click="emit('close')" variant="ghost" size="icon"
              class="text-muted-foreground hover:text-foreground">
              <X class="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div class="space-y-6 p-6">
          <div>
            <div class="mb-2 flex flex-wrap items-center gap-3">
              <h3
                class="text-2xl font-bold"
                :class="task.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'"
              >
                {{ task.title }}
              </h3>
              <Badge
                v-if="task.priority"
                class="rounded-full border-transparent px-3 py-1 text-xs text-white"
                :class="priorityColors[task.priority]"
              >
                {{ priorityLabels[task.priority] }}
              </Badge>
            </div>
            <span
              class="inline-flex rounded-full px-3 py-1 text-xs font-medium"
              :class="workflowBadgeClass"
            >
              {{ workflowLabel }}
            </span>
          </div>

          <div v-if="task.description" class="rounded-lg border border-border/80 bg-secondary/55 p-4">
            <p class="text-foreground/85">{{ task.description }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div v-if="categoryLabel !== '未分类'" class="flex items-center gap-2 text-muted-foreground">
              <Tag class="w-5 h-5 text-blue-400" />
              <span>{{ categoryLabel }}</span>
            </div>
            <div v-if="task.versionName" class="flex items-center gap-2 text-muted-foreground">
              <GitBranch class="w-5 h-5 text-purple-400" />
              <span>{{ task.versionName }}</span>
            </div>
            <div v-if="task.dueDate" class="flex items-center gap-2 text-muted-foreground">
              <Clock class="w-5 h-5 text-orange-400" />
              <span>{{ new Date(task.dueDate).toLocaleDateString('zh-CN') }}</span>
            </div>
            <div v-if="task.reminderTime" class="flex items-center gap-2 text-muted-foreground">
              <AlertCircle class="w-5 h-5 text-yellow-400" />
              <span>{{ formatReminderTime(task.reminderTime) }}</span>
            </div>
          </div>

          <div v-if="task.tags?.length" class="flex flex-wrap gap-2">
            <span v-for="tag in task.tags" :key="tag"
              class="flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs text-foreground/85">
              <Tag class="w-3 h-3" />
              {{ tag }}
            </span>
          </div>

          <div v-if="task.notes" class="rounded-lg border border-border/80 bg-secondary/55 p-4">
            <div class="mb-2 flex items-center gap-2 text-muted-foreground">
              <FileText class="w-5 h-5" />
              <span class="font-medium">备注</span>
            </div>
            <p class="text-foreground/85">{{ task.notes }}</p>
          </div>

          <div class="border-t border-border/80 pt-6">
            <div class="mb-4 flex items-center gap-3">
              <ListChecks class="w-5 h-5 text-blue-400" />
              <h4 class="font-semibold text-foreground">子任务</h4>
              <span v-if="totalCount > 0" class="text-sm text-muted-foreground">
                {{ completedCount }}/{{ totalCount }} 完成
              </span>
            </div>

            <div v-if="totalCount > 0" class="mb-4">
              <div class="h-2 overflow-hidden rounded-full bg-secondary">
                <div class="h-full bg-blue-600 transition-all duration-500" :style="{ width: `${progressPercent}%` }">
                </div>
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <div v-for="subTask in subTasks" :key="subTask.id"
                class="flex items-center gap-3 rounded-md border border-border/80 bg-secondary/50 p-3">
                <button @click="toggleSubTaskComplete(subTask)" class="flex-shrink-0 transition-colors"
                  :class="subTask.isCompleted ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'">
                  <CheckCircle v-if="subTask.isCompleted" class="w-5 h-5" />
                  <Circle v-else class="w-5 h-5" />
                </button>
                <span class="flex-1 text-sm"
                  :class="subTask.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground/85'">
                  {{ subTask.title }}
                </span>
                <button
                  v-if="props.allowManage"
                  @click="deleteSubTask(subTask)"
                  class="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div v-if="props.allowManage && isAddingSubTask" class="mb-4">
              <div class="flex items-center gap-2">
                <Input :id="subTaskInputId" v-model="newSubTaskTitle" type="text" placeholder="输入子任务标题" class="h-10 flex-1 bg-secondary"
                  @keyup.enter="addSubTask" />
                <Button @click="addSubTask" class="h-10" :disabled="!canSubmitSubTask">
                  {{ isSubmittingSubTask ? '添加中...' : '添加' }}
                </Button>
                <Button @click="isAddingSubTask = false" variant="outline" class="h-10">
                  取消
                </Button>
              </div>
            </div>

            <Button v-else-if="props.allowManage" @click="isAddingSubTask = true" variant="outline"
              class="flex w-full items-center gap-2 border-dashed text-muted-foreground hover:border-ring hover:bg-secondary hover:text-foreground">
              <Plus class="w-5 h-5" />
              添加子任务
            </Button>
          </div>

          <div class="border-t border-border/80 pt-6">
            <div class="flex items-center justify-between text-sm text-muted-foreground">
              <span>创建时间: {{ new Date(task.createdAt).toLocaleString('zh-CN') }}</span>
              <span v-if="task.updatedAt !== task.createdAt">
                更新时间: {{ new Date(task.updatedAt).toLocaleString('zh-CN') }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="props.allowManage"
          class="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border/80 bg-card/95 px-6 py-4 backdrop-blur"
        >
          <Button @click="deleteTask(task)" variant="destructive" class="h-9 bg-destructive/85 hover:bg-destructive">
            删除任务
          </Button>
          <Button @click="emit('edit', task)" class="h-9 gap-2">
            <Edit3 class="w-4 h-4" />
            编辑任务
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
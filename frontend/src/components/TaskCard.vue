<script setup lang="ts">
import { ref } from 'vue'
import type { Task } from '@/types'
import { useTasksStore } from '@/stores/tasks'
import { CheckCircle, Circle, Clock, Tag, Trash2, Edit3, FileText, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { useConfirm } from '@/composables/useConfirm'
import { toast } from 'vue-sonner'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'

const props = withDefaults(defineProps<{
  task: Task
  allowManage?: boolean
}>(), {
  allowManage: true
})

const emit = defineEmits<{
  edit: [task: Task]
  view: [task: Task]
  toggleComplete: [task: Task, isCompleted: boolean]
}>()

const tasksStore = useTasksStore()
const showFullNotes = ref(false)
const { confirm } = useConfirm()

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
  const nextCompleted = !task.isCompleted
  await tasksStore.updateTaskById(task.id, { isCompleted: nextCompleted })
  emit('toggleComplete', task, nextCompleted)
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
    class="cursor-pointer rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-border"
    :class="{ 'opacity-60': task.isCompleted }"
    @click="emit('view', task)"
  >
    <div class="flex items-start gap-3">
      <button
        @click.stop="toggleComplete(task)"
        class="mt-1 transition-colors flex-shrink-0"
        :class="task.isCompleted ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'"
      >
        <CheckCircle v-if="task.isCompleted" class="w-5 h-5" />
        <Circle v-else class="w-5 h-5" />
      </button>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h3 
            class="font-medium truncate"
            :class="task.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'"
          >
            {{ task.title }}
          </h3>
          <Badge
            v-if="task.priority"
            class="flex-shrink-0 px-2 py-0.5 text-[11px] text-white"
            :class="priorityColors[task.priority] + ' border-transparent'"
          >
            {{ priorityLabels[task.priority] }}
          </Badge>
        </div>

        <p v-if="task.description" class="mb-2 truncate text-sm text-muted-foreground">
          {{ task.description }}
        </p>

        <div v-if="task.notes" class="mb-2">
          <div class="flex items-start gap-2 rounded-lg bg-secondary/55 p-3">
            <FileText class="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm text-foreground/85">
                {{ showFullNotes ? task.notes : getTruncatedNotes(task.notes) }}
              </p>
              <Button
                v-if="task.notes.length > 50"
                @click.stop="toggleNotes"
                variant="ghost"
                size="sm"
                class="mt-1 h-6 items-center gap-1 px-1.5 text-xs text-primary hover:text-primary/90"
              >
                {{ showFullNotes ? '收起' : '展开' }}
                <ChevronUp v-if="showFullNotes" class="w-3 h-3" />
                <ChevronDown v-else class="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span v-if="task.category" class="flex items-center gap-1">
            <Tag class="w-3 h-3" />
            {{ task.category }}
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
                class="rounded bg-secondary px-1.5 py-0.5 text-foreground/85"
              >
                {{ tag }}
              </span>
              <span v-if="task.tags.length > 3" class="text-muted-foreground">+{{ task.tags.length - 3 }}</span>
            </span>
          </span>
        </div>
      </div>

      <div
        v-if="props.allowManage"
        class="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <Button
          @click.stop="emit('edit', task)"
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <Edit3 class="w-4 h-4" />
        </Button>
        <Button
          @click.stop="deleteTask(task)"
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
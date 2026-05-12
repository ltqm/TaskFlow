<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { useVersionsStore } from '@/stores/versions'
import { Plus, Search, X, Calendar as CalendarIcon, FileText, Trash2, Edit3, ChevronRight } from 'lucide-vue-next'
import type { Version, Task } from '@/types'
import { useConfirm } from '@/composables/useConfirm'
import { toast } from 'vue-sonner'
import Button from '@/components/ui/button/Button.vue'
import TaskCard from '@/components/TaskCard.vue'
import TaskDetailModal from '@/components/TaskDetailModal.vue'
import Input from '@/components/ui/input/Input.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import Label from '@/components/ui/label/Label.vue'
import Calendar from '@/components/ui/calendar/Calendar.vue'
import Popover from '@/components/ui/popover/Popover.vue'
import PopoverContent from '@/components/ui/popover/PopoverContent.vue'
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue'

const versionsStore = useVersionsStore()
const { confirm } = useConfirm()

const showModal = ref(false)
const isEditing = ref(false)
const showTaskDetailModal = ref(false)
const searchQuery = ref('')
const releaseDateOpen = ref(false)

const form = ref({
  name: '',
  description: '',
  releaseDate: ''
})

const editingVersion = ref<Version | null>(null)
const viewingTask = ref<Task | null>(null)

const releaseDateValue = computed<DateValue | undefined>(() => {
  if (!form.value.releaseDate) return undefined
  try {
    return parseDate(form.value.releaseDate)
  } catch {
    return undefined
  }
})

const releaseDateLabel = computed(() => {
  if (!releaseDateValue.value) return '请选择发布日期'
  return releaseDateValue.value.toDate(getLocalTimeZone()).toLocaleDateString('zh-CN')
})

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
  releaseDateOpen.value = false
}

function handleReleaseDateSelect(value: DateValue | undefined) {
  if (!value) return
  form.value.releaseDate = value.toString()
  releaseDateOpen.value = false
}

async function handleSubmit() {
  if (!form.value.name.trim() || !form.value.releaseDate) {
    toast.error('请填写版本名称和发布日期')
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
    toast.success(isEditing.value ? '版本修改成功' : '版本创建成功')
  } catch (error) {
    console.error('Failed to save version:', error)
    toast.error('保存失败，请重试')
  }
}

async function deleteVersion(version: Version) {
  const ok = await confirm({
    title: '删除版本',
    description: '确定要删除这个版本吗？相关任务将不再关联该版本。',
    confirmText: '删除'
  })
  if (ok) {
    await versionsStore.deleteVersionById(version.id)
    toast.success('版本已删除')
  }
}

function openTaskDetail(task: Task) {
  viewingTask.value = task
  showTaskDetailModal.value = true
}

function closeTaskDetail() {
  showTaskDetailModal.value = false
  viewingTask.value = null
}

function onViewingTaskUpdated(task: Task) {
  viewingTask.value = task
}

async function syncVersionTasksBySelection() {
  if (!versionsStore.selectedVersion) return
  await versionsStore.selectVersion(versionsStore.selectedVersion)
}

async function handleTaskToggleComplete(_task: Task, isCompleted: boolean) {
  if (!viewingTask.value) {
    await syncVersionTasksBySelection()
    return
  }
  viewingTask.value = {
    ...viewingTask.value,
    isCompleted
  }
  await syncVersionTasksBySelection()
}
</script>

<template>
  <div class="ml-64 min-h-screen bg-background p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">版本管理</h1>
        <p class="mt-2 text-muted-foreground">共 {{ versionsStore.versions.length }} 个版本</p>
      </div>
      <Button @click="openModal()" class="h-10">
        <Plus class="w-5 h-5" />
        新建版本
      </Button>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div class="col-span-1">
        <div class="rounded-xl border border-border/80 bg-card">
          <div class="border-b border-border/80 p-4">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input v-model="searchQuery" type="text" placeholder="搜索版本..." class="bg-secondary pl-10" />
            </div>
          </div>

          <div class="max-h-[calc(100vh-250px)] overflow-y-auto">
            <div v-for="version in versionsStore.versions" :key="version.id"
              @click="versionsStore.selectVersion(version)"
              class="cursor-pointer border-b border-border/60 p-4 transition-colors"
              :class="versionsStore.selectedVersion?.id === version.id ? 'border-l-4 border-l-primary bg-primary/15' : 'hover:bg-secondary/60'">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="truncate font-medium text-foreground">{{ version.name }}</h3>
                  <div class="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarIcon class="w-3 h-3" />
                    {{ new Date(version.releaseDate).toLocaleDateString('zh-CN') }}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button @click.stop="openModal(version)"
                    class="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary">
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button @click.stop="deleteVersion(version)"
                    class="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive">
                    <Trash2 class="w-4 h-4" />
                  </button>
                  <ChevronRight class="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <p v-if="version.description" class="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {{ version.description }}
              </p>
            </div>

            <div v-if="versionsStore.versions.length === 0" class="p-8 text-center">
              <FileText class="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
              <p class="text-muted-foreground">暂无版本</p>
              <Button @click="openModal()" variant="ghost" class="mt-4">
                创建第一个版本
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-2">
        <div v-if="versionsStore.selectedVersion" class="h-full rounded-xl border border-border/80 bg-card">
          <div class="border-b border-border/80 p-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-foreground">{{ versionsStore.selectedVersion.name }}</h2>
                <div class="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span class="flex items-center gap-1">
                    <CalendarIcon class="w-4 h-4" />
                    {{ new Date(versionsStore.selectedVersion.releaseDate).toLocaleDateString('zh-CN') }}
                  </span>
                </div>
              </div>
              <button @click="versionsStore.clearSelection()"
                class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <X class="w-5 h-5" />
              </button>
            </div>
            <p v-if="versionsStore.selectedVersion.description" class="mt-4 text-muted-foreground">
              {{ versionsStore.selectedVersion.description }}
            </p>
          </div>

          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-foreground">关联任务</h3>
              <div class="flex items-center gap-4 text-sm">
                <span class="text-muted-foreground">待完成: <span class="font-medium text-foreground">{{
                  versionsStore.pendingVersionTasks.length }}</span></span>
                <span class="text-muted-foreground">已完成: <span class="font-medium text-emerald-400">{{
                  versionsStore.completedVersionTasks.length }}</span></span>
              </div>
            </div>

            <div class="space-y-3 max-h-[calc(100vh-380px)] overflow-y-auto">
              <TaskCard
                v-for="task in versionsStore.versionTasks"
                :key="task.id"
                :task="task"
                :allow-manage="false"
                @view="openTaskDetail"
                @toggle-complete="handleTaskToggleComplete"
              />

              <div v-if="versionsStore.versionTasks.length === 0" class="text-center py-12">
                <FileText class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p class="text-muted-foreground">该版本暂无关联任务</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex h-full items-center justify-center rounded-xl border border-border/80 bg-card">
          <div class="text-center">
            <FileText class="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 class="mb-2 text-xl font-semibold text-foreground">选择一个版本</h3>
            <p class="text-muted-foreground">从左侧列表中选择一个版本查看详情和关联任务</p>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal"
        class="z-overlay-modal fixed inset-0 flex items-center justify-center bg-black/82 px-4 backdrop-blur-sm">
        <div
          class="w-full max-w-lg rounded-xl border border-border/95 bg-card p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)]">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-foreground">{{ isEditing ? '编辑版本' : '新建版本' }}</h2>
            <Button @click="closeModal" variant="ghost" size="icon" class="text-muted-foreground hover:text-foreground">
              <X class="w-5 h-5" />
            </Button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <Label class="mb-1.5 block">版本名称 *</Label>
              <Input v-model="form.name" type="text" placeholder="例如: v1.0.0" class="bg-secondary" />
            </div>

            <div>
              <Label class="mb-1.5 block">发布日期 *</Label>
              <Popover v-model:open="releaseDateOpen">
                <PopoverTrigger as-child>
                  <Button type="button" variant="outline"
                    class="w-full justify-between bg-secondary font-normal text-foreground">
                    <span :class="releaseDateValue ? 'text-foreground' : 'text-muted-foreground'">
                      {{ releaseDateLabel }}
                    </span>
                    <CalendarIcon class="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto overflow-hidden p-0" align="start">
                  <Calendar :model-value="releaseDateValue" layout="month-and-year"
                    @update:model-value="handleReleaseDateSelect" />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label class="mb-1.5 block">版本描述</Label>
              <Textarea v-model="form.description" rows="3" placeholder="添加版本描述..." class="bg-secondary" />
            </div>

            <div class="flex items-center justify-end gap-4 pt-4">
              <Button type="button" @click="closeModal" variant="outline">
                取消
              </Button>
              <Button type="submit" class="px-6">
                {{ isEditing ? '保存修改' : '创建版本' }}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <TaskDetailModal
      v-if="viewingTask"
      :task="viewingTask"
      :show="showTaskDetailModal"
      :allow-manage="false"
      @close="closeTaskDetail"
      @task-updated="onViewingTaskUpdated"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Upload, AlertTriangle, CheckCircle2, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Button from '@/components/ui/button/Button.vue'
import type { TaskImportCommitResult, TaskImportPrecheckResult } from '@/services/api'
import { commitTaskImport, precheckTaskImport } from '@/services/api'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  imported: [result: TaskImportCommitResult]
}>()

const selectedFile = ref<File | null>(null)
const precheckResult = ref<TaskImportPrecheckResult | null>(null)
const isPrechecking = ref(false)
const isCommitting = ref(false)

const canCommit = computed(() => {
  const result = precheckResult.value
  return Boolean(result?.canCommit && result.importToken && result.fileHash)
})

const topErrors = computed(() => precheckResult.value?.errors.slice(0, 8) ?? [])
const topWarnings = computed(() => precheckResult.value?.warnings.slice(0, 8) ?? [])

watch(() => props.show, (visible) => {
  if (!visible) {
    resetState()
  }
})

function resetState() {
  selectedFile.value = null
  precheckResult.value = null
  isPrechecking.value = false
  isCommitting.value = false
}

function onSelectFile(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  selectedFile.value = file
  precheckResult.value = null
}

async function runPrecheck() {
  if (!selectedFile.value) {
    toast.error('请先选择导入文件')
    return
  }

  isPrechecking.value = true
  try {
    precheckResult.value = await precheckTaskImport(selectedFile.value)
    if (precheckResult.value.canCommit) {
      toast.success('预检通过，可以确认导入')
    } else {
      toast.error('预检未通过，请先修复错误行')
    }
  } catch (error) {
    const message = (error as { message?: string })?.message || '预检失败'
    toast.error(message)
  } finally {
    isPrechecking.value = false
  }
}

async function confirmImport() {
  const result = precheckResult.value
  if (!result?.importToken || !result.fileHash) {
    toast.error('缺少预检令牌，请重新预检')
    return
  }

  isCommitting.value = true
  try {
    const commitResult = await commitTaskImport(result.importToken, result.fileHash)
    toast.success(`导入成功：${commitResult.createdTaskCount} 条任务`)
    emit('imported', commitResult)
    emit('close')
  } catch (error) {
    const message = (error as { message?: string })?.message || '导入失败'
    toast.error(message)
  } finally {
    isCommitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="z-overlay-modal fixed inset-0 flex items-center justify-center bg-black/82 px-4 py-6 backdrop-blur-sm"
    >
      <div class="w-full max-w-3xl overflow-hidden rounded-xl border border-border/95 bg-card shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)]">
        <div class="border-b border-border/80 bg-card/95 px-6 py-4 backdrop-blur">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-foreground">批量导入任务</h2>
            <Button variant="ghost" size="icon" @click="emit('close')">
              <X class="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div class="space-y-4 px-6 py-5">
          <div class="rounded-lg border border-border/80 bg-secondary/40 p-4">
            <p class="text-sm text-foreground/90">
              支持 <code>.xlsx/.xls/.csv</code>，单次最多 100 行，最大 5MB。
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              如需导入子任务，请使用双 Sheet 的 xlsx 模板（<code>tasks</code> + <code>subtasks</code>）；子表「主任务标题」须与主表主任务标题完全一致（模板中子表列为下拉，选项来自主表标题列）。
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              CSV 仅支持任务主表，不支持子任务导入。
            </p>
            <div class="mt-2 flex items-center gap-3 text-sm">
              <a
                href="/task-import-template.xlsx"
                download
                class="text-primary hover:underline"
              >
                下载双 Sheet 模板（xlsx）
              </a>
              <a
                href="/task-import-template.csv"
                download
                class="text-primary/90 hover:underline"
              >
                下载主表模板（csv）
              </a>
            </div>
          </div>

          <div class="rounded-lg border border-border/80 bg-card p-4">
            <label class="mb-2 block text-sm font-medium text-foreground">选择导入文件</label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              class="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground hover:file:bg-primary/90"
              @change="onSelectFile"
            >
            <p v-if="selectedFile" class="mt-2 text-xs text-muted-foreground">
              已选择：{{ selectedFile.name }}
            </p>
          </div>

          <div v-if="precheckResult" class="rounded-lg border border-border/80 bg-card p-4">
            <div class="mb-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div class="rounded border border-border/70 bg-secondary/40 p-2">总行数：{{ precheckResult.totalRows }}</div>
              <div class="rounded border border-border/70 bg-secondary/40 p-2">可导入：{{ precheckResult.validRows }}</div>
              <div class="rounded border border-border/70 bg-secondary/40 p-2">错误：{{ precheckResult.errorRows }}</div>
              <div class="rounded border border-border/70 bg-secondary/40 p-2">警告：{{ precheckResult.warningRows }}</div>
            </div>

            <div v-if="topErrors.length" class="mb-3">
              <div class="mb-2 flex items-center gap-2 text-sm font-medium text-red-400">
                <AlertTriangle class="h-4 w-4" />
                错误（最多显示 8 条）
              </div>
              <ul class="space-y-1 text-xs text-red-300">
                <li v-for="item in topErrors" :key="`e-${item.rowIndex}-${item.field}-${item.reason}`">
                  第 {{ item.rowIndex }} 行 / {{ item.field }}：{{ item.reason }}
                </li>
              </ul>
            </div>

            <div v-if="topWarnings.length">
              <div class="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-400">
                <AlertTriangle class="h-4 w-4" />
                警告（最多显示 8 条）
              </div>
              <ul class="space-y-1 text-xs text-yellow-200">
                <li v-for="item in topWarnings" :key="`w-${item.rowIndex}-${item.field}-${item.reason}`">
                  第 {{ item.rowIndex }} 行 / {{ item.field }}：{{ item.reason }}
                </li>
              </ul>
            </div>

            <div
              v-if="precheckResult.canCommit"
              class="mt-3 flex items-center gap-2 text-sm text-green-400"
            >
              <CheckCircle2 class="h-4 w-4" />
              预检通过，可执行正式导入
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 border-t border-border/80 bg-card/95 px-6 py-4 backdrop-blur">
          <Button variant="outline" @click="emit('close')">
            取消
          </Button>
          <Button variant="secondary" :disabled="!selectedFile || isPrechecking" @click="runPrecheck">
            <Upload class="h-4 w-4" />
            {{ isPrechecking ? '预检中...' : '开始预检' }}
          </Button>
          <Button :disabled="!canCommit || isCommitting" @click="confirmImport">
            {{ isCommitting ? '导入中...' : '确认导入' }}
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

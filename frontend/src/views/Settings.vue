<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { useRouter } from 'vue-router'
import { User, Bell, Palette, Shield, LogOut, Plus, X, Save } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { formatApiError } from '@/utils/http-error'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'

const authStore = useAuthStore()
const tasksStore = useTasksStore()
const router = useRouter()

const showCategoryModal = ref(false)
const newCategoryName = ref('')
const newCategoryColor = ref('#3B82F6')

const availableColors = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
  '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'
]

function logout() {
  authStore.logout()
  router.push('/login')
}

async function addCategory() {
  if (!newCategoryName.value.trim()) {
    toast.error('请输入分类名称')
    return
  }
  
  try {
    await tasksStore.addCategory(newCategoryName.value, newCategoryColor.value)
    newCategoryName.value = ''
    newCategoryColor.value = '#3B82F6'
    showCategoryModal.value = false
    toast.success('分类添加成功')
  } catch (error) {
    console.error('Failed to add category:', error)
    toast.error(formatApiError(error))
  }
}

onMounted(async () => {
  try {
    await tasksStore.fetchCategories()
  } catch (error) {
    toast.error(formatApiError(error))
  }
})

</script>

<template>
  <div class="ml-64 min-h-screen bg-background p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">设置</h1>
      <p class="mt-2 text-muted-foreground">管理你的账户和偏好设置</p>
    </div>

    <div class="grid grid-cols-3 gap-8">
      <div class="col-span-2 space-y-6">
        <div class="rounded-xl border border-border/80 bg-card p-6">
          <div class="mb-6 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <User class="w-5 h-5 text-blue-500" />
            </div>
            <h2 class="text-lg font-semibold text-foreground">账户信息</h2>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="mb-1 block text-muted-foreground">用户名</Label>
                <Input
                  type="text"
                  :value="authStore.user?.username"
                  disabled
                  class="bg-secondary text-foreground"
                />
              </div>
              <div>
                <Label class="mb-1 block text-muted-foreground">邮箱</Label>
                <Input
                  type="email"
                  :value="authStore.user?.email"
                  disabled
                  class="bg-secondary text-foreground"
                />
              </div>
            </div>
            
            <div>
              <Label class="mb-1 block text-muted-foreground">注册时间</Label>
              <Input
                type="text"
                :value="authStore.user?.createdAt ? new Date(authStore.user.createdAt).toLocaleString('zh-CN') : ''"
                disabled
                class="bg-secondary text-foreground"
              />
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-border/80 bg-card p-6">
          <div class="mb-6 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15">
                <Palette class="w-5 h-5 text-green-500" />
              </div>
              <h2 class="text-lg font-semibold text-foreground">任务分类</h2>
            </div>
            <Button
              @click="showCategoryModal = true"
              class="h-9"
            >
              <Plus class="w-4 h-4" />
              添加分类
            </Button>
          </div>

          <div v-if="tasksStore.categories.length > 0" class="grid grid-cols-2 gap-4">
            <div 
              v-for="category in tasksStore.categories" 
              :key="category.id"
              class="flex items-center gap-3 rounded-lg bg-secondary/70 p-3"
            >
              <div 
                class="w-4 h-4 rounded-full"
                :style="{ backgroundColor: category.color }"
              />
              <span class="flex-1 text-foreground/90">{{ category.name }}</span>
            </div>
          </div>
          <div v-else class="rounded-lg border border-dashed border-border/80 bg-secondary/30 px-4 py-8 text-center">
            <p class="text-sm text-muted-foreground">暂无自定义分类。点击「添加分类」后可在任务中使用。</p>
          </div>
        </div>

        <div class="rounded-xl border border-border/80 bg-card p-6">
          <div class="mb-6 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15">
              <Bell class="w-5 h-5 text-yellow-500" />
            </div>
            <h2 class="text-lg font-semibold text-foreground">提醒设置</h2>
          </div>
          <p class="mb-4 text-xs text-muted-foreground/90">
            以下开关为界面预留；与任务「提醒时间」相关的浏览器通知请在「提醒中心」开启权限。
          </p>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-foreground">浏览器通知</h3>
                <p class="text-sm text-muted-foreground">任务到期时通过浏览器发送通知</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked class="sr-only peer" />
                <div class="h-6 w-11 rounded-full bg-secondary peer peer-checked:bg-primary peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-['']"></div>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-foreground">弹窗提醒</h3>
                <p class="text-sm text-muted-foreground">任务到期时在页面内显示弹窗提醒</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked class="sr-only peer" />
                <div class="h-6 w-11 rounded-full bg-secondary peer peer-checked:bg-primary peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-['']"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="rounded-xl border border-border/80 bg-card p-6">
          <div class="mb-6 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/15">
              <Shield class="w-5 h-5 text-red-500" />
            </div>
            <h2 class="text-lg font-semibold text-foreground">安全</h2>
          </div>

          <Button
            @click="logout"
            variant="destructive"
            class="w-full"
          >
            <LogOut class="w-5 h-5" />
            退出登录
          </Button>
        </div>

        <div class="rounded-xl border border-border/80 bg-card p-6">
          <h3 class="mb-4 font-medium text-foreground">关于</h3>
          <div class="space-y-2 text-sm text-muted-foreground">
            <p>版本: 1.0.0</p>
            <p>技术栈: Vue 3 + Node.js</p>
            <p>数据库: PostgreSQL</p>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showCategoryModal" class="z-overlay-modal fixed inset-0 flex items-center justify-center bg-black/82 px-4 backdrop-blur-sm">
        <div class="w-full max-w-md rounded-xl border border-border/95 bg-card p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)]">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-foreground">添加分类</h2>
            <Button @click="showCategoryModal = false" variant="ghost" size="icon" class="text-muted-foreground hover:text-foreground">
              <X class="w-5 h-5" />
            </Button>
          </div>

          <div class="space-y-4">
            <div>
              <Label class="mb-1.5 block">分类名称 *</Label>
              <Input
                v-model="newCategoryName"
                type="text"
                placeholder="输入分类名称"
                class="bg-secondary"
              />
            </div>

            <div>
              <Label class="mb-2 block">选择颜色</Label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in availableColors"
                  :key="color"
                  @click="newCategoryColor = color"
                  class="w-8 h-8 rounded-full transition-transform hover:scale-110"
                  :class="{ 'ring-2 ring-white ring-offset-2 ring-offset-background': newCategoryColor === color }"
                  :style="{ backgroundColor: color }"
                />
              </div>
            </div>

            <div class="flex items-center justify-end gap-4">
              <Button
                @click="showCategoryModal = false"
                variant="outline"
              >
                取消
              </Button>
              <Button
                @click="addCategory"
                class="px-6"
              >
                <Save class="w-4 h-4" />
                保存
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
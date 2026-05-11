<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { useRouter } from 'vue-router'
import { User, Bell, Palette, Shield, LogOut, Plus, X, Save } from 'lucide-vue-next'

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
    alert('请输入分类名称')
    return
  }
  
  try {
    await tasksStore.addCategory(newCategoryName.value, newCategoryColor.value)
    newCategoryName.value = ''
    newCategoryColor.value = '#3B82F6'
    showCategoryModal.value = false
  } catch (error) {
    console.error('Failed to add category:', error)
    alert('添加失败，请重试')
  }
}
</script>

<template>
  <div class="ml-64 p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white">设置</h1>
      <p class="text-gray-400 mt-2">管理你的账户和偏好设置</p>
    </div>

    <div class="grid grid-cols-3 gap-8">
      <div class="col-span-2 space-y-6">
        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <User class="w-5 h-5 text-blue-500" />
            </div>
            <h2 class="text-lg font-semibold text-white">账户信息</h2>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">用户名</label>
                <input
                  type="text"
                  :value="authStore.user?.username"
                  disabled
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">邮箱</label>
                <input
                  type="email"
                  :value="authStore.user?.email"
                  disabled
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">注册时间</label>
              <input
                type="text"
                :value="authStore.user?.createdAt ? new Date(authStore.user.createdAt).toLocaleString('zh-CN') : ''"
                disabled
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Palette class="w-5 h-5 text-green-500" />
              </div>
              <h2 class="text-lg font-semibold text-white">任务分类</h2>
            </div>
            <button
              @click="showCategoryModal = true"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus class="w-4 h-4" />
              添加分类
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div 
              v-for="category in tasksStore.categories" 
              :key="category.id"
              class="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg"
            >
              <div 
                class="w-4 h-4 rounded-full"
                :style="{ backgroundColor: category.color }"
              />
              <span class="flex-1 text-gray-300">{{ category.name }}</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <Bell class="w-5 h-5 text-yellow-500" />
            </div>
            <h2 class="text-lg font-semibold text-white">提醒设置</h2>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-white font-medium">浏览器通知</h3>
                <p class="text-gray-400 text-sm">任务到期时通过浏览器发送通知</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked class="sr-only peer" />
                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-white font-medium">弹窗提醒</h3>
                <p class="text-gray-400 text-sm">任务到期时在页面内显示弹窗提醒</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked class="sr-only peer" />
                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
              <Shield class="w-5 h-5 text-red-500" />
            </div>
            <h2 class="text-lg font-semibold text-white">安全</h2>
          </div>

          <button
            @click="logout"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-lg transition-colors"
          >
            <LogOut class="w-5 h-5" />
            退出登录
          </button>
        </div>

        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 class="text-white font-medium mb-4">关于</h3>
          <div class="space-y-2 text-sm text-gray-400">
            <p>版本: 1.0.0</p>
            <p>技术栈: Vue 3 + Node.js</p>
            <p>数据库: SQLite</p>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showCategoryModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-gray-800 rounded-2xl w-full max-w-md p-6 border border-gray-700">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-white">添加分类</h2>
            <button @click="showCategoryModal = false" class="p-2 text-gray-400 hover:text-white transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">分类名称 *</label>
              <input
                v-model="newCategoryName"
                type="text"
                placeholder="输入分类名称"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">选择颜色</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in availableColors"
                  :key="color"
                  @click="newCategoryColor = color"
                  class="w-8 h-8 rounded-full transition-transform hover:scale-110"
                  :class="{ 'ring-2 ring-white ring-offset-2 ring-offset-gray-800': newCategoryColor === color }"
                  :style="{ backgroundColor: color }"
                />
              </div>
            </div>

            <div class="flex items-center justify-end gap-4">
              <button
                @click="showCategoryModal = false"
                class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                @click="addCategory"
                class="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Save class="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
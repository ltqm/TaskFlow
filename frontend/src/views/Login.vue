<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Card from '@/components/ui/card/Card.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const username = ref('')
const showPassword = ref(false)
const error = ref('')

const title = computed(() => isLogin.value ? '登录' : '注册')

async function handleSubmit() {
  error.value = ''
  
  if (!email.value || !password.value) {
    error.value = '请填写所有必填字段'
    return
  }
  
  if (!isLogin.value && !username.value) {
    error.value = '请填写用户名'
    return
  }

  try {
    if (isLogin.value) {
      await authStore.handleLogin(email.value, password.value)
    } else {
      await authStore.handleRegister(username.value, email.value, password.value)
    }
    router.push('/')
  } catch (err: unknown) {
    const message = (err as { message?: string; response?: { data?: { msg?: string } } })?.message
      || (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg
    error.value = message || '操作失败，请重试'
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/40 to-background px-4">
    <div class="w-full max-w-md">
      <Card class="border-border/90 bg-card/95 p-8 shadow-[0_28px_70px_-34px_rgba(0,0,0,0.72)] backdrop-blur-sm">
        <div class="text-center mb-8">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <span class="text-white text-2xl font-bold">T</span>
          </div>
          <h1 class="text-3xl font-bold text-foreground">{{ title }}</h1>
          <p class="mt-2 text-muted-foreground">管理你的日常任务</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="!isLogin" class="space-y-2">
            <Label>用户名</Label>
            <Input
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              class="h-11 bg-secondary"
            />
          </div>

          <div class="space-y-2">
            <Label>邮箱</Label>
            <Input
              v-model="email"
              type="email"
              placeholder="请输入邮箱"
              class="h-11 bg-secondary"
            />
          </div>

          <div class="space-y-2">
            <Label>密码</Label>
            <div class="relative">
              <Input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="h-11 bg-secondary pr-12"
              />
              <Button
                type="button"
                @click="showPassword = !showPassword"
                variant="ghost"
                size="icon"
                class="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Eye v-if="showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div v-if="error" class="text-center text-sm text-red-400">{{ error }}</div>

          <Button
            type="submit"
            :disabled="authStore.loading"
            class="h-11 w-full"
          >
            <LogIn v-if="isLogin" class="w-5 h-5" />
            <UserPlus v-else class="w-5 h-5" />
            {{ authStore.loading ? '处理中...' : title }}
          </Button>
        </form>

        <div class="mt-6 text-center">
          <Button
            @click="isLogin = !isLogin"
            variant="ghost"
            class="text-sm text-primary hover:text-primary"
          >
            {{ isLogin ? '还没有账号？点击注册' : '已有账号？点击登录' }}
          </Button>
        </div>
      </Card>
    </div>
  </div>
</template>
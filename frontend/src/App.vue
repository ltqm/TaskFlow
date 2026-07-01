<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import Navigation from '@/components/Navigation.vue'
import { Toaster } from 'vue-sonner'
import { toast } from 'vue-sonner'
import ConfirmDialogHost from '@/components/ui/confirm-dialog/ConfirmDialogHost.vue'
import { useReminderBrowserNotifications } from '@/composables/useReminderBrowserNotifications'
import { formatApiError } from '@/utils/http-error'

const authStore = useAuthStore()
const tasksStore = useTasksStore()
const isLoading = ref(true)

useReminderBrowserNotifications()

onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.loadUser()
  }
  if (authStore.isAuthenticated) {
    try {
      await tasksStore.fetchTasks()
      await tasksStore.fetchCategories()
    } catch (error) {
      toast.error(formatApiError(error))
    }
  }
  isLoading.value = false
})
</script>

<template>
  <div class="dark min-h-screen bg-background text-foreground">
    <div v-if="isLoading" class="flex items-center justify-center h-screen">
      <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>
    <template v-else>
      <Navigation v-if="authStore.isAuthenticated" />
      <router-view />
    </template>
    <Toaster theme="dark" rich-colors position="top-center" />
    <ConfirmDialogHost />
  </div>
</template>
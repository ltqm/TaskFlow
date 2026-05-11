<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import Navigation from '@/components/Navigation.vue'

const authStore = useAuthStore()
const tasksStore = useTasksStore()
const isLoading = ref(true)

onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.loadUser()
  }
  if (authStore.isAuthenticated) {
    await tasksStore.fetchTasks()
    await tasksStore.fetchCategories()
  }
  isLoading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-gray-900">
    <div v-if="isLoading" class="flex items-center justify-center h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
    <template v-else>
      <Navigation v-if="authStore.isAuthenticated" />
      <router-view />
    </template>
  </div>
</template>
<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  value: string | number
  description?: string
  icon: Component
  color: 'primary' | 'green' | 'purple' | 'orange'
}>()

const colorClasses = {
  primary: 'bg-primary-50 text-primary-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600'
}
</script>

<template>
  <div class="card flex items-center gap-4">
    <div class="p-3 rounded-xl" :class="colorClasses[color]">
      <component :is="icon" class="w-6 h-6" />
    </div>
    <div>
      <p class="text-sm text-gray-500">{{ title }}</p>
      <p class="text-2xl font-bold text-gray-800">{{ value }}</p>
      <p v-if="description" class="text-xs text-gray-400">{{ description }}</p>
    </div>
  </div>
</template>

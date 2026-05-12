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
  primary: 'bg-primary/15 text-primary',
  green: 'bg-emerald-500/15 text-emerald-400',
  purple: 'bg-violet-500/15 text-violet-400',
  orange: 'bg-amber-500/15 text-amber-400'
}
</script>

<template>
  <div class="flex items-center gap-4 rounded-xl border border-border/80 bg-card p-4 text-card-foreground">
    <div class="p-3 rounded-xl" :class="colorClasses[color]">
      <component :is="icon" class="w-6 h-6" />
    </div>
    <div>
      <p class="text-sm text-muted-foreground">{{ title }}</p>
      <p class="text-2xl font-bold text-foreground">{{ value }}</p>
      <p v-if="description" class="text-xs text-muted-foreground">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

const classes = computed(() => cn('rounded-xl border border-border/80 bg-card text-card-foreground shadow-[0_8px_24px_-16px_rgba(0,0,0,0.55)]', attrs.class))
</script>

<template>
  <div v-bind="attrs" :class="classes">
    <slot />
  </div>
</template>

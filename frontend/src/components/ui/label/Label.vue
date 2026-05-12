<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const classes = computed(() => cn('text-sm font-medium text-foreground', attrs.class))
</script>

<template>
  <label v-bind="attrs" :class="classes">
    <slot />
  </label>
</template>

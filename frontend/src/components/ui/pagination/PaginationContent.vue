<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <ul :class="cn('flex flex-row flex-wrap items-center gap-1', props.class)">
    <slot />
  </ul>
</template>

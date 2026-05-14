<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <li :class="cn('inline-flex items-center', props.class)">
    <slot />
  </li>
</template>

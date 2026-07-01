<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <nav
    role="navigation"
    aria-label="分页"
    :class="cn('mx-auto flex w-full flex-col', props.class)"
  >
    <slot />
  </nav>
</template>

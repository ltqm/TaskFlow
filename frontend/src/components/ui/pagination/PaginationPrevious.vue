<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/button/Button.vue'

const props = defineProps<{
  disabled?: boolean
  class?: string
}>()

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()
</script>

<template>
  <Button
    type="button"
    variant="outline"
    size="default"
    :class="cn('h-9 gap-1 px-2.5 sm:pr-2.5', props.class)"
    aria-label="上一页"
    :disabled="props.disabled"
    @click="emit('click', $event)"
  >
    <slot>
      <ChevronLeft class="h-4 w-4" />
      <span class="hidden sm:inline">上一页</span>
    </slot>
  </Button>
</template>

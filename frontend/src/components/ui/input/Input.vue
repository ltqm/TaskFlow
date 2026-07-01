<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue?: string | number | null
}>(), {
  modelValue: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const attrs = useAttrs()
const classes = computed(() =>
  cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50',
    attrs.class
  )
)

function handleInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <input v-bind="attrs" :value="props.modelValue ?? ''" :class="classes" @input="handleInput" />
</template>

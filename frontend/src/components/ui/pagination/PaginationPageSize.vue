<script setup lang="ts">
import { useId } from 'vue'
import { cn } from '@/lib/utils'
import Label from '@/components/ui/label/Label.vue'

const model = defineModel<number>({ required: true })
const selectId = useId()

const props = withDefaults(
  defineProps<{
    options?: number[]
    label?: string
    class?: string
  }>(),
  {
    options: () => [9, 12, 24, 48],
    label: '每页'
  }
)
</script>

<template>
  <div :class="cn('flex items-center gap-2', props.class)">
    <Label :for="selectId" class="whitespace-nowrap text-sm font-normal text-muted-foreground">{{ props.label }}</Label>
    <select
      :id="selectId"
      v-model.number="model"
      :class="cn(
        'h-9 rounded-md border border-input bg-secondary px-3 py-1 text-sm text-foreground shadow-sm ring-offset-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
      )"
    >
      <option v-for="o in props.options" :key="o" :value="o">
        {{ o }}
      </option>
    </select>
  </div>
</template>

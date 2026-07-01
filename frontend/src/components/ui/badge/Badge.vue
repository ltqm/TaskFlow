<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border bg-transparent text-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

type BadgeVariants = VariantProps<typeof badgeVariants>
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  variant?: BadgeVariants['variant']
}>(), {
  variant: 'default'
})

const attrs = useAttrs()
const classes = computed(() => cn(badgeVariants({ variant: props.variant }), attrs.class))
</script>

<template>
  <span v-bind="attrs" :class="classes">
    <slot />
  </span>
</template>

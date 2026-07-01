<script setup lang="ts">
import type { CalendarRootEmits, CalendarRootProps } from 'reka-ui'
import { reactiveOmit } from '@vueuse/core'
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrev,
  CalendarRoot,
  useForwardPropsEmits
} from 'reka-ui'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<CalendarRootProps & { class?: string }>(), {
  fixedWeeks: true
})
const emits = defineEmits<CalendarRootEmits>()

const delegatedProps = reactiveOmit(props, 'class')
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <CalendarRoot
    v-slot="{ weekDays, grid }"
    v-bind="forwarded"
    :class="cn('rounded-md border border-border bg-card p-3', props.class)"
  >
    <CalendarHeader class="mb-3 flex items-center justify-between">
      <CalendarPrev class="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary">
        <ChevronLeft class="h-4 w-4" />
      </CalendarPrev>
      <CalendarHeading class="text-sm font-medium" />
      <CalendarNext class="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary">
        <ChevronRight class="h-4 w-4" />
      </CalendarNext>
    </CalendarHeader>

    <div class="space-y-2">
      <CalendarGrid v-for="month in grid" :key="month.value.toString()">
        <CalendarGridHead>
          <CalendarGridRow>
            <CalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              class="h-8 w-8 text-xs font-normal text-muted-foreground"
            >
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow v-for="(weekDates, index) in month.rows" :key="`week-${index}`">
            <CalendarCell
              v-for="dateValue in weekDates"
              :key="dateValue.toString()"
              :date="dateValue"
            >
              <CalendarCellTrigger
                :day="dateValue"
                :month="month.value"
                class="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground/40 data-[outside-view]:text-muted-foreground/50 data-[selected]:bg-primary data-[selected]:text-primary-foreground hover:bg-secondary"
              >
                {{ dateValue.day }}
              </CalendarCellTrigger>
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>

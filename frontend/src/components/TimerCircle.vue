<script setup lang="ts">
import { computed, watch, onUnmounted } from 'vue'
import { Play, Pause, RotateCcw } from 'lucide-vue-next'
import { useTimerStore } from '@/stores/timer'
import { useStatsStore } from '@/stores/stats'

const timerStore = useTimerStore()
const statsStore = useStatsStore()

const circumference = 2 * Math.PI * 120

const strokeDasharray = computed(() => `${circumference}`)

const strokeDashoffset = computed(() => {
  return circumference - (timerStore.progress / 100) * circumference
})

const timerColor = computed(() => {
  return timerStore.mode === 'work' ? 'hsl(var(--primary))' : '#22c55e'
})

let intervalId: number | null = null

watch(() => timerStore.isRunning, (isRunning) => {
  if (isRunning) {
    intervalId = window.setInterval(() => {
      timerStore.tick()
    }, 1000)
  } else if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
})

watch(() => timerStore.completedPomodoros, () => {
  statsStore.addPomodoro()
})

function toggleTimer() {
  if (timerStore.isRunning) {
    timerStore.pause()
  } else {
    timerStore.start()
  }
}

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <div class="relative w-72 h-72">
      <svg class="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
        <circle
          cx="130"
          cy="130"
          r="120"
          fill="none"
          stroke="hsl(var(--secondary))"
          stroke-width="12"
        />
        <circle
          cx="130"
          cy="130"
          r="120"
          fill="none"
          :stroke="timerColor"
          stroke-width="12"
          stroke-linecap="round"
          :stroke-dasharray="strokeDasharray"
          :stroke-dashoffset="strokeDashoffset"
          class="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-5xl font-bold text-foreground">{{ timerStore.formattedTime }}</span>
        <span class="mt-2 text-sm text-muted-foreground">{{ timerStore.modeText }}</span>
      </div>
    </div>
    
    <div class="mt-8 flex items-center gap-4">
      <button
        @click="timerStore.reset()"
        class="rounded-full bg-secondary p-3 transition-colors hover:bg-accent"
      >
        <RotateCcw class="h-5 w-5 text-foreground/80" />
      </button>
      
      <button
        @click="toggleTimer"
        class="p-5 rounded-full transition-all duration-200 shadow-lg"
        :class="timerStore.isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'"
      >
        <Pause v-if="timerStore.isRunning" class="w-8 h-8 text-white" />
        <Play v-else class="w-8 h-8 text-white ml-1" />
      </button>
      
      <button
        @click="timerStore.setMode(timerStore.mode === 'work' ? 'break' : 'work')"
        class="rounded-full bg-secondary p-3 transition-colors hover:bg-accent"
      >
        <span class="text-sm font-medium text-foreground/85">
          {{ timerStore.mode === 'work' ? '休息' : '工作' }}
        </span>
      </button>
    </div>
    
    <div class="mt-6 flex items-center gap-2">
      <span class="text-sm text-muted-foreground">今日完成</span>
      <span class="text-xl font-bold text-primary">{{ statsStore.todayStats.pomodoros }}</span>
      <span class="text-sm text-muted-foreground">个番茄</span>
    </div>
  </div>
</template>

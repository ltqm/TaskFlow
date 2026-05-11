import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type TimerMode = 'work' | 'break'

export interface TimerState {
  mode: TimerMode
  timeLeft: number
  isRunning: boolean
  completedPomodoros: number
}

export const useTimerStore = defineStore('timer', () => {
  const mode = ref<TimerMode>('work')
  const timeLeft = ref(25 * 60)
  const isRunning = ref(false)
  const completedPomodoros = ref(0)
  const workDuration = ref(25)
  const breakDuration = ref(5)

  const totalTime = computed(() => {
    return mode.value === 'work' ? workDuration.value * 60 : breakDuration.value * 60
  })

  const progress = computed(() => {
    return (timeLeft.value / totalTime.value) * 100
  })

  const formattedTime = computed(() => {
    const minutes = Math.floor(timeLeft.value / 60)
    const seconds = timeLeft.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const modeText = computed(() => {
    return mode.value === 'work' ? '专注时间' : '休息时间'
  })

  function start() {
    isRunning.value = true
  }

  function pause() {
    isRunning.value = false
  }

  function reset() {
    isRunning.value = false
    timeLeft.value = totalTime.value
  }

  function tick() {
    if (timeLeft.value > 0 && isRunning.value) {
      timeLeft.value--
    } else if (timeLeft.value === 0 && isRunning.value) {
      completePomodoro()
    }
  }

  function completePomodoro() {
    if (mode.value === 'work') {
      completedPomodoros.value++
      mode.value = 'break'
    } else {
      mode.value = 'work'
    }
    timeLeft.value = totalTime.value
  }

  function setMode(newMode: TimerMode) {
    mode.value = newMode
    timeLeft.value = totalTime.value
    isRunning.value = false
  }

  function setWorkDuration(minutes: number) {
    workDuration.value = minutes
    if (mode.value === 'work') {
      timeLeft.value = minutes * 60
    }
  }

  function setBreakDuration(minutes: number) {
    breakDuration.value = minutes
    if (mode.value === 'break') {
      timeLeft.value = minutes * 60
    }
  }

  return {
    mode,
    timeLeft,
    isRunning,
    completedPomodoros,
    workDuration,
    breakDuration,
    totalTime,
    progress,
    formattedTime,
    modeText,
    start,
    pause,
    reset,
    tick,
    completePomodoro,
    setMode,
    setWorkDuration,
    setBreakDuration
  }
})

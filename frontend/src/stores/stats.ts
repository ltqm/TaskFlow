import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface DailyStats {
  date: string
  pomodoros: number
  minutes: number
}

export const useStatsStore = defineStore('stats', () => {
  const weeklyStats = ref<DailyStats[]>([
    { date: '周一', pomodoros: 5, minutes: 125 },
    { date: '周二', pomodoros: 3, minutes: 75 },
    { date: '周三', pomodoros: 6, minutes: 150 },
    { date: '周四', pomodoros: 4, minutes: 100 },
    { date: '周五', pomodoros: 7, minutes: 175 },
    { date: '周六', pomodoros: 2, minutes: 50 },
    { date: '周日', pomodoros: 4, minutes: 100 }
  ])

  const monthlyStats = ref<DailyStats[]>([
    { date: '第1周', pomodoros: 22, minutes: 550 },
    { date: '第2周', pomodoros: 28, minutes: 700 },
    { date: '第3周', pomodoros: 18, minutes: 450 },
    { date: '第4周', pomodoros: 24, minutes: 600 }
  ])

  const todayStats = computed(() => {
    const today = weeklyStats.value[new Date().getDay() - 1] || weeklyStats.value[6]
    return {
      pomodoros: today.pomodoros,
      minutes: today.minutes,
      formattedTime: formatMinutes(today.minutes)
    }
  })

  const totalWeeklyPomodoros = computed(() => {
    return weeklyStats.value.reduce((sum, day) => sum + day.pomodoros, 0)
  })

  const totalWeeklyMinutes = computed(() => {
    return weeklyStats.value.reduce((sum, day) => sum + day.minutes, 0)
  })

  const averageDailyMinutes = computed(() => {
    return Math.round(totalWeeklyMinutes.value / 7)
  })

  function formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}小时${mins}分钟`
    }
    return `${mins}分钟`
  }

  function addPomodoro() {
    const dayIndex = new Date().getDay() - 1
    if (weeklyStats.value[dayIndex]) {
      weeklyStats.value[dayIndex].pomodoros++
      weeklyStats.value[dayIndex].minutes += 25
    }
  }

  return {
    weeklyStats,
    monthlyStats,
    todayStats,
    totalWeeklyPomodoros,
    totalWeeklyMinutes,
    averageDailyMinutes,
    addPomodoro,
    formatMinutes
  }
})

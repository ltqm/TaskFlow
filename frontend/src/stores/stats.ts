import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTimerStore } from './timer'
import { startOfWeekMonday, toLocalYMD } from '@/utils/calendar-week'

export interface DailyStats {
  date: string
  pomodoros: number
  minutes: number
}

const STORAGE_KEY = 'pomodoro_daily_log_v1'

function loadLog(): Record<string, { p: number; m: number }> {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const o = JSON.parse(raw) as unknown
    if (!o || typeof o !== 'object') return {}
    const out: Record<string, { p: number; m: number }> = {}
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (!v || typeof v !== 'object') continue
      const rec = v as Record<string, unknown>
      const p = Number(rec.p)
      const m = Number(rec.m)
      out[k] = { p: Number.isFinite(p) ? p : 0, m: Number.isFinite(m) ? m : 0 }
    }
    return out
  } catch {
    return {}
  }
}

function saveLog(log: Record<string, { p: number; m: number }>) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
  } catch {
    // ignore quota
  }
}

export const useStatsStore = defineStore('stats', () => {
  /** 递增以使基于 localStorage 的统计参与响应式更新 */
  const logVersion = ref(0)

  const weeklyStats = computed((): DailyStats[] => {
    logVersion.value
    const log = loadLog()
    const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const monday = startOfWeekMonday(new Date())
    return labels.map((label, i) => {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      const key = toLocalYMD(day)
      const e = log[key]
      return { date: label, pomodoros: e?.p ?? 0, minutes: e?.m ?? 0 }
    })
  })

  const monthlyStats = computed((): DailyStats[] => {
    logVersion.value
    const log = loadLog()
    const labels = ['第1周', '第2周', '第3周', '第4周']
    const baseMonday = startOfWeekMonday(new Date())
    return labels.map((label, wi) => {
      const monday = new Date(baseMonday)
      monday.setDate(baseMonday.getDate() - (3 - wi) * 7)
      let pomodoros = 0
      let minutes = 0
      for (let d = 0; d < 7; d++) {
        const day = new Date(monday)
        day.setDate(monday.getDate() + d)
        const e = log[toLocalYMD(day)]
        if (e) {
          pomodoros += e.p
          minutes += e.m
        }
      }
      return { date: label, pomodoros, minutes }
    })
  })

  const todayStats = computed(() => {
    logVersion.value
    const log = loadLog()
    const key = toLocalYMD(new Date())
    const e = log[key]
    const pomodoros = e?.p ?? 0
    const minutes = e?.m ?? 0
    return {
      pomodoros,
      minutes,
      formattedTime: formatMinutes(minutes)
    }
  })

  const totalWeeklyPomodoros = computed(() =>
    weeklyStats.value.reduce((sum, day) => sum + day.pomodoros, 0)
  )

  const totalWeeklyMinutes = computed(() =>
    weeklyStats.value.reduce((sum, day) => sum + day.minutes, 0)
  )

  const averageDailyMinutes = computed(() =>
    Math.round(totalWeeklyMinutes.value / 7)
  )

  function formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}小时${mins}分钟`
    }
    return `${mins}分钟`
  }

  /** 完成一个工作番茄后调用；按本地日写入 localStorage，与当前计时器工作时长一致 */
  function addPomodoro() {
    const timer = useTimerStore()
    const mins = timer.workDuration
    const log = loadLog()
    const key = toLocalYMD(new Date())
    const cur = log[key] || { p: 0, m: 0 }
    cur.p += 1
    cur.m += mins
    log[key] = cur
    saveLog(log)
    logVersion.value++
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

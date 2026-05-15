import { onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'

const STORAGE_FIRED = 'reminder_notification_fired_v1'

function loadFiredKeys(): Set<string> {
  if (typeof localStorage === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_FIRED)
    const arr = raw ? (JSON.parse(raw) as unknown) : []
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

function saveFiredKeys(keys: Set<string>) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_FIRED, JSON.stringify([...keys]))
  } catch {
    // ignore
  }
}

/** 在 App 根组件调用一次：登录后轮询任务 reminderTime，在已授予通知权限时弹出系统通知 */
export function useReminderBrowserNotifications() {
  const authStore = useAuthStore()
  const tasksStore = useTasksStore()

  let intervalId: number | null = null

  const GRACE_MS = 10 * 60 * 1000

  function tick() {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const now = Date.now()
    const fired = loadFiredKeys()
    let changed = false

    for (const task of tasksStore.tasks) {
      if (task.isCompleted || !task.reminderTime) continue
      const t = Date.parse(task.reminderTime)
      if (Number.isNaN(t)) continue
      if (now < t || now - t > GRACE_MS) continue
      const key = `${task.id}:${task.reminderTime}`
      if (fired.has(key)) continue
      try {
        new Notification(`任务提醒：${task.title}`, {
          body: '您在任务中设置的提醒时间已到。',
          tag: key
        })
      } catch {
        // ignore
      }
      fired.add(key)
      changed = true
    }
    if (changed) saveFiredKeys(fired)
  }

  function start() {
    if (intervalId != null) return
    intervalId = window.setInterval(tick, 30_000)
    tick()
  }

  function stop() {
    if (intervalId != null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  watch(
    () => authStore.isAuthenticated,
    ok => {
      if (ok) start()
      else stop()
    },
    { immediate: true }
  )

  watch(
    () => tasksStore.tasks,
    () => {
      if (authStore.isAuthenticated) tick()
    },
    { deep: true }
  )

  onUnmounted(stop)
}

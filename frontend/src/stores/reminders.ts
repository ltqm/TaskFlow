import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTasksStore } from './tasks'

export const useRemindersStore = defineStore('reminders', () => {
  const tasksStore = useTasksStore()

  const dismissedReminders = ref<Set<string>>(new Set())

  const expiredTasks = computed(() => {
    return tasksStore.tasks.filter(task => {
      if (!task.dueDate || task.isCompleted) return false
      const now = new Date()
      const dueDate = new Date(task.dueDate)
      return dueDate < now && !dismissedReminders.value.has(task.id)
    }).sort((a, b) => {
      return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    })
  })

  const upcomingTasks = computed(() => {
    return tasksStore.tasks.filter(task => {
      if (!task.dueDate || task.isCompleted) return false
      const now = new Date()
      const dueDate = new Date(task.dueDate)
      const diffMs = dueDate.getTime() - now.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      return diffHours >= 0 && diffHours <= 24 && !dismissedReminders.value.has(task.id)
    }).sort((a, b) => {
      return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    })
  })

  const allReminders = computed(() => {
    return [...expiredTasks.value, ...upcomingTasks.value]
  })

  const unreadCount = computed(() => allReminders.value.length)

  function dismissReminder(taskId: string) {
    dismissedReminders.value = new Set([...dismissedReminders.value, taskId])
  }

  function restoreReminder(taskId: string) {
    const next = new Set(dismissedReminders.value)
    next.delete(taskId)
    dismissedReminders.value = next
  }

  function dismissAll() {
    const next = new Set(dismissedReminders.value)
    allReminders.value.forEach(task => {
      next.add(task.id)
    })
    dismissedReminders.value = next
  }

  function restoreAll() {
    dismissedReminders.value = new Set()
  }

  function markTaskComplete(taskId: string) {
    tasksStore.updateTaskById(taskId, { isCompleted: true })
  }

  const hasDismissed = computed(() => dismissedReminders.value.size > 0)

  return {
    unreadCount,
    hasDismissed,
    expiredTasks,
    upcomingTasks,
    allReminders,
    dismissReminder,
    restoreReminder,
    dismissAll,
    restoreAll,
    markTaskComplete
  }
})

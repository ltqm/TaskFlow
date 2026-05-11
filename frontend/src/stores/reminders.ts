import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTasksStore } from './tasks'

export const useRemindersStore = defineStore('reminders', () => {
  const tasksStore = useTasksStore()
  
  const unreadCount = ref(3)
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

  function dismissReminder(taskId: string) {
    dismissedReminders.value.add(taskId)
    updateUnreadCount()
  }

  function restoreReminder(taskId: string) {
    dismissedReminders.value.delete(taskId)
    updateUnreadCount()
  }

  function dismissAll() {
    allReminders.value.forEach(task => {
      dismissedReminders.value.add(task.id)
    })
    updateUnreadCount()
  }

  function restoreAll() {
    dismissedReminders.value.clear()
    updateUnreadCount()
  }

  function updateUnreadCount() {
    unreadCount.value = allReminders.value.length
  }

  function markTaskComplete(taskId: string) {
    tasksStore.updateTaskById(taskId, { isCompleted: true })
    updateUnreadCount()
  }

  return {
    unreadCount,
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
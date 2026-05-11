import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, Category } from '@/types'
import { getTasks, createTask, updateTask, deleteTask, getCategories, createCategory } from '@/services/api'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)

  const pendingTasks = computed(() => tasks.value.filter(t => !t.isCompleted))
  const completedTasks = computed(() => tasks.value.filter(t => t.isCompleted))
  const highPriorityTasks = computed(() => tasks.value.filter(t => t.priority === 'high' && !t.isCompleted))

  async function fetchTasks() {
    loading.value = true
    try {
      tasks.value = await getTasks()
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    try {
      categories.value = await getCategories()
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'isCompleted'>) {
    try {
      const newTask = await createTask(task)
      tasks.value.unshift(newTask)
    } catch (error) {
      console.error('Failed to create task:', error)
      throw error
    }
  }

  async function updateTaskById(id: string, updates: Partial<Task>) {
    try {
      const updatedTask = await updateTask(id, updates)
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  }

  async function deleteTaskById(id: string) {
    try {
      await deleteTask(id)
      tasks.value = tasks.value.filter(t => t.id !== id)
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  }

  async function addCategory(name: string, color: string) {
    try {
      const newCategory = await createCategory(name, color)
      categories.value.push(newCategory)
    } catch (error) {
      console.error('Failed to create category:', error)
      throw error
    }
  }

  function filterByCategory(categoryId: string | null) {
    if (!categoryId) return tasks.value
    return tasks.value.filter(t => t.categoryId === categoryId)
  }

  function filterByPriority(priority: string) {
    if (priority === 'all') return tasks.value
    return tasks.value.filter(t => t.priority === priority)
  }

  function getTasksWithReminder() {
    const now = new Date()
    return tasks.value.filter(task => {
      if (!task.reminderTime || !task.dueDate) return false
      const reminderDate = new Date(task.dueDate)
      const [hours, minutes] = task.reminderTime.split(':').map(Number)
      reminderDate.setHours(hours, minutes, 0, 0)
      return reminderDate <= now && !task.isCompleted
    })
  }

  return {
    tasks,
    categories,
    loading,
    pendingTasks,
    completedTasks,
    highPriorityTasks,
    fetchTasks,
    fetchCategories,
    addTask,
    updateTaskById,
    deleteTaskById,
    addCategory,
    filterByCategory,
    filterByPriority,
    getTasksWithReminder
  }
})
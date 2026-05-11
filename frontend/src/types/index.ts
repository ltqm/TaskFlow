export interface Task {
  id: string
  title: string
  description: string
  category?: string
  categoryId: string | null
  versionId: string | null
  versionName?: string | null
  priority: 'high' | 'medium' | 'low'
  dueDate: string | null
  reminderTime: string | null
  tags: string[]
  notes: string
  completedPomodoros: number
  totalPomodoros: number
  createdAt: string
  updatedAt: string
  isCompleted: boolean
  subTasks?: SubTask[]
}

export interface SubTask {
  id: string
  taskId: string
  title: string
  description: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Version {
  id: string
  name: string
  description: string
  releaseDate: string
  createdAt: string
}

export interface Settings {
  workDuration: number
  breakDuration: number
  autoStartBreak: boolean
  autoStartWork: boolean
  soundEnabled: boolean
  darkMode: boolean
}

export interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  color: string
  createdAt: string
}
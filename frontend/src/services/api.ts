import axios from 'axios'
import type { Task, Category, User, Version, SubTask } from '@/types'

const API_BASE_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export async function register(username: string, email: string, password: string) {
  const response = await api.post('/auth/register', { username, email, password })
  return response.data
}

export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export async function getUser(): Promise<User> {
  const response = await api.get('/auth/user')
  return response.data
}

export async function getTasks(): Promise<Task[]> {
  const response = await api.get('/tasks')
  return response.data
}

export async function getTaskById(id: string): Promise<Task> {
  const response = await api.get(`/tasks/${id}`)
  return response.data
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedPomodoros' | 'isCompleted' | 'category' | 'versionName'>): Promise<Task> {
  const response = await api.post('/tasks', task)
  return response.data
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const response = await api.put(`/tasks/${id}`, updates)
  return response.data
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`)
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get('/categories')
  return response.data
}

export async function createCategory(name: string, color: string): Promise<Category> {
  const response = await api.post('/categories', { name, color })
  return response.data
}

export async function updateCategory(id: string, name: string, color: string): Promise<Category> {
  const response = await api.put(`/categories/${id}`, { name, color })
  return response.data
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`)
}

export async function getVersions(): Promise<Version[]> {
  const response = await api.get('/versions')
  return response.data
}

export async function getVersionById(id: string): Promise<Version & { tasks: Task[] }> {
  const response = await api.get(`/versions/${id}`)
  return response.data
}

export async function getTasksByVersion(id: string): Promise<Task[]> {
  const response = await api.get(`/versions/${id}/tasks`)
  return response.data
}

export async function createVersion(name: string, description: string, releaseDate: string): Promise<Version> {
  const response = await api.post('/versions', { name, description, releaseDate })
  return response.data
}

export async function updateVersion(id: string, name: string, description: string, releaseDate: string): Promise<Version> {
  const response = await api.put(`/versions/${id}`, { name, description, releaseDate })
  return response.data
}

export async function deleteVersion(id: string): Promise<void> {
  await api.delete(`/versions/${id}`)
}

export async function getSubTasks(taskId: string): Promise<SubTask[]> {
  const response = await api.get(`/subtasks/${taskId}`)
  return response.data
}

export async function createSubTask(taskId: string, title: string, description?: string): Promise<SubTask> {
  const response = await api.post('/subtasks', { taskId, title, description })
  return response.data
}

export async function updateSubTask(id: string, updates: Partial<SubTask>): Promise<SubTask> {
  const response = await api.put(`/subtasks/${id}`, updates)
  return response.data
}

export async function deleteSubTask(id: string): Promise<void> {
  await api.delete(`/subtasks/${id}`)
}

export default api
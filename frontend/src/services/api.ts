import axios from 'axios'
import type { AxiosResponse } from 'axios'
import type { Task, Category, User, Version, SubTask } from '@/types'

const API_BASE_URL = 'http://localhost:8088/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

interface ApiEnvelope<T> {
  code: number
  data: T
  msg: string
}

export interface TaskImportIssue {
  rowIndex: number
  field: string
  reason: string
}

export interface TaskImportPrecheckRow {
  rowIndex: number
  /** 与 tasks 表「主任务标题」一致，用于 subtasks 关联 */
  mainTaskTitle: string
  title: string
  description: string
  categoryId: string | null
  versionId: string | null
  priority: 'high' | 'medium' | 'low'
  dueDate: string | null
  reminderTime: string | null
  tags: string[]
  notes: string
  totalPomodoros: number
  subTaskCount: number
}

export interface TaskImportPrecheckResult {
  totalRows: number
  validRows: number
  errorRows: number
  warningRows: number
  canCommit: boolean
  importToken: string | null
  fileHash: string
  expiresAt: string | null
  errors: TaskImportIssue[]
  warnings: TaskImportIssue[]
  normalizedRows: TaskImportPrecheckRow[]
}

export interface TaskImportCommitResult {
  createdTaskCount: number
  createdSubtaskCount: number
  skippedRelationCount: number
  createdTasks: Task[]
}

function isApiEnvelope<T>(payload: unknown): payload is ApiEnvelope<T> {
  if (!payload || typeof payload !== 'object') return false
  return 'code' in payload && 'data' in payload && 'msg' in payload
}

function createApiError(message: string, code?: number) {
  const error = new Error(message) as Error & { code?: number }
  if (typeof code === 'number') {
    error.code = code
  }
  return error
}

function unwrapResponse<T>(payload: unknown): T {
  if (isApiEnvelope<T>(payload)) {
    if (payload.code === 0) return payload.data
    throw createApiError(payload.msg || '请求失败', payload.code)
  }

  // 兼容老接口结构，便于渐进迁移
  return payload as T
}

async function requestData<T>(request: Promise<AxiosResponse<ApiEnvelope<T> | T>>): Promise<T> {
  const response = await request
  return unwrapResponse<T>(response.data)
}

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
    const message = (error as { response?: { data?: { msg?: string } } })?.response?.data?.msg
    if (message && typeof message === 'string') {
      error.message = message
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export async function register(username: string, email: string, password: string) {
  return requestData(api.post('/auth/register', { username, email, password }))
}

export async function login(email: string, password: string) {
  return requestData(api.post('/auth/login', { email, password }))
}

export async function getUser(): Promise<User> {
  return requestData<User>(api.get('/auth/user'))
}

export async function getTasks(): Promise<Task[]> {
  return requestData<Task[]>(api.get('/tasks'))
}

export async function getTaskById(id: string): Promise<Task> {
  return requestData<Task>(api.get(`/tasks/${id}`))
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedPomodoros' | 'isCompleted' | 'category' | 'versionName'>): Promise<Task> {
  return requestData<Task>(api.post('/tasks', task))
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  return requestData<Task>(api.put(`/tasks/${id}`, updates))
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`)
}

export async function getCategories(): Promise<Category[]> {
  return requestData<Category[]>(api.get('/categories'))
}

export async function createCategory(name: string, color: string): Promise<Category> {
  return requestData<Category>(api.post('/categories', { name, color }))
}

export async function updateCategory(id: string, name: string, color: string): Promise<Category> {
  return requestData<Category>(api.put(`/categories/${id}`, { name, color }))
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`)
}

export async function getVersions(): Promise<Version[]> {
  return requestData<Version[]>(api.get('/versions'))
}

export async function getVersionById(id: string): Promise<Version & { tasks: Task[] }> {
  return requestData<Version & { tasks: Task[] }>(api.get(`/versions/${id}`))
}

export async function getTasksByVersion(id: string): Promise<Task[]> {
  return requestData<Task[]>(api.get(`/versions/${id}/tasks`))
}

export async function createVersion(name: string, description: string, releaseDate: string): Promise<Version> {
  return requestData<Version>(api.post('/versions', { name, description, releaseDate }))
}

export async function updateVersion(id: string, name: string, description: string, releaseDate: string): Promise<Version> {
  return requestData<Version>(api.put(`/versions/${id}`, { name, description, releaseDate }))
}

export async function deleteVersion(id: string): Promise<void> {
  await api.delete(`/versions/${id}`)
}

export async function getSubTasks(taskId: string): Promise<SubTask[]> {
  const data = await requestData<SubTask[] | { subTasks: SubTask[] }>(api.get(`/subtasks/${taskId}`))
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.subTasks)) return data.subTasks
  return []
}

export async function createSubTask(taskId: string, title: string, description?: string): Promise<SubTask> {
  return requestData<SubTask>(api.post('/subtasks', { taskId, title, description }))
}

export async function updateSubTask(id: string, updates: Partial<SubTask>): Promise<SubTask> {
  return requestData<SubTask>(api.put(`/subtasks/${id}`, updates))
}

export async function deleteSubTask(id: string): Promise<void> {
  await api.delete(`/subtasks/${id}`)
}

export async function precheckTaskImport(file: File): Promise<TaskImportPrecheckResult> {
  const formData = new FormData()
  formData.append('file', file)
  return requestData<TaskImportPrecheckResult>(api.post('/tasks/import/precheck', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }))
}

export async function commitTaskImport(importToken: string, fileHash: string): Promise<TaskImportCommitResult> {
  return requestData<TaskImportCommitResult>(api.post('/tasks/import/commit', {
    importToken,
    fileHash
  }))
}

export default api
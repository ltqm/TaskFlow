import fs from 'fs'

export interface User {
  id: string
  username: string
  email: string
  password: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  color: string
  userId: string
  createdAt: string
}

export interface Version {
  id: string
  name: string
  description: string
  releaseDate: string
  userId: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  categoryId: string | null
  versionId: string | null
  priority: 'high' | 'medium' | 'low'
  dueDate: string | null
  reminderTime: string | null
  tags: string[]
  notes: string
  completedPomodoros: number
  totalPomodoros: number
  createdAt: string
  isCompleted: boolean
  userId: string
}

interface Database {
  users: User[]
  categories: Category[]
  versions: Version[]
  tasks: Task[]
}

let db: Database = {
  users: [],
  categories: [],
  versions: [],
  tasks: []
}

const DATA_DIR = './data'
const DATA_FILE = `${DATA_DIR}/database.json`

export function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf-8')
      db = JSON.parse(data)
    } catch {
      db = { users: [], categories: [], versions: [], tasks: [] }
    }
  }

  return db
}

function saveDatabase() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2))
}

export function createUser(user: Omit<User, 'id'>): User {
  const newUser: User = { ...user, id: Date.now().toString() }
  db.users.push(newUser)
  saveDatabase()
  return newUser
}

export function getUserByEmail(email: string): User | undefined {
  return db.users.find(u => u.email === email)
}

export function getUserByUsername(username: string): User | undefined {
  return db.users.find(u => u.username === username)
}

export function getUserById(id: string): User | undefined {
  return db.users.find(u => u.id === id)
}

export function createCategory(category: Omit<Category, 'id'>): Category {
  const newCategory: Category = { ...category, id: Date.now().toString() }
  db.categories.push(newCategory)
  saveDatabase()
  return newCategory
}

export function getCategoriesByUserId(userId: string): Category[] {
  return db.categories.filter(c => c.userId === userId)
}

export function getCategoryById(id: string, userId: string): Category | undefined {
  return db.categories.find(c => c.id === id && c.userId === userId)
}

export function updateCategory(id: string, userId: string, updates: Partial<Category>): Category | undefined {
  const index = db.categories.findIndex(c => c.id === id && c.userId === userId)
  if (index === -1) return undefined
  db.categories[index] = { ...db.categories[index], ...updates }
  saveDatabase()
  return db.categories[index]
}

export function deleteCategory(id: string, userId: string): boolean {
  const index = db.categories.findIndex(c => c.id === id && c.userId === userId)
  if (index === -1) return false
  db.categories.splice(index, 1)
  db.tasks.forEach(t => {
    if (t.categoryId === id) {
      t.categoryId = null
    }
  })
  saveDatabase()
  return true
}

export function createVersion(version: Omit<Version, 'id'>): Version {
  const newVersion: Version = { ...version, id: Date.now().toString() }
  db.versions.push(newVersion)
  saveDatabase()
  return newVersion
}

export function getVersionsByUserId(userId: string): Version[] {
  return db.versions.filter(v => v.userId === userId).sort((a, b) => 
    new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  )
}

export function getVersionById(id: string, userId: string): Version | undefined {
  return db.versions.find(v => v.id === id && v.userId === userId)
}

export function updateVersion(id: string, userId: string, updates: Partial<Version>): Version | undefined {
  const index = db.versions.findIndex(v => v.id === id && v.userId === userId)
  if (index === -1) return undefined
  db.versions[index] = { ...db.versions[index], ...updates }
  saveDatabase()
  return db.versions[index]
}

export function deleteVersion(id: string, userId: string): boolean {
  const index = db.versions.findIndex(v => v.id === id && v.userId === userId)
  if (index === -1) return false
  db.versions.splice(index, 1)
  db.tasks.forEach(t => {
    if (t.versionId === id) {
      t.versionId = null
    }
  })
  saveDatabase()
  return true
}

export function createTask(task: Omit<Task, 'id'>): Task {
  const newTask: Task = { ...task, id: Date.now().toString() }
  db.tasks.push(newTask)
  saveDatabase()
  return newTask
}

export function getTasksByUserId(userId: string): Task[] {
  return db.tasks.filter(t => t.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getTasksByVersionId(versionId: string, userId: string): Task[] {
  return db.tasks.filter(t => t.versionId === versionId && t.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getTaskById(id: string, userId: string): Task | undefined {
  return db.tasks.find(t => t.id === id && t.userId === userId)
}

export function updateTask(id: string, userId: string, updates: Partial<Task>): Task | undefined {
  const index = db.tasks.findIndex(t => t.id === id && t.userId === userId)
  if (index === -1) return undefined
  db.tasks[index] = { ...db.tasks[index], ...updates }
  saveDatabase()
  return db.tasks[index]
}

export function deleteTask(id: string, userId: string): boolean {
  const index = db.tasks.findIndex(t => t.id === id && t.userId === userId)
  if (index === -1) return false
  db.tasks.splice(index, 1)
  saveDatabase()
  return true
}
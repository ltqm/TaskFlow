import { Prisma } from '@prisma/client'
import { prisma } from './db/prisma'

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

export interface SubTask {
  id: string
  taskId: string
  title: string
  description: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
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

function newId(): string {
  return Date.now().toString()
}

function parseTags(value: Prisma.JsonValue): string[] {
  if (value == null) return []
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string')
  }
  return []
}

function tagsJson(tags: string[]): Prisma.InputJsonValue {
  return tags as Prisma.InputJsonValue
}

function toUser(u: { id: string; username: string; email: string; password: string; createdAt: Date }): User {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    password: u.password,
    createdAt: u.createdAt.toISOString()
  }
}

function toCategory(c: {
  id: string
  name: string
  color: string
  userId: string
  createdAt: Date
}): Category {
  return {
    id: c.id,
    name: c.name,
    color: c.color,
    userId: c.userId,
    createdAt: c.createdAt.toISOString()
  }
}

function toVersion(v: {
  id: string
  name: string
  description: string
  releaseDate: string
  userId: string
  createdAt: Date
}): Version {
  return {
    id: v.id,
    name: v.name,
    description: v.description,
    releaseDate: v.releaseDate,
    userId: v.userId,
    createdAt: v.createdAt.toISOString()
  }
}

function toTask(t: {
  id: string
  title: string
  description: string
  categoryId: string | null
  versionId: string | null
  priority: string
  dueDate: string | null
  reminderTime: string | null
  tags: Prisma.JsonValue
  notes: string
  completedPomodoros: number
  totalPomodoros: number
  createdAt: Date
  isCompleted: boolean
  userId: string
}): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    categoryId: t.categoryId,
    versionId: t.versionId,
    priority: t.priority as Task['priority'],
    dueDate: t.dueDate,
    reminderTime: t.reminderTime,
    tags: parseTags(t.tags),
    notes: t.notes,
    completedPomodoros: t.completedPomodoros,
    totalPomodoros: t.totalPomodoros,
    createdAt: t.createdAt.toISOString(),
    isCompleted: t.isCompleted,
    userId: t.userId
  }
}

function toSubTask(s: {
  id: string
  taskId: string
  title: string
  description: string
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}): SubTask {
  return {
    id: s.id,
    taskId: s.taskId,
    title: s.title,
    description: s.description,
    isCompleted: s.isCompleted,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString()
  }
}

export async function initDatabase(): Promise<void> {
  await prisma.$connect()
  await prisma.$queryRaw`SELECT 1`
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const row = await prisma.user.create({
    data: {
      id: newId(),
      username: user.username,
      email: user.email,
      password: user.password,
      createdAt: new Date(user.createdAt)
    }
  })
  return toUser(row)
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const row = await prisma.user.findUnique({ where: { email } })
  return row ? toUser(row) : undefined
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const row = await prisma.user.findFirst({ where: { username } })
  return row ? toUser(row) : undefined
}

export async function getUserById(id: string): Promise<User | undefined> {
  const row = await prisma.user.findUnique({ where: { id } })
  return row ? toUser(row) : undefined
}

export async function createCategory(category: Omit<Category, 'id'>): Promise<Category> {
  const row = await prisma.category.create({
    data: {
      id: newId(),
      name: category.name,
      color: category.color,
      userId: category.userId,
      createdAt: new Date(category.createdAt)
    }
  })
  return toCategory(row)
}

export async function getCategoriesByUserId(userId: string): Promise<Category[]> {
  const rows = await prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' }
  })
  return rows.map(toCategory)
}

export async function getCategoryById(id: string, userId: string): Promise<Category | undefined> {
  const row = await prisma.category.findFirst({ where: { id, userId } })
  return row ? toCategory(row) : undefined
}

export async function updateCategory(
  id: string,
  userId: string,
  updates: Partial<Category>
): Promise<Category | undefined> {
  const existing = await prisma.category.findFirst({ where: { id, userId } })
  if (!existing) return undefined

  const data: Prisma.CategoryUpdateInput = {}
  if (updates.name !== undefined) data.name = updates.name
  if (updates.color !== undefined) data.color = updates.color

  const row = await prisma.category.update({
    where: { id },
    data
  })
  return toCategory(row)
}

export async function deleteCategory(id: string, userId: string): Promise<boolean> {
  const result = await prisma.category.deleteMany({ where: { id, userId } })
  return result.count > 0
}

export async function createVersion(version: Omit<Version, 'id'>): Promise<Version> {
  const row = await prisma.version.create({
    data: {
      id: newId(),
      name: version.name,
      description: version.description,
      releaseDate: version.releaseDate,
      userId: version.userId,
      createdAt: new Date(version.createdAt)
    }
  })
  return toVersion(row)
}

export async function getVersionsByUserId(userId: string): Promise<Version[]> {
  const rows = await prisma.version.findMany({
    where: { userId },
    orderBy: { releaseDate: 'desc' }
  })
  return rows.map(toVersion)
}

export async function getVersionById(id: string, userId: string): Promise<Version | undefined> {
  const row = await prisma.version.findFirst({ where: { id, userId } })
  return row ? toVersion(row) : undefined
}

export async function updateVersion(
  id: string,
  userId: string,
  updates: Partial<Version>
): Promise<Version | undefined> {
  const existing = await prisma.version.findFirst({ where: { id, userId } })
  if (!existing) return undefined

  const data: Prisma.VersionUpdateInput = {}
  if (updates.name !== undefined) data.name = updates.name
  if (updates.description !== undefined) data.description = updates.description
  if (updates.releaseDate !== undefined) data.releaseDate = updates.releaseDate

  const row = await prisma.version.update({
    where: { id },
    data
  })
  return toVersion(row)
}

export async function deleteVersion(id: string, userId: string): Promise<boolean> {
  const result = await prisma.version.deleteMany({ where: { id, userId } })
  return result.count > 0
}

export async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  const row = await prisma.task.create({
    data: {
      id: newId(),
      title: task.title,
      description: task.description,
      categoryId: task.categoryId,
      versionId: task.versionId,
      priority: task.priority,
      dueDate: task.dueDate,
      reminderTime: task.reminderTime,
      tags: tagsJson(task.tags),
      notes: task.notes,
      completedPomodoros: task.completedPomodoros,
      totalPomodoros: task.totalPomodoros,
      createdAt: new Date(task.createdAt),
      isCompleted: task.isCompleted,
      userId: task.userId
    }
  })
  return toTask(row)
}

export async function getTasksByUserId(userId: string): Promise<Task[]> {
  const rows = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
  return rows.map(toTask)
}

export async function getTasksByVersionId(versionId: string, userId: string): Promise<Task[]> {
  const rows = await prisma.task.findMany({
    where: { versionId, userId },
    orderBy: { createdAt: 'desc' }
  })
  return rows.map(toTask)
}

export async function getTaskById(id: string, userId: string): Promise<Task | undefined> {
  const row = await prisma.task.findFirst({ where: { id, userId } })
  return row ? toTask(row) : undefined
}

async function syncTaskCompletedWithSubTasksTx(tx: Prisma.TransactionClient, taskId: string): Promise<void> {
  const task = await tx.task.findUnique({ where: { id: taskId } })
  if (!task) return

  const subTasks = await tx.subTask.findMany({
    where: { taskId },
    orderBy: { createdAt: 'asc' }
  })
  if (subTasks.length === 0) return

  const allDone = subTasks.every(st => st.isCompleted)
  if (task.isCompleted === allDone) return

  await tx.task.update({
    where: { id: taskId },
    data: { isCompleted: allDone }
  })
}

export async function updateTask(id: string, userId: string, updates: Partial<Task>): Promise<Task | undefined> {
  const existing = await prisma.task.findFirst({ where: { id, userId } })
  if (!existing) return undefined

  const data: Prisma.TaskUncheckedUpdateInput = {}
  if (updates.title !== undefined) data.title = updates.title
  if (updates.description !== undefined) data.description = updates.description
  if (updates.categoryId !== undefined) data.categoryId = updates.categoryId
  if (updates.versionId !== undefined) data.versionId = updates.versionId
  if (updates.priority !== undefined) data.priority = updates.priority
  if (updates.dueDate !== undefined) data.dueDate = updates.dueDate
  if (updates.reminderTime !== undefined) data.reminderTime = updates.reminderTime
  if (updates.tags !== undefined) data.tags = tagsJson(updates.tags)
  if (updates.notes !== undefined) data.notes = updates.notes
  if (updates.completedPomodoros !== undefined) data.completedPomodoros = updates.completedPomodoros
  if (updates.totalPomodoros !== undefined) data.totalPomodoros = updates.totalPomodoros
  if (updates.createdAt !== undefined) data.createdAt = new Date(updates.createdAt)
  if (updates.isCompleted !== undefined) data.isCompleted = updates.isCompleted

  const cascadeCompleteChildren = updates.isCompleted === true
  if (Object.keys(data).length === 0 && !cascadeCompleteChildren) {
    return toTask(existing)
  }

  return prisma.$transaction(async tx => {
    if (cascadeCompleteChildren) {
      await tx.subTask.updateMany({
        where: { taskId: id },
        data: { isCompleted: true, updatedAt: new Date() }
      })
    }
    if (Object.keys(data).length === 0) {
      const row = await tx.task.findUniqueOrThrow({ where: { id } })
      return toTask(row)
    }
    const row = await tx.task.update({
      where: { id },
      data
    })
    return toTask(row)
  })
}

export async function deleteTask(id: string, userId: string): Promise<boolean> {
  const result = await prisma.task.deleteMany({ where: { id, userId } })
  return result.count > 0
}

export async function createSubTask(
  subTask: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SubTask> {
  const id = newId()
  const now = new Date()

  await prisma.$transaction(async tx => {
    await tx.subTask.create({
      data: {
        id,
        taskId: subTask.taskId,
        title: subTask.title,
        description: subTask.description,
        isCompleted: subTask.isCompleted,
        createdAt: now,
        updatedAt: now
      }
    })
    await syncTaskCompletedWithSubTasksTx(tx, subTask.taskId)
  })

  const row = await prisma.subTask.findUniqueOrThrow({ where: { id } })
  return toSubTask(row)
}

export async function getSubTasksByTaskId(taskId: string): Promise<SubTask[]> {
  const rows = await prisma.subTask.findMany({
    where: { taskId },
    orderBy: { createdAt: 'asc' }
  })
  return rows.map(toSubTask)
}

export async function updateSubTask(id: string, updates: Partial<SubTask>): Promise<SubTask | undefined> {
  const existing = await prisma.subTask.findUnique({ where: { id } })
  if (!existing) return undefined

  const taskId = existing.taskId

  await prisma.$transaction(async tx => {
    const data: Prisma.SubTaskUpdateInput = {
      updatedAt: new Date()
    }
    if (updates.title !== undefined) data.title = updates.title
    if (updates.description !== undefined) data.description = updates.description
    if (updates.isCompleted !== undefined) data.isCompleted = updates.isCompleted

    await tx.subTask.update({
      where: { id },
      data
    })

    if (updates.isCompleted !== undefined) {
      await syncTaskCompletedWithSubTasksTx(tx, taskId)
    }
  })

  const row = await prisma.subTask.findUnique({ where: { id } })
  return row ? toSubTask(row) : undefined
}

export async function deleteSubTask(id: string): Promise<boolean> {
  const existing = await prisma.subTask.findUnique({ where: { id } })
  if (!existing) return false

  const taskId = existing.taskId

  await prisma.$transaction(async tx => {
    await tx.subTask.delete({ where: { id } })
    await syncTaskCompletedWithSubTasksTx(tx, taskId)
  })

  return true
}

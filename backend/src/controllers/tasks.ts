import { Request, Response } from 'express'
import {
  getTasksByUserId,
  getTasksByUserIdPaged,
  getTaskById,
  createTask,
  updateTask,
  deleteTask as dbDeleteTask,
  getCategoriesByUserId,
  getVersionsByUserId,
  type TaskWithWorkflow
} from '../database'
import type { Category, Version } from '../database'
import { fail, ok } from '../utils/response'

function firstQuery(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined
  if (Array.isArray(v)) return firstQuery(v[0])
  const s = String(v).trim()
  return s === '' ? undefined : s
}

function parsePositiveInt(v: unknown, fallback: number, max?: number): number {
  const raw = firstQuery(v)
  const n = raw === undefined ? Number.NaN : parseInt(raw, 10)
  if (Number.isNaN(n) || n < 1) return fallback
  if (max !== undefined) return Math.min(max, n)
  return n
}

function formatTasksWithRelations(
  tasks: TaskWithWorkflow[],
  categories: Category[],
  versions: Version[]
) {
  return tasks.map(task => {
    const category = categories.find(c => c.id === task.categoryId)
    const version = versions.find(v => v.id === task.versionId)
    return {
      ...task,
      categoryName: category?.name || null,
      categoryColor: category?.color || null,
      versionName: version?.name || null
    }
  })
}

export async function getAllTasks(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const categories = await getCategoriesByUserId(userId)
    const versions = await getVersionsByUserId(userId)

    const pageRaw = firstQuery(req.query.page)
    const usePaging = pageRaw !== undefined

    if (usePaging) {
      const page = parsePositiveInt(req.query.page, 1)
      const pageSize = parsePositiveInt(req.query.pageSize, 12, 100)
      const search = firstQuery(req.query.search)
      const categoryId = firstQuery(req.query.categoryId)
      const priority = firstQuery(req.query.priority) ?? 'all'

      const { items, total } = await getTasksByUserIdPaged(userId, {
        page,
        pageSize,
        search,
        categoryId,
        priority
      })

      const formatted = formatTasksWithRelations(items, categories, versions)
      const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize)

      return ok(res, {
        items: formatted,
        total,
        page,
        pageSize,
        totalPages
      })
    }

    const tasks = await getTasksByUserId(userId)
    const formattedTasks = formatTasksWithRelations(tasks, categories, versions)

    return ok(res, formattedTasks)
  } catch (error) {
    return fail(res, 500, 20099, '获取任务列表失败')
  }
}

export async function getTaskByIdHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    const task = await getTaskById(id, userId)
    if (!task) {
      return fail(res, 404, 20001, '任务不存在')
    }

    const categories = await getCategoriesByUserId(userId)
    const versions = await getVersionsByUserId(userId)
    const category = categories.find(c => c.id === task.categoryId)
    const version = versions.find(v => v.id === task.versionId)

    return ok(res, {
      ...task,
      categoryName: category?.name || null,
      categoryColor: category?.color || null,
      versionName: version?.name || null
    })
  } catch (error) {
    return fail(res, 500, 20098, '获取任务失败')
  }
}

export async function createTaskHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const {
      title,
      description = '',
      categoryId = null,
      versionId = null,
      priority = 'medium',
      dueDate = null,
      reminderTime = null,
      tags = [],
      notes = '',
      totalPomodoros = 1
    } = req.body

    if (!title) {
      return fail(res, 400, 20011, '任务标题不能为空')
    }

    if (!versionId) {
      return fail(res, 400, 20012, '新增任务必须关联版本')
    }

    const versions = await getVersionsByUserId(userId)
    const targetVersion = versions.find(v => v.id === versionId)
    if (!targetVersion) {
      return fail(res, 400, 20013, '关联版本不存在或无权限')
    }

    const task = await createTask({
      title,
      description,
      categoryId,
      versionId,
      priority: priority as 'high' | 'medium' | 'low',
      dueDate,
      reminderTime,
      tags,
      notes,
      totalPomodoros,
      completedPomodoros: 0,
      createdAt: new Date().toISOString(),
      isCompleted: false,
      userId
    })

    const categories = await getCategoriesByUserId(userId)
    const category = categories.find(c => c.id === task.categoryId)
    const version = versions.find(v => v.id === task.versionId)

    return res.status(201).json({
      code: 0,
      data: {
        ...task,
        categoryName: category?.name || null,
        categoryColor: category?.color || null,
        versionName: version?.name || null
      },
      msg: ''
    })
  } catch (error) {
    return fail(res, 500, 20097, '创建任务失败')
  }
}

export async function updateTaskHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    const updates = req.body

    const existingTask = await getTaskById(id, userId)
    if (!existingTask) {
      return fail(res, 404, 20001, '任务不存在')
    }

    const task = await updateTask(id, userId, updates)
    if (!task) {
      return fail(res, 404, 20001, '任务不存在')
    }

    const categories = await getCategoriesByUserId(userId)
    const versions = await getVersionsByUserId(userId)
    const category = categories.find(c => c.id === task.categoryId)
    const version = versions.find(v => v.id === task.versionId)

    return ok(res, {
      ...task,
      categoryName: category?.name || null,
      categoryColor: category?.color || null,
      versionName: version?.name || null
    })
  } catch (error) {
    return fail(res, 500, 20096, '更新任务失败')
  }
}

export async function deleteTaskHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    const success = await dbDeleteTask(id, userId)
    if (!success) {
      return fail(res, 404, 20001, '任务不存在')
    }

    return ok(res, null, '任务已删除')
  } catch (error) {
    return fail(res, 500, 20095, '删除任务失败')
  }
}

import { Request, Response } from 'express'
import {
  getTasksByUserId,
  getTaskById,
  createTask,
  updateTask,
  deleteTask as dbDeleteTask,
  getCategoriesByUserId,
  getVersionsByUserId
} from '../database'
import { fail, ok } from '../utils/response'

export async function getAllTasks(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const tasks = await getTasksByUserId(userId)
    const categories = await getCategoriesByUserId(userId)
    const versions = await getVersionsByUserId(userId)

    const formattedTasks = tasks.map(task => {
      const category = categories.find(c => c.id === task.categoryId)
      const version = versions.find(v => v.id === task.versionId)
      return {
        ...task,
        categoryName: category?.name || null,
        categoryColor: category?.color || null,
        versionName: version?.name || null
      }
    })

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

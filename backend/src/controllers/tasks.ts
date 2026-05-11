import { Request, Response } from 'express'
import { getTasksByUserId, getTaskById, createTask, updateTask, deleteTask as dbDeleteTask, getCategoriesByUserId, getVersionsByUserId } from '../database'

export function getAllTasks(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const tasks = getTasksByUserId(userId)
    const categories = getCategoriesByUserId(userId)
    const versions = getVersionsByUserId(userId)

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

    res.json(formattedTasks)
  } catch (error) {
    res.status(500).json({ error: '获取任务列表失败' })
  }
}

export function getTaskByIdHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    const task = getTaskById(id, userId)
    if (!task) {
      return res.status(404).json({ error: '任务不存在' })
    }

    const categories = getCategoriesByUserId(userId)
    const versions = getVersionsByUserId(userId)
    const category = categories.find(c => c.id === task.categoryId)
    const version = versions.find(v => v.id === task.versionId)

    res.json({
      ...task,
      categoryName: category?.name || null,
      categoryColor: category?.color || null,
      versionName: version?.name || null
    })
  } catch (error) {
    res.status(500).json({ error: '获取任务失败' })
  }
}

export function createTaskHandler(req: Request, res: Response) {
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
      return res.status(400).json({ error: '任务标题不能为空' })
    }

    const task = createTask({
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

    const categories = getCategoriesByUserId(userId)
    const versions = getVersionsByUserId(userId)
    const category = categories.find(c => c.id === task.categoryId)
    const version = versions.find(v => v.id === task.versionId)

    res.status(201).json({
      ...task,
      categoryName: category?.name || null,
      categoryColor: category?.color || null,
      versionName: version?.name || null
    })
  } catch (error) {
    res.status(500).json({ error: '创建任务失败' })
  }
}

export function updateTaskHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    const updates = req.body

    const existingTask = getTaskById(id, userId)
    if (!existingTask) {
      return res.status(404).json({ error: '任务不存在' })
    }

    const task = updateTask(id, userId, updates)
    if (!task) {
      return res.status(404).json({ error: '任务不存在' })
    }

    const categories = getCategoriesByUserId(userId)
    const versions = getVersionsByUserId(userId)
    const category = categories.find(c => c.id === task.categoryId)
    const version = versions.find(v => v.id === task.versionId)

    res.json({
      ...task,
      categoryName: category?.name || null,
      categoryColor: category?.color || null,
      versionName: version?.name || null
    })
  } catch (error) {
    res.status(500).json({ error: '更新任务失败' })
  }
}

export function deleteTaskHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    const success = dbDeleteTask(id, userId)
    if (!success) {
      return res.status(404).json({ error: '任务不存在' })
    }

    res.json({ message: '任务已删除' })
  } catch (error) {
    res.status(500).json({ error: '删除任务失败' })
  }
}
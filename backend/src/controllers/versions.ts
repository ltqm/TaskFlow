import { Request, Response } from 'express'
import { getVersionsByUserId, getVersionById, createVersion, updateVersion as dbUpdateVersion, deleteVersion as dbDeleteVersion, getTasksByVersionId } from '../database'

export function getAllVersions(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const versions = getVersionsByUserId(userId)
    res.json(versions)
  } catch (error) {
    res.status(500).json({ error: '获取版本列表失败' })
  }
}

export function getVersionByIdHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    
    const version = getVersionById(id, userId)
    if (!version) {
      return res.status(404).json({ error: '版本不存在' })
    }
    
    const tasks = getTasksByVersionId(id, userId)
    res.json({ ...version, tasks })
  } catch (error) {
    res.status(500).json({ error: '获取版本详情失败' })
  }
}

export function createVersionHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { name, description = '', releaseDate } = req.body

    if (!name || !releaseDate) {
      return res.status(400).json({ error: '版本名称和发布日期不能为空' })
    }

    const existingVersion = getVersionsByUserId(userId).find(v => v.name === name)
    if (existingVersion) {
      return res.status(400).json({ error: '版本已存在' })
    }

    const version = createVersion({
      name,
      description,
      releaseDate,
      userId,
      createdAt: new Date().toISOString()
    })
    
    res.status(201).json(version)
  } catch (error) {
    res.status(500).json({ error: '创建版本失败' })
  }
}

export function updateVersionHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    const { name, description, releaseDate } = req.body

    const existingVersion = getVersionById(id, userId)
    if (!existingVersion) {
      return res.status(404).json({ error: '版本不存在' })
    }

    const updates: Partial<{ name: string; description: string; releaseDate: string }> = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (releaseDate !== undefined) updates.releaseDate = releaseDate

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: '没有提供更新字段' })
    }

    const version = dbUpdateVersion(id, userId, updates)
    if (!version) {
      return res.status(404).json({ error: '版本不存在' })
    }

    res.json(version)
  } catch (error) {
    res.status(500).json({ error: '更新版本失败' })
  }
}

export function deleteVersionHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    const success = dbDeleteVersion(id, userId)
    if (!success) {
      return res.status(404).json({ error: '版本不存在' })
    }

    res.json({ message: '版本已删除' })
  } catch (error) {
    res.status(500).json({ error: '删除版本失败' })
  }
}

export function getTasksByVersion(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    const version = getVersionById(id, userId)
    if (!version) {
      return res.status(404).json({ error: '版本不存在' })
    }

    const tasks = getTasksByVersionId(id, userId)
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: '获取版本任务失败' })
  }
}
import { Request, Response } from 'express'
import { getVersionsByUserId, getVersionById, createVersion, updateVersion as dbUpdateVersion, deleteVersion as dbDeleteVersion, getTasksByVersionId } from '../database'
import { fail, ok } from '../utils/response'

export function getAllVersions(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const versions = getVersionsByUserId(userId)
    return ok(res, versions)
  } catch (error) {
    return fail(res, 500, 40099, '获取版本列表失败')
  }
}

export function getVersionByIdHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    
    const version = getVersionById(id, userId)
    if (!version) {
      return fail(res, 404, 40001, '版本不存在')
    }
    
    const tasks = getTasksByVersionId(id, userId)
    return ok(res, { ...version, tasks })
  } catch (error) {
    return fail(res, 500, 40098, '获取版本详情失败')
  }
}

export function createVersionHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { name, description = '', releaseDate } = req.body

    if (!name || !releaseDate) {
      return fail(res, 400, 40011, '版本名称和发布日期不能为空')
    }

    const existingVersion = getVersionsByUserId(userId).find(v => v.name === name)
    if (existingVersion) {
      return fail(res, 400, 40012, '版本已存在')
    }

    const version = createVersion({
      name,
      description,
      releaseDate,
      userId,
      createdAt: new Date().toISOString()
    })
    
    return res.status(201).json({
      code: 0,
      data: version,
      msg: ''
    })
  } catch (error) {
    return fail(res, 500, 40097, '创建版本失败')
  }
}

export function updateVersionHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    const { name, description, releaseDate } = req.body

    const existingVersion = getVersionById(id, userId)
    if (!existingVersion) {
      return fail(res, 404, 40001, '版本不存在')
    }

    const updates: Partial<{ name: string; description: string; releaseDate: string }> = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (releaseDate !== undefined) updates.releaseDate = releaseDate

    if (Object.keys(updates).length === 0) {
      return fail(res, 400, 40013, '没有提供更新字段')
    }

    const version = dbUpdateVersion(id, userId, updates)
    if (!version) {
      return fail(res, 404, 40001, '版本不存在')
    }

    return ok(res, version)
  } catch (error) {
    return fail(res, 500, 40096, '更新版本失败')
  }
}

export function deleteVersionHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    const success = dbDeleteVersion(id, userId)
    if (!success) {
      return fail(res, 404, 40001, '版本不存在')
    }

    return ok(res, null, '版本已删除')
  } catch (error) {
    return fail(res, 500, 40095, '删除版本失败')
  }
}

export function getTasksByVersion(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    const version = getVersionById(id, userId)
    if (!version) {
      return fail(res, 404, 40001, '版本不存在')
    }

    const tasks = getTasksByVersionId(id, userId)
    return ok(res, tasks)
  } catch (error) {
    return fail(res, 500, 40094, '获取版本任务失败')
  }
}
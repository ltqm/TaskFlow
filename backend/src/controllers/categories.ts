import { Request, Response } from 'express'
import {
  getCategoriesByUserId,
  getCategoryById,
  createCategory,
  updateCategory as dbUpdateCategory,
  deleteCategory as dbDeleteCategory
} from '../database'
import { fail, ok } from '../utils/response'

export async function getAllCategories(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const categories = await getCategoriesByUserId(userId)
    return ok(res, categories)
  } catch (error) {
    return fail(res, 500, 30099, '获取分类列表失败')
  }
}

export async function createCategoryHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { name, color = '#3B82F6' } = req.body

    if (!name) {
      return fail(res, 400, 30011, '分类名称不能为空')
    }

    const list = await getCategoriesByUserId(userId)
    const existingCategory = list.find(c => c.name === name)
    if (existingCategory) {
      return fail(res, 400, 30012, '分类已存在')
    }

    const category = await createCategory({
      name,
      color,
      userId,
      createdAt: new Date().toISOString()
    })

    return res.status(201).json({
      code: 0,
      data: category,
      msg: ''
    })
  } catch (error) {
    return fail(res, 500, 30097, '创建分类失败')
  }
}

export async function updateCategoryHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    const { name, color } = req.body

    const existingCategory = await getCategoryById(id, userId)
    if (!existingCategory) {
      return fail(res, 404, 30001, '分类不存在')
    }

    const updates: Partial<{ name: string; color: string }> = {}
    if (name !== undefined) updates.name = name
    if (color !== undefined) updates.color = color

    if (Object.keys(updates).length === 0) {
      return fail(res, 400, 30013, '没有提供更新字段')
    }

    const category = await dbUpdateCategory(id, userId, updates)
    if (!category) {
      return fail(res, 404, 30001, '分类不存在')
    }

    return ok(res, category)
  } catch (error) {
    return fail(res, 500, 30096, '更新分类失败')
  }
}

export async function deleteCategoryHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    const success = await dbDeleteCategory(id, userId)
    if (!success) {
      return fail(res, 404, 30001, '分类不存在')
    }

    return ok(res, null, '分类已删除')
  } catch (error) {
    return fail(res, 500, 30095, '删除分类失败')
  }
}

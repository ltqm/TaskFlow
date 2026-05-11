import { Request, Response } from 'express'
import { getCategoriesByUserId, getCategoryById, createCategory, updateCategory as dbUpdateCategory, deleteCategory as dbDeleteCategory } from '../database'

export function getAllCategories(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const categories = getCategoriesByUserId(userId)
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: '获取分类列表失败' })
  }
}

export function getCategoryByIdHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    
    const category = getCategoryById(id, userId)
    if (!category) {
      return res.status(404).json({ error: '分类不存在' })
    }
    
    res.json(category)
  } catch (error) {
    res.status(500).json({ error: '获取分类失败' })
  }
}

export function createCategoryHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { name, color = '#3B82F6' } = req.body

    if (!name) {
      return res.status(400).json({ error: '分类名称不能为空' })
    }

    const existingCategory = getCategoriesByUserId(userId).find(c => c.name === name)
    if (existingCategory) {
      return res.status(400).json({ error: '分类已存在' })
    }

    const category = createCategory({
      name,
      color,
      userId,
      createdAt: new Date().toISOString()
    })
    
    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ error: '创建分类失败' })
  }
}

export function updateCategoryHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    const { name, color } = req.body

    const existingCategory = getCategoryById(id, userId)
    if (!existingCategory) {
      return res.status(404).json({ error: '分类不存在' })
    }

    const updates: Partial<{ name: string; color: string }> = {}
    if (name !== undefined) updates.name = name
    if (color !== undefined) updates.color = color

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: '没有提供更新字段' })
    }

    const category = dbUpdateCategory(id, userId, updates)
    if (!category) {
      return res.status(404).json({ error: '分类不存在' })
    }

    res.json(category)
  } catch (error) {
    res.status(500).json({ error: '更新分类失败' })
  }
}

export function deleteCategoryHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    const success = dbDeleteCategory(id, userId)
    if (!success) {
      return res.status(404).json({ error: '分类不存在' })
    }

    res.json({ message: '分类已删除' })
  } catch (error) {
    res.status(500).json({ error: '删除分类失败' })
  }
}
import type { Category, Task } from '@/types'

/** 与列表接口返回的 categoryName 对齐，并兼容旧字段与仅 categoryId */
export function resolveTaskCategoryLabel(task: Task, categories: Category[]): string {
  return (
    task.categoryName ??
    task.category ??
    (task.categoryId ? categories.find(c => c.id === task.categoryId)?.name : null) ??
    '未分类'
  )
}

import { Request, Response } from 'express'
import { 
  createSubTask, 
  getSubTasksByTaskId, 
  getSubTaskById, 
  updateSubTask, 
  deleteSubTask 
} from '../database'
import { fail, ok } from '../utils/response'

export async function createSubTaskHandler(req: Request, res: Response) {
  try {
    const { taskId, title, description } = req.body
    
    if (!taskId || !title) {
      return fail(res, 400, 50011, '任务ID和标题必填')
    }
    
    const subTask = createSubTask({
      taskId,
      title,
      description: description || '',
      isCompleted: false
    })
    
    return res.status(201).json({
      code: 0,
      data: subTask,
      msg: ''
    })
  } catch (error) {
    return fail(res, 500, 50099, '创建子任务失败')
  }
}

export async function getSubTasksHandler(req: Request, res: Response) {
  try {
    const { taskId } = req.params
    
    if (!taskId) {
      return fail(res, 400, 50012, '任务ID必填')
    }
    
    const subTasks = getSubTasksByTaskId(taskId)
    return ok(res, subTasks)
  } catch (error) {
    return fail(res, 500, 50098, '获取子任务失败')
  }
}

export async function getSubTaskHandler(req: Request, res: Response) {
  try {
    const { id } = req.params
    
    const subTask = getSubTaskById(id)
    if (!subTask) {
      return fail(res, 404, 50001, '子任务不存在')
    }
    
    return ok(res, subTask)
  } catch (error) {
    return fail(res, 500, 50097, '获取子任务失败')
  }
}

export async function updateSubTaskHandler(req: Request, res: Response) {
  try {
    const { id } = req.params
    const updates = req.body
    
    const subTask = updateSubTask(id, updates)
    if (!subTask) {
      return fail(res, 404, 50001, '子任务不存在')
    }
    
    return ok(res, subTask)
  } catch (error) {
    return fail(res, 500, 50096, '更新子任务失败')
  }
}

export async function deleteSubTaskHandler(req: Request, res: Response) {
  try {
    const { id } = req.params
    
    const success = deleteSubTask(id)
    if (!success) {
      return fail(res, 404, 50001, '子任务不存在')
    }
    
    return ok(res, null, '删除成功')
  } catch (error) {
    return fail(res, 500, 50095, '删除子任务失败')
  }
}
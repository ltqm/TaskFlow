import { Request, Response } from 'express'
import { 
  createSubTask, 
  getSubTasksByTaskId, 
  getSubTaskById, 
  updateSubTask, 
  deleteSubTask 
} from '../database'

export async function createSubTaskHandler(req: Request, res: Response) {
  try {
    const { taskId, title, description } = req.body
    
    if (!taskId || !title) {
      return res.status(400).json({ error: '任务ID和标题必填' })
    }
    
    const subTask = createSubTask({
      taskId,
      title,
      description: description || '',
      isCompleted: false
    })
    
    res.status(201).json(subTask)
  } catch (error) {
    res.status(500).json({ error: '创建子任务失败' })
  }
}

export async function getSubTasksHandler(req: Request, res: Response) {
  try {
    const { taskId } = req.params
    
    if (!taskId) {
      return res.status(400).json({ error: '任务ID必填' })
    }
    
    const subTasks = getSubTasksByTaskId(taskId)
    res.json(subTasks)
  } catch (error) {
    res.status(500).json({ error: '获取子任务失败' })
  }
}

export async function getSubTaskHandler(req: Request, res: Response) {
  try {
    const { id } = req.params
    
    const subTask = getSubTaskById(id)
    if (!subTask) {
      return res.status(404).json({ error: '子任务不存在' })
    }
    
    res.json(subTask)
  } catch (error) {
    res.status(500).json({ error: '获取子任务失败' })
  }
}

export async function updateSubTaskHandler(req: Request, res: Response) {
  try {
    const { id } = req.params
    const updates = req.body
    
    const subTask = updateSubTask(id, updates)
    if (!subTask) {
      return res.status(404).json({ error: '子任务不存在' })
    }
    
    res.json(subTask)
  } catch (error) {
    res.status(500).json({ error: '更新子任务失败' })
  }
}

export async function deleteSubTaskHandler(req: Request, res: Response) {
  try {
    const { id } = req.params
    
    const success = deleteSubTask(id)
    if (!success) {
      return res.status(404).json({ error: '子任务不存在' })
    }
    
    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ error: '删除子任务失败' })
  }
}
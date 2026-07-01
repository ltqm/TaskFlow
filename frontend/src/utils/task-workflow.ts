import type { Task, TaskWorkflowStatus } from '@/types'

export function resolveTaskWorkflowStatus(task: Task): TaskWorkflowStatus {
  if (task.workflowStatus) return task.workflowStatus
  return task.isCompleted ? 'completed' : 'pending'
}

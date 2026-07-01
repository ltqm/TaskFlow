export type TaskWorkflowStatus = 'pending' | 'in_progress' | 'completed'

/**
 * 根据主任务完成标记与子任务完成情况派生三态（不落库）。
 */
export function computeWorkflowStatus(
  isCompleted: boolean,
  subTaskCompletedFlags: boolean[]
): TaskWorkflowStatus {
  if (isCompleted) return 'completed'
  if (subTaskCompletedFlags.length === 0) return 'pending'
  const done = subTaskCompletedFlags.filter(Boolean).length
  if (done === 0) return 'pending'
  if (done === subTaskCompletedFlags.length) return 'completed'
  return 'in_progress'
}

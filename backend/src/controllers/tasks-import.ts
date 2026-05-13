import crypto from 'crypto'
import { Request, Response } from 'express'
import * as XLSX from 'xlsx'
import {
  createSubTask,
  createTask,
  createVersion,
  getCategoriesByUserId,
  getVersionsByUserId
} from '../database'
import { fail, ok } from '../utils/response'

const MAX_IMPORT_ROWS = 100
const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024
const IMPORT_TOKEN_TTL_MS = 10 * 60 * 1000

type Priority = 'high' | 'medium' | 'low'

interface ImportIssue {
  rowIndex: number
  field: string
  reason: string
}

interface NormalizedSubTaskInput {
  title: string
  description: string
}

interface NormalizedTaskInput {
  title: string
  description: string
  categoryId: string | null
  versionId: string | null
  priority: Priority
  dueDate: string | null
  reminderTime: string | null
  tags: string[]
  notes: string
  totalPomodoros: number
}

interface NormalizedImportRow {
  rowIndex: number
  task: NormalizedTaskInput
  subTasks: NormalizedSubTaskInput[]
}

interface ImportSession {
  userId: string
  fileHash: string
  expiresAt: number
  rows: NormalizedImportRow[]
}

const importSessions = new Map<string, ImportSession>()

const TASK_HEADER_ALIASES: Record<string, string> = {
  taskRef: 'taskRef',
  '任务引用': 'taskRef',
  title: 'title',
  '任务标题': 'title',
  '主任务标题': 'title',
  description: 'description',
  '任务描述': 'description',
  priority: 'priority',
  '优先级': 'priority',
  dueDate: 'dueDate',
  '截止时间': 'dueDate',
  reminderTime: 'reminderTime',
  '提醒时间': 'reminderTime',
  tags: 'tags',
  '标签': 'tags',
  notes: 'notes',
  '备注': 'notes',
  totalPomodoros: 'totalPomodoros',
  '预估番茄钟': 'totalPomodoros',
  categoryName: 'categoryName',
  '分类': 'categoryName',
  versionName: 'versionName',
  '版本': 'versionName',
  subTasks: 'subTasks',
  '子任务': 'subTasks'
}

const SUBTASK_HEADER_ALIASES: Record<string, string> = {
  parentTitle: 'parentTitle',
  '主任务标题': 'parentTitle',
  '所属主任务': 'parentTitle',
  title: 'title',
  '子任务标题': 'title',
  description: 'description',
  '子任务描述': 'description'
}

function normalizeHeader(input: string) {
  return input.replace(/\s+/g, '').trim()
}

function toStringValue(value: unknown) {
  if (value === undefined || value === null) {
    return ''
  }
  return String(value).trim()
}

function normalizePriority(value: string, rowIndex: number, warnings: ImportIssue[]): Priority {
  if (!value) {
    return 'medium'
  }
  if (value === 'high' || value === 'medium' || value === 'low') {
    return value
  }
  warnings.push({
    rowIndex,
    field: 'priority',
    reason: `非法优先级 "${value}"，已回退为 medium`
  })
  return 'medium'
}

function normalizePositiveInteger(value: string, rowIndex: number, warnings: ImportIssue[]) {
  if (!value) {
    return 1
  }
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed < 1) {
    warnings.push({
      rowIndex,
      field: 'totalPomodoros',
      reason: `非法番茄钟数量 "${value}"，已回退为 1`
    })
    return 1
  }
  return parsed
}

function normalizeIsoDateTime(
  value: string,
  rowIndex: number,
  field: 'dueDate' | 'reminderTime',
  warnings: ImportIssue[]
) {
  if (!value) {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    warnings.push({
      rowIndex,
      field,
      reason: `非法时间 "${value}"，已置空`
    })
    return null
  }
  return date.toISOString()
}

function normalizeTags(value: string) {
  if (!value) {
    return []
  }
  return value
    .split(/[|,，]/)
    .map(tag => tag.trim())
    .filter(Boolean)
}

function cleanupExpiredSessions() {
  const now = Date.now()
  for (const [token, session] of importSessions.entries()) {
    if (session.expiresAt <= now) {
      importSessions.delete(token)
    }
  }
}

function getWorkbook(fileBuffer: Buffer) {
  return XLSX.read(fileBuffer, { type: 'buffer' })
}

function getSheetRows(workbook: XLSX.WorkBook, sheetName: string) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return [] as Record<string, unknown>[]
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
}

function canonicalizeRow(raw: Record<string, unknown>, aliases: Record<string, string>) {
  const canonicalRow: Record<string, string> = {}
  Object.entries(raw).forEach(([header, value]) => {
    const canonical = aliases[normalizeHeader(header)]
    if (canonical) {
      canonicalRow[canonical] = toStringValue(value)
    }
  })
  return canonicalRow
}

function isRowEmpty(row: Record<string, string>) {
  return Object.values(row).every(v => !v)
}

function normalizeRowsFromWorkbook(workbook: XLSX.WorkBook, userId: string, filename: string) {
  const errors: ImportIssue[] = []
  const warnings: ImportIssue[] = []
  const categories = getCategoriesByUserId(userId)
  const versions = getVersionsByUserId(userId)
  const categoryMap = new Map(categories.map(category => [category.name.trim().toLowerCase(), category]))
  const versionMap = new Map(versions.map(version => [version.name.trim().toLowerCase(), version]))

  const lowerName = filename.toLowerCase()
  const isCsv = lowerName.endsWith('.csv')

  let tasksRaw: Record<string, unknown>[] = []
  let subtasksRaw: Record<string, unknown>[] = []

  if (isCsv) {
    const firstSheetName = workbook.SheetNames[0]
    if (!firstSheetName) {
      return { errors, warnings, normalizedRows: [] as NormalizedImportRow[] }
    }
    tasksRaw = getSheetRows(workbook, firstSheetName)
    warnings.push({ rowIndex: 1, field: 'file', reason: 'CSV 仅支持 tasks 主表，子任务不会被导入' })
  } else {
    const hasTasks = workbook.SheetNames.includes('tasks')
    const hasSubtasks = workbook.SheetNames.includes('subtasks')
    if (!hasTasks || !hasSubtasks) {
      errors.push({ rowIndex: 1, field: 'sheet', reason: 'xlsx/xls 文件必须包含 tasks 与 subtasks 两个工作表' })
      return { errors, warnings, normalizedRows: [] as NormalizedImportRow[] }
    }
    tasksRaw = getSheetRows(workbook, 'tasks')
    subtasksRaw = getSheetRows(workbook, 'subtasks')
  }

  const normalizedRows: NormalizedImportRow[] = []
  const taskTitleSet = new Set<string>()
  const subtaskMap = new Map<string, NormalizedSubTaskInput[]>()

  tasksRaw.forEach((rawRow, index) => {
    const rowIndex = index + 2
    const row = canonicalizeRow(rawRow, TASK_HEADER_ALIASES)

    if (isRowEmpty(row)) return

    if (row.subTasks) {
      errors.push({ rowIndex, field: 'subTasks', reason: '旧 subTasks 拼接格式已废弃，请使用 subtasks 工作表' })
    }

    const title = (row.title || '').trim()

    if ((row.taskRef || '').trim()) {
      warnings.push({
        rowIndex,
        field: 'taskRef',
        reason: '已忽略 taskRef/任务引用 列：子任务请通过「主任务标题」与 tasks 表关联'
      })
    }

    if (!title) {
      errors.push({ rowIndex, field: 'title', reason: '主任务标题不能为空' })
      return
    }

    if (taskTitleSet.has(title)) {
      errors.push({ rowIndex, field: 'title', reason: `主任务标题 "${title}" 在本文件中重复，子任务无法唯一定位` })
      return
    }
    taskTitleSet.add(title)

    const categoryName = (row.categoryName || '').trim()
    const versionName = (row.versionName || '').trim()
    const category = categoryName ? categoryMap.get(categoryName.toLowerCase()) : undefined
    let version = versionName ? versionMap.get(versionName.toLowerCase()) : undefined

    if (categoryName && !category) {
      warnings.push({ rowIndex, field: 'categoryName', reason: `分类 "${categoryName}" 不存在，已置空` })
    }
    if (versionName && !version) {
      const created = createVersion({
        name: versionName,
        description: '',
        releaseDate: new Date().toISOString().slice(0, 10),
        userId,
        createdAt: new Date().toISOString()
      })
      versionMap.set(created.name.trim().toLowerCase(), created)
      version = created
      warnings.push({
        rowIndex,
        field: 'versionName',
        reason: `版本 "${versionName}" 不存在，已自动创建并关联`
      })
    }

    normalizedRows.push({
      rowIndex,
      task: {
        title,
        description: row.description || '',
        categoryId: category?.id || null,
        versionId: version?.id || null,
        priority: normalizePriority(row.priority || '', rowIndex, warnings),
        dueDate: normalizeIsoDateTime(row.dueDate || '', rowIndex, 'dueDate', warnings),
        reminderTime: normalizeIsoDateTime(row.reminderTime || '', rowIndex, 'reminderTime', warnings),
        tags: normalizeTags(row.tags || ''),
        notes: row.notes || '',
        totalPomodoros: normalizePositiveInteger(row.totalPomodoros || '', rowIndex, warnings)
      },
      subTasks: []
    })
  })

  subtasksRaw.forEach((rawRow, index) => {
    const rowIndex = index + 2
    const row = canonicalizeRow(rawRow, SUBTASK_HEADER_ALIASES)

    if (isRowEmpty(row)) return

    const parentTitle = (row.parentTitle || '').trim()
    const title = (row.title || '').trim()

    if (!parentTitle) {
      errors.push({ rowIndex, field: 'subtasks.parentTitle', reason: '主任务标题不能为空（须与 tasks 表中某一行主任务标题完全一致）' })
      return
    }

    if (!taskTitleSet.has(parentTitle)) {
      errors.push({ rowIndex, field: 'subtasks.parentTitle', reason: `未找到主任务：${parentTitle}` })
      return
    }

    if (!title) {
      errors.push({ rowIndex, field: 'subtasks.title', reason: '子任务标题不能为空' })
      return
    }

    const list = subtaskMap.get(parentTitle) || []
    list.push({ title, description: row.description || '' })
    subtaskMap.set(parentTitle, list)
  })

  normalizedRows.forEach(row => {
    row.subTasks = subtaskMap.get(row.task.title) || []
  })

  return { errors, warnings, normalizedRows }
}

export function precheckTaskImportHandler(req: Request, res: Response) {
  try {
    cleanupExpiredSessions()

    const userId = (req as any).userId as string
    const file = (req as Request & { file?: Express.Multer.File }).file

    if (!file) {
      return fail(res, 400, 20012, '请上传 Excel/CSV 文件')
    }

    if (file.size > MAX_IMPORT_FILE_BYTES) {
      return fail(res, 400, 20014, '文件过大，最大支持 5MB')
    }

    const workbook = getWorkbook(file.buffer)
    const { errors, warnings, normalizedRows } = normalizeRowsFromWorkbook(workbook, userId, file.originalname)

    if (!normalizedRows.length && errors.length === 0) {
      return fail(res, 400, 20013, '导入文件为空或缺少数据行')
    }

    if (normalizedRows.length > MAX_IMPORT_ROWS) {
      return fail(res, 400, 20014, `单次最多导入 ${MAX_IMPORT_ROWS} 行任务`)
    }

    const canCommit = errors.length === 0
    let importToken: string | null = null
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex')

    if (canCommit) {
      importToken = crypto.randomUUID()
      importSessions.set(importToken, {
        userId,
        fileHash,
        rows: normalizedRows,
        expiresAt: Date.now() + IMPORT_TOKEN_TTL_MS
      })
    }

    return ok(res, {
      totalRows: normalizedRows.length,
      validRows: normalizedRows.length,
      errorRows: errors.length,
      warningRows: warnings.length,
      canCommit,
      importToken,
      fileHash,
      expiresAt: importToken ? new Date(Date.now() + IMPORT_TOKEN_TTL_MS).toISOString() : null,
      errors,
      warnings,
      normalizedRows: normalizedRows.map(row => ({
        rowIndex: row.rowIndex,
        mainTaskTitle: row.task.title,
        title: row.task.title,
        description: row.task.description,
        categoryId: row.task.categoryId,
        versionId: row.task.versionId,
        priority: row.task.priority,
        dueDate: row.task.dueDate,
        reminderTime: row.task.reminderTime,
        tags: row.task.tags,
        notes: row.task.notes,
        totalPomodoros: row.task.totalPomodoros,
        subTaskCount: row.subTasks.length
      }))
    }, canCommit ? '预检通过' : '预检完成，存在错误行')
  } catch (error) {
    return fail(res, 500, 20015, '预检失败，请检查文件格式')
  }
}

export function commitTaskImportHandler(req: Request, res: Response) {
  try {
    cleanupExpiredSessions()

    const userId = (req as any).userId as string
    const { importToken, fileHash } = req.body as { importToken?: string; fileHash?: string }

    if (!importToken || !fileHash) {
      return fail(res, 400, 20019, 'importToken 和 fileHash 为必填项')
    }

    const session = importSessions.get(importToken)
    if (!session) {
      return fail(res, 400, 20017, '导入令牌无效，请重新预检')
    }

    if (session.userId !== userId) {
      return fail(res, 403, 20018, '导入令牌不属于当前用户')
    }

    if (session.expiresAt <= Date.now()) {
      importSessions.delete(importToken)
      return fail(res, 400, 20018, '导入令牌已过期，请重新预检')
    }

    if (session.fileHash !== fileHash) {
      return fail(res, 400, 20018, '文件校验失败，请使用最新预检结果')
    }

    const createdTasks = []
    let createdSubtaskCount = 0
    let skippedRelationCount = 0
    const categories = getCategoriesByUserId(userId)
    const versions = getVersionsByUserId(userId)

    for (const row of session.rows) {
      if (!row.task.categoryId) skippedRelationCount += 1
      if (!row.task.versionId) skippedRelationCount += 1

      const task = createTask({
        title: row.task.title,
        description: row.task.description,
        categoryId: row.task.categoryId,
        versionId: row.task.versionId,
        priority: row.task.priority,
        dueDate: row.task.dueDate,
        reminderTime: row.task.reminderTime,
        tags: row.task.tags,
        notes: row.task.notes,
        totalPomodoros: row.task.totalPomodoros,
        completedPomodoros: 0,
        createdAt: new Date().toISOString(),
        isCompleted: false,
        userId
      })

      row.subTasks.forEach(subTask => {
        createSubTask({
          taskId: task.id,
          title: subTask.title,
          description: subTask.description,
          isCompleted: false
        })
        createdSubtaskCount += 1
      })

      const category = categories.find(item => item.id === task.categoryId)
      const version = versions.find(item => item.id === task.versionId)
      createdTasks.push({
        ...task,
        categoryName: category?.name || null,
        categoryColor: category?.color || null,
        versionName: version?.name || null
      })
    }

    importSessions.delete(importToken)

    return ok(res, {
      createdTaskCount: createdTasks.length,
      createdSubtaskCount,
      skippedRelationCount,
      createdTasks
    }, '导入成功')
  } catch (error) {
    return fail(res, 500, 20094, '导入失败')
  }
}

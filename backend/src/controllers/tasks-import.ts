import crypto from 'crypto'
import { Request, Response } from 'express'
import * as XLSX from 'xlsx'
import { createSubTask, createTask, getCategoriesByUserId, getVersionsByUserId } from '../database'
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

const HEADER_ALIASES: Record<string, string> = {
  title: 'title',
  '任务标题': 'title',
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

function normalizeSubTasks(value: string, rowIndex: number, warnings: ImportIssue[]) {
  if (!value) {
    return [] as NormalizedSubTaskInput[]
  }

  const pieces = value
    .split(/[\n|；;]+/)
    .map(piece => piece.trim())

  const normalized: NormalizedSubTaskInput[] = []
  pieces.forEach((piece, index) => {
    if (!piece) {
      warnings.push({
        rowIndex,
        field: 'subTasks',
        reason: `第 ${index + 1} 个子任务为空，已跳过`
      })
      return
    }

    const [titleRaw, ...descriptionParts] = piece.split('::')
    const title = titleRaw.trim()
    if (!title) {
      warnings.push({
        rowIndex,
        field: 'subTasks',
        reason: `第 ${index + 1} 个子任务标题为空，已跳过`
      })
      return
    }

    normalized.push({
      title,
      description: descriptionParts.join('::').trim()
    })
  })

  return normalized
}

function cleanupExpiredSessions() {
  const now = Date.now()
  for (const [token, session] of importSessions.entries()) {
    if (session.expiresAt <= now) {
      importSessions.delete(token)
    }
  }
}

function getRawRowsFromFile(fileBuffer: Buffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) {
    return [] as Record<string, unknown>[]
  }
  const sheet = workbook.Sheets[firstSheetName]
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: ''
  })
}

function normalizeRows(rawRows: Record<string, unknown>[], userId: string) {
  const errors: ImportIssue[] = []
  const warnings: ImportIssue[] = []
  const categories = getCategoriesByUserId(userId)
  const versions = getVersionsByUserId(userId)
  const categoryMap = new Map(categories.map(category => [category.name.trim().toLowerCase(), category]))
  const versionMap = new Map(versions.map(version => [version.name.trim().toLowerCase(), version]))
  const normalizedRows: NormalizedImportRow[] = []

  rawRows.forEach((rawRow, index) => {
    const rowIndex = index + 2
    const canonicalRow: Record<string, string> = {}

    Object.entries(rawRow).forEach(([header, value]) => {
      const normalizedHeader = normalizeHeader(header)
      const canonical = HEADER_ALIASES[normalizedHeader]
      if (canonical) {
        canonicalRow[canonical] = toStringValue(value)
      }
    })

    const title = (canonicalRow.title || '').trim()
    if (!title) {
      errors.push({
        rowIndex,
        field: 'title',
        reason: '任务标题不能为空'
      })
      return
    }

    const categoryName = (canonicalRow.categoryName || '').trim()
    const versionName = (canonicalRow.versionName || '').trim()
    const category = categoryName ? categoryMap.get(categoryName.toLowerCase()) : undefined
    const version = versionName ? versionMap.get(versionName.toLowerCase()) : undefined

    if (categoryName && !category) {
      warnings.push({
        rowIndex,
        field: 'categoryName',
        reason: `分类 "${categoryName}" 不存在，已置空`
      })
    }
    if (versionName && !version) {
      warnings.push({
        rowIndex,
        field: 'versionName',
        reason: `版本 "${versionName}" 不存在，已置空`
      })
    }

    normalizedRows.push({
      rowIndex,
      task: {
        title,
        description: canonicalRow.description || '',
        categoryId: category?.id || null,
        versionId: version?.id || null,
        priority: normalizePriority(canonicalRow.priority || '', rowIndex, warnings),
        dueDate: normalizeIsoDateTime(canonicalRow.dueDate || '', rowIndex, 'dueDate', warnings),
        reminderTime: normalizeIsoDateTime(canonicalRow.reminderTime || '', rowIndex, 'reminderTime', warnings),
        tags: normalizeTags(canonicalRow.tags || ''),
        notes: canonicalRow.notes || '',
        totalPomodoros: normalizePositiveInteger(canonicalRow.totalPomodoros || '', rowIndex, warnings)
      },
      subTasks: normalizeSubTasks(canonicalRow.subTasks || '', rowIndex, warnings)
    })
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

    const rows = getRawRowsFromFile(file.buffer)
    if (!rows.length) {
      return fail(res, 400, 20013, '导入文件为空或缺少数据行')
    }

    if (rows.length > MAX_IMPORT_ROWS) {
      return fail(res, 400, 20014, `单次最多导入 ${MAX_IMPORT_ROWS} 行任务`)
    }

    const { errors, warnings, normalizedRows } = normalizeRows(rows, userId)
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
      totalRows: rows.length,
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
        ...row.task,
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
      if (!row.task.categoryId) {
        skippedRelationCount += 1
      }
      if (!row.task.versionId) {
        skippedRelationCount += 1
      }

      const task = createTask({
        ...row.task,
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

/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path')
const ExcelJS = require('exceljs')

const TASK_HEADERS = [
  '主任务标题',
  '任务描述',
  '优先级',
  '截止时间',
  '提醒时间',
  '标签',
  '备注',
  '预估番茄钟',
  '分类',
  '版本'
]

const SUB_HEADERS = ['主任务标题', '子任务标题', '子任务描述']

const TASK_SAMPLE = [
  ['登录模块优化', '完成 OAuth 与错误码梳理', 'high', '', '', '后端,安全', '', 3, 'Work', 'Release-1.0'],
  ['报表导出', '支持 CSV 与 Excel', 'medium', '', '', '报表', '', 2, 'Work', 'Release-1.0']
]

const SUB_SAMPLE = [
  ['登录模块优化', '联调第三方登录', '与 IdP 回调地址对齐'],
  ['登录模块优化', '补充单元测试', '覆盖 token 刷新'],
  ['报表导出', '分页导出', '大数据量分批写入']
]

const LIST_FIRST_ROW = 2
const LIST_LAST_ROW = 101

async function buildWorkbook() {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'task-import-template'

  const tasks = wb.addWorksheet('tasks', { views: [{ state: 'frozen', ySplit: 1 }] })
  tasks.addRow(TASK_HEADERS)
  TASK_SAMPLE.forEach(r => tasks.addRow(r))

  const subtasks = wb.addWorksheet('subtasks', { views: [{ state: 'frozen', ySplit: 1 }] })
  subtasks.addRow(SUB_HEADERS)
  SUB_SAMPLE.forEach(r => subtasks.addRow(r))

  const listRange = `tasks!$A$${LIST_FIRST_ROW}:$A$${LIST_LAST_ROW}`
  subtasks.dataValidations.add(`A${LIST_FIRST_ROW}:A1048576`, {
    type: 'list',
    allowBlank: true,
    showDropDown: true,
    formulae: [listRange],
    showErrorMessage: true,
    errorStyle: 'warning',
    errorTitle: '主任务标题',
    error: '请从下拉列表中选择 tasks 表中已填写的主任务标题（可先填写 tasks 表再选）。'
  })

  tasks.getColumn(1).width = 22
  tasks.getColumn(2).width = 28
  subtasks.getColumn(1).width = 22
  subtasks.getColumn(2).width = 22
  subtasks.getColumn(3).width = 32

  return wb
}

async function main() {
  const wb = await buildWorkbook()
  const outDir = path.resolve(__dirname, '../../frontend/public')
  const dest = path.join(outDir, 'task-import-template.xlsx')
  try {
    await wb.xlsx.writeFile(dest)
    // eslint-disable-next-line no-console
    console.log('Wrote:', dest)
  } catch (err) {
    if (err && err.code === 'EBUSY') {
      // eslint-disable-next-line no-console
      console.warn('Skip (file locked):', dest)
    } else {
      throw err
    }
  }
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})

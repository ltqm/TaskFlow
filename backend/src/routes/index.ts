import { NextFunction, Request, Response, Router } from 'express'
import multer from 'multer'
import { getAllTasks, getTaskByIdHandler, createTaskHandler, updateTaskHandler, deleteTaskHandler } from '../controllers/tasks'
import { precheckTaskImportHandler, commitTaskImportHandler } from '../controllers/tasks-import'
import { getAllCategories, createCategoryHandler, updateCategoryHandler, deleteCategoryHandler } from '../controllers/categories'
import { getAllVersions, getVersionByIdHandler, createVersionHandler, updateVersionHandler, deleteVersionHandler } from '../controllers/versions'
import { register, login, getUser } from '../controllers/auth'
import { createSubTaskHandler, getSubTasksHandler, updateSubTaskHandler, deleteSubTaskHandler } from '../controllers/subtasks'
import { authenticateToken } from '../middleware/auth'
import { fail } from '../utils/response'

const router = Router()
const uploadImportFile = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})
const uploadImportFileMiddleware = (req: Request, res: Response, next: NextFunction) => {
  uploadImportFile.single('file')(req, res, error => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return fail(res, 400, 20014, '文件过大，最大支持 5MB')
    }
    if (error) {
      return fail(res, 400, 20015, '文件上传失败，请检查文件格式')
    }
    return next()
  })
}

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: 用户注册
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthPayload'
 *       400:
 *         description: 参数错误或用户已存在
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/auth/register', register)

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 用户登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthPayload'
 *       401:
 *         description: 邮箱或密码错误
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/auth/login', login)

/**
 * @openapi
 * /auth/user:
 *   get:
 *     tags: [Auth]
 *     summary: 获取当前用户信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 用户不存在
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/auth/user', authenticateToken, getUser)

/**
 * @openapi
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: 获取任务列表
 *     description: 不传 `page` 时返回当前用户全部任务（数组）；传入 `page` 时返回分页对象（items/total/page/pageSize/totalPages）。分页支持 query 参数 `search`、`categoryId`、`priority`（`high`/`medium`/`low`；不传或 `all` 表示不按优先级过滤）。
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *         description: 页码；传入则启用分页响应
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 12 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: 标题/描述模糊搜索（不区分大小写）
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [high, medium, low, all] }
 *     responses:
 *       200:
 *         description: 获取成功（data 为任务数组或分页对象）
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *   post:
 *     tags: [Tasks]
 *     summary: 创建任务
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreateRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Task'
 *       400:
 *         description: 参数错误
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/tasks', authenticateToken, getAllTasks)
router.post('/tasks', authenticateToken, createTaskHandler)

/**
 * @openapi
 * /tasks/import/precheck:
 *   post:
 *     tags: [Tasks]
 *     summary: 批量导入任务预检
 *     description: 上传 Excel（.xlsx/.xls）进行预检，不写入数据库。文件须包含 tasks + subtasks 两个工作表（子表「主任务标题」与主表主任务标题一致）。
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: .xlsx/.xls，最大 5MB，最多 100 行任务，须含 tasks 与 subtasks 工作表
 *     responses:
 *       200:
 *         description: 预检完成
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TaskImportPrecheckData'
 *       400:
 *         description: 文件缺失、文件过大、格式非法或超过行数限制
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/tasks/import/precheck', authenticateToken, uploadImportFileMiddleware, precheckTaskImportHandler)

/**
 * @openapi
 * /tasks/import/commit:
 *   post:
 *     tags: [Tasks]
 *     summary: 确认批量导入任务
 *     description: 使用预检返回的 importToken + fileHash 执行正式导入
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskImportCommitRequest'
 *     responses:
 *       200:
 *         description: 导入成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TaskImportCommitData'
 *       400:
 *         description: 参数缺失、令牌无效、令牌过期或校验失败
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/tasks/import/commit', authenticateToken, commitTaskImportHandler)

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: 获取任务详情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 任务不存在
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *   put:
 *     tags: [Tasks]
 *     summary: 更新任务
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 参数错误
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 任务不存在
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *   delete:
 *     tags: [Tasks]
 *     summary: 删除任务
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 任务不存在
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/tasks/:id', authenticateToken, getTaskByIdHandler)
router.put('/tasks/:id', authenticateToken, updateTaskHandler)
router.delete('/tasks/:id', authenticateToken, deleteTaskHandler)

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: 获取分类列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *   post:
 *     tags: [Categories]
 *     summary: 创建分类
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreateRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 参数错误或分类已存在
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/categories', authenticateToken, getAllCategories)
router.post('/categories', authenticateToken, createCategoryHandler)

/**
 * @openapi
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: 更新分类
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 没有可更新字段
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 分类不存在
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *   delete:
 *     tags: [Categories]
 *     summary: 删除分类
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 分类不存在
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/categories/:id', authenticateToken, updateCategoryHandler)
router.delete('/categories/:id', authenticateToken, deleteCategoryHandler)

/**
 * @openapi
 * /versions:
 *   get:
 *     tags: [Versions]
 *     summary: 获取版本列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *   post:
 *     tags: [Versions]
 *     summary: 创建版本
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VersionCreateRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 参数错误或版本重复
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/versions', authenticateToken, getAllVersions)
router.post('/versions', authenticateToken, createVersionHandler)

/**
 * @openapi
 * /versions/{id}:
 *   get:
 *     tags: [Versions]
 *     summary: 获取版本详情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 版本不存在
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *   put:
 *     tags: [Versions]
 *     summary: 更新版本
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               releaseDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 没有可更新字段
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 版本不存在
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *   delete:
 *     tags: [Versions]
 *     summary: 删除版本
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 版本不存在
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/versions/:id', authenticateToken, getVersionByIdHandler)
router.put('/versions/:id', authenticateToken, updateVersionHandler)
router.delete('/versions/:id', authenticateToken, deleteVersionHandler)

/**
 * @openapi
 * /subtasks:
 *   post:
 *     tags: [SubTasks]
 *     summary: 创建子任务
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubTaskCreateRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 参数错误
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/subtasks', authenticateToken, createSubTaskHandler)

/**
 * @openapi
 * /subtasks/{taskId}:
 *   get:
 *     tags: [SubTasks]
 *     summary: 获取任务的子任务列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/taskId'
 *     responses:
 *       200:
 *         description: 获取成功
 *       400:
 *         description: 任务ID不能为空
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/subtasks/:taskId', authenticateToken, getSubTasksHandler)

/**
 * @openapi
 * /subtasks/{id}:
 *   put:
 *     tags: [SubTasks]
 *     summary: 更新子任务
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               isCompleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 子任务不存在
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *   delete:
 *     tags: [SubTasks]
 *     summary: 删除子任务
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 子任务不存在
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/subtasks/:id', authenticateToken, updateSubTaskHandler)
router.delete('/subtasks/:id', authenticateToken, deleteSubTaskHandler)

export default router
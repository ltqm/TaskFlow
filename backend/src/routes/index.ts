import { Router } from 'express'
import { getAllTasks, getTaskByIdHandler, createTaskHandler, updateTaskHandler, deleteTaskHandler } from '../controllers/tasks'
import { getAllCategories, getCategoryByIdHandler, createCategoryHandler, updateCategoryHandler, deleteCategoryHandler } from '../controllers/categories'
import { getAllVersions, getVersionByIdHandler, createVersionHandler, updateVersionHandler, deleteVersionHandler, getTasksByVersion } from '../controllers/versions'
import { register, login, getUser } from '../controllers/auth'
import { createSubTaskHandler, getSubTasksHandler, getSubTaskHandler, updateSubTaskHandler, deleteSubTaskHandler } from '../controllers/subtasks'
import { authenticateToken } from '../middleware/auth'

const router = Router()

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
 *   get:
 *     tags: [Categories]
 *     summary: 获取分类详情
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
 *         description: 分类不存在
 *       500:
 *         $ref: '#/components/responses/InternalError'
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
router.get('/categories/:id', authenticateToken, getCategoryByIdHandler)
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
 * /versions/{id}/tasks:
 *   get:
 *     tags: [Versions]
 *     summary: 获取版本下任务列表
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
 */
router.get('/versions/:id/tasks', authenticateToken, getTasksByVersion)

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
 * /subtask/{id}:
 *   get:
 *     tags: [SubTasks]
 *     summary: 获取单个子任务
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
 *         description: 子任务不存在
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/subtask/:id', authenticateToken, getSubTaskHandler)

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
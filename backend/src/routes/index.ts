import { Router } from 'express'
import { getAllTasks, getTaskByIdHandler, createTaskHandler, updateTaskHandler, deleteTaskHandler } from '../controllers/tasks'
import { getAllCategories, getCategoryByIdHandler, createCategoryHandler, updateCategoryHandler, deleteCategoryHandler } from '../controllers/categories'
import { getAllVersions, getVersionByIdHandler, createVersionHandler, updateVersionHandler, deleteVersionHandler, getTasksByVersion } from '../controllers/versions'
import { register, login, getUser } from '../controllers/auth'
import { createSubTaskHandler, getSubTasksHandler, getSubTaskHandler, updateSubTaskHandler, deleteSubTaskHandler } from '../controllers/subtasks'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.post('/auth/register', register)
router.post('/auth/login', login)
router.get('/auth/user', authenticateToken, getUser)

router.get('/tasks', authenticateToken, getAllTasks)
router.get('/tasks/:id', authenticateToken, getTaskByIdHandler)
router.post('/tasks', authenticateToken, createTaskHandler)
router.put('/tasks/:id', authenticateToken, updateTaskHandler)
router.delete('/tasks/:id', authenticateToken, deleteTaskHandler)

router.get('/categories', authenticateToken, getAllCategories)
router.get('/categories/:id', authenticateToken, getCategoryByIdHandler)
router.post('/categories', authenticateToken, createCategoryHandler)
router.put('/categories/:id', authenticateToken, updateCategoryHandler)
router.delete('/categories/:id', authenticateToken, deleteCategoryHandler)

router.get('/versions', authenticateToken, getAllVersions)
router.get('/versions/:id', authenticateToken, getVersionByIdHandler)
router.get('/versions/:id/tasks', authenticateToken, getTasksByVersion)
router.post('/versions', authenticateToken, createVersionHandler)
router.put('/versions/:id', authenticateToken, updateVersionHandler)
router.delete('/versions/:id', authenticateToken, deleteVersionHandler)

router.get('/subtasks/:taskId', authenticateToken, getSubTasksHandler)
router.get('/subtask/:id', authenticateToken, getSubTaskHandler)
router.post('/subtasks', authenticateToken, createSubTaskHandler)
router.put('/subtasks/:id', authenticateToken, updateSubTaskHandler)
router.delete('/subtasks/:id', authenticateToken, deleteSubTaskHandler)

export default router
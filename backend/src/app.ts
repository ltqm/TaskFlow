import express from 'express'
import cors from 'cors'
import { NextFunction, Request, Response } from 'express'
import swaggerUi from 'swagger-ui-express'
import { initDatabase } from './database'
import router from './routes'
import { swaggerSpec } from './config/swagger'
import { fail, ok } from './utils/response'

export function createApp() {
  const app = express()
  initDatabase()

  app.use(cors())
  app.use(express.json())

  app.get('/docs.json', (req, res) => {
    res.json(swaggerSpec)
  })
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  app.use('/api', router)

  app.get('/', (req, res) => {
    ok(res, { service: 'Task Reminder API is running' })
  })

  app.use((req: Request, res: Response) => {
    fail(res, 404, 90004, '接口不存在')
  })

  app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', error)
    if (res.headersSent) {
      return next(error)
    }
    return fail(res, 500, 90000, '服务器内部错误')
  })

  return app
}
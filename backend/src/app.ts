import express from 'express'
import cors from 'cors'
import { initDatabase } from './database'
import router from './routes'

export function createApp() {
  const app = express()
  initDatabase()

  app.use(cors())
  app.use(express.json())

  app.use('/api', router)

  app.get('/', (req, res) => {
    res.json({ message: 'Task Reminder API is running' })
  })

  return app
}
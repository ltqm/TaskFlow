import dotenv from 'dotenv'
dotenv.config()

import { createApp } from './app'
import { disconnectDatabase } from './database'

const PORT = process.env.PORT || 3000

async function startServer() {
  const app = await createApp()

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })

  const shutdown = async () => {
    await new Promise<void>((resolve, reject) => {
      server.close(err => (err ? reject(err) : resolve()))
    })
    await disconnectDatabase()
  }

  process.once('SIGINT', () => {
    shutdown().then(() => process.exit(0)).catch(() => process.exit(1))
  })
  process.once('SIGTERM', () => {
    shutdown().then(() => process.exit(0)).catch(() => process.exit(1))
  })
}

startServer().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
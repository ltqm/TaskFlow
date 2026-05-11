import dotenv from 'dotenv'
dotenv.config()

import { createApp } from './app'

const PORT = process.env.PORT || 3000

async function startServer() {
  const app = await createApp()
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

startServer()
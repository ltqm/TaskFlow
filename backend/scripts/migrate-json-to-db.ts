/**
 * 一次性将 data/database.json 导入数据库（需已配置 DATABASE_URL 并已执行 prisma migrate deploy）。
 * 用法：npm run db:import-json
 * 默认路径：backend/data/database.json，可通过环境变量 JSON_IMPORT_PATH 覆盖。
 */
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { Prisma } from '@prisma/client'
import { prisma } from '../src/db/prisma'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

function tagsJson(tags: unknown): Prisma.InputJsonValue {
  if (Array.isArray(tags) && tags.every(t => typeof t === 'string')) {
    return tags as string[] as Prisma.InputJsonValue
  }
  return [] as Prisma.InputJsonValue
}

async function main() {
  const jsonPath =
    process.env.JSON_IMPORT_PATH || path.join(__dirname, '..', 'data', 'database.json')

  if (!fs.existsSync(jsonPath)) {
    console.error('找不到文件:', jsonPath)
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as {
    users?: Array<{
      id: string
      username: string
      email: string
      password: string
      createdAt: string
    }>
    categories?: Array<{
      id: string
      name: string
      color: string
      userId: string
      createdAt: string
    }>
    versions?: Array<{
      id: string
      name: string
      description: string
      releaseDate: string
      userId: string
      createdAt: string
    }>
    tasks?: Array<{
      id: string
      title: string
      description: string
      categoryId: string | null
      versionId: string | null
      priority: string
      dueDate: string | null
      reminderTime: string | null
      tags: string[]
      notes: string
      completedPomodoros: number
      totalPomodoros: number
      createdAt: string
      isCompleted: boolean
      userId: string
    }>
    subTasks?: Array<{
      id: string
      taskId: string
      title: string
      description: string
      isCompleted: boolean
      createdAt: string
      updatedAt: string
    }>
  }

  const users = raw.users ?? []
  const categories = raw.categories ?? []
  const versions = raw.versions ?? []
  const tasks = raw.tasks ?? []
  const subTasks = raw.subTasks ?? []

  await prisma.$transaction(async tx => {
    for (const u of users) {
      await tx.user.upsert({
        where: { id: u.id },
        create: {
          id: u.id,
          username: u.username,
          email: u.email,
          password: u.password,
          createdAt: new Date(u.createdAt)
        },
        update: {
          username: u.username,
          email: u.email,
          password: u.password,
          createdAt: new Date(u.createdAt)
        }
      })
    }

    for (const c of categories) {
      await tx.category.upsert({
        where: { id: c.id },
        create: {
          id: c.id,
          name: c.name,
          color: c.color,
          userId: c.userId,
          createdAt: new Date(c.createdAt)
        },
        update: {
          name: c.name,
          color: c.color,
          userId: c.userId,
          createdAt: new Date(c.createdAt)
        }
      })
    }

    for (const v of versions) {
      await tx.version.upsert({
        where: { id: v.id },
        create: {
          id: v.id,
          name: v.name,
          description: v.description,
          releaseDate: v.releaseDate,
          userId: v.userId,
          createdAt: new Date(v.createdAt)
        },
        update: {
          name: v.name,
          description: v.description,
          releaseDate: v.releaseDate,
          userId: v.userId,
          createdAt: new Date(v.createdAt)
        }
      })
    }

    for (const t of tasks) {
      await tx.task.upsert({
        where: { id: t.id },
        create: {
          id: t.id,
          title: t.title,
          description: t.description,
          categoryId: t.categoryId,
          versionId: t.versionId,
          priority: t.priority,
          dueDate: t.dueDate,
          reminderTime: t.reminderTime,
          tags: tagsJson(t.tags),
          notes: t.notes,
          completedPomodoros: t.completedPomodoros,
          totalPomodoros: t.totalPomodoros,
          createdAt: new Date(t.createdAt),
          isCompleted: t.isCompleted,
          userId: t.userId
        },
        update: {
          title: t.title,
          description: t.description,
          categoryId: t.categoryId,
          versionId: t.versionId,
          priority: t.priority,
          dueDate: t.dueDate,
          reminderTime: t.reminderTime,
          tags: tagsJson(t.tags),
          notes: t.notes,
          completedPomodoros: t.completedPomodoros,
          totalPomodoros: t.totalPomodoros,
          createdAt: new Date(t.createdAt),
          isCompleted: t.isCompleted,
          userId: t.userId
        }
      })
    }

    for (const st of subTasks) {
      await tx.subTask.upsert({
        where: { id: st.id },
        create: {
          id: st.id,
          taskId: st.taskId,
          title: st.title,
          description: st.description,
          isCompleted: st.isCompleted,
          createdAt: new Date(st.createdAt),
          updatedAt: new Date(st.updatedAt)
        },
        update: {
          taskId: st.taskId,
          title: st.title,
          description: st.description,
          isCompleted: st.isCompleted,
          createdAt: new Date(st.createdAt),
          updatedAt: new Date(st.updatedAt)
        }
      })
    }
  })

  console.log(
    `导入完成：users=${users.length} categories=${categories.length} versions=${versions.length} tasks=${tasks.length} sub_tasks=${subTasks.length}`
  )
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

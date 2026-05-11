import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { createUser, getUserByEmail, getUserByUsername, getUserById } from '../database'

export function register(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: '缺少必要字段' })
    }

    if (getUserByEmail(email)) {
      return res.status(400).json({ error: '用户已存在' })
    }

    if (getUserByUsername(username)) {
      return res.status(400).json({ error: '用户名已被使用' })
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const user = createUser({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    })

    const initialCategories = [
      { name: '工作', color: '#3B82F6' },
      { name: '学习', color: '#10B981' },
      { name: '生活', color: '#F59E0B' }
    ]

    initialCategories.forEach(cat => {
      const { createCategory } = require('../database')
      createCategory({
        name: cat.name,
        color: cat.color,
        userId: user.id,
        createdAt: new Date().toISOString()
      })
    })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret')
    res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email } })
  } catch (error) {
    res.status(500).json({ error: '注册失败' })
  }
}

export function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: '缺少必要字段' })
    }

    const user = getUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' })
    }

    const isValid = bcrypt.compareSync(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret')
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
  } catch (error) {
    res.status(500).json({ error: '登录失败' })
  }
}

export function getUser(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const user = getUserById(userId)
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json({ id: user.id, username: user.username, email: user.email, createdAt: user.createdAt })
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' })
  }
}
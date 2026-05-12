import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { createUser, getUserByEmail, getUserByUsername, getUserById } from '../database'
import { fail, ok } from '../utils/response'

export function register(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return fail(res, 400, 10011, '缺少必要字段')
    }

    if (getUserByEmail(email)) {
      return fail(res, 400, 10012, '用户已存在')
    }

    if (getUserByUsername(username)) {
      return fail(res, 400, 10013, '用户名已被使用')
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
    return res.status(201).json({
      code: 0,
      data: { token, user: { id: user.id, username: user.username, email: user.email } },
      msg: ''
    })
  } catch (error) {
    return fail(res, 500, 10099, '注册失败')
  }
}

export function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return fail(res, 400, 10021, '缺少必要字段')
    }

    const user = getUserByEmail(email)
    if (!user) {
      return fail(res, 401, 10022, '邮箱或密码错误')
    }

    const isValid = bcrypt.compareSync(password, user.password)
    if (!isValid) {
      return fail(res, 401, 10022, '邮箱或密码错误')
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret')
    return ok(res, { token, user: { id: user.id, username: user.username, email: user.email } })
  } catch (error) {
    return fail(res, 500, 10098, '登录失败')
  }
}

export function getUser(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const user = getUserById(userId)
    
    if (!user) {
      return fail(res, 404, 10031, '用户不存在')
    }

    return ok(res, { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt })
  } catch (error) {
    return fail(res, 500, 10097, '获取用户信息失败')
  }
}
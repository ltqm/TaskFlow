import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { fail } from '../utils/response'

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return fail(res, 401, 10001, '未授权')
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) {
      return fail(res, 403, 10002, '无效的token')
    }
    (req as any).userId = (user as any).userId
    next()
  })
}
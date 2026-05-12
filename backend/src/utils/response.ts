import { Response } from 'express'

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg: string
}

export function ok<T>(res: Response, data: T, msg = '') {
  return res.json({
    code: 0,
    data,
    msg
  } satisfies ApiResponse<T>)
}

export function fail(res: Response, httpStatus: number, code: number, msg: string, data: unknown = null) {
  return res.status(httpStatus).json({
    code,
    data,
    msg
  } satisfies ApiResponse)
}

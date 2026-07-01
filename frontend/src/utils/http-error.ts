/** 将登录、导入等请求错误转成对用户可读的中文说明 */
export function formatApiError(err: unknown): string {
  const e = err as {
    message?: string
    code?: string
    response?: { data?: { msg?: string } }
  }
  const code = e?.code
  const msg = (e?.message || '').toLowerCase()
  if (code === 'ERR_NETWORK' || msg.includes('network error') || msg.includes('failed to fetch')) {
    return '无法连接服务器，请确认后端已启动且地址配置正确'
  }
  if (e?.response?.data?.msg && typeof e.response.data.msg === 'string') {
    return e.response.data.msg
  }
  if (e?.message && typeof e.message === 'string') {
    return e.message
  }
  return '操作失败，请重试'
}

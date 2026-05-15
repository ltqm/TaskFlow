/**
 * 轻量健康检查：需后端已启动（默认 http://localhost:8089）。
 * 用法: npm run smoke
 * 覆盖地址: SMOKE_BASE_URL=http://127.0.0.1:3000 npm run smoke
 */
const base = (process.env.SMOKE_BASE_URL || 'http://localhost:8089').replace(/\/$/, '')

async function check(name, url, options = {}) {
  const { expectEnvelope = true } = options
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`${name}: 非 JSON 响应 (${res.status})`)
  }
  if (expectEnvelope) {
    if (json.code !== 0) {
      throw new Error(`${name}: 业务码 ${json.code} — ${json.msg || ''}`)
    }
  } else if (!res.ok) {
    throw new Error(`${name}: HTTP ${res.status}`)
  }
  return json
}

async function main() {
  console.log(`Smoke: GET ${base}/`)
  await check('根路径', `${base}/`)
  console.log(`Smoke: GET ${base}/docs.json`)
  const spec = await check('OpenAPI', `${base}/docs.json`, { expectEnvelope: false })
  if (!spec.openapi && !spec.swagger) {
    throw new Error('OpenAPI: 缺少 openapi/swagger 字段')
  }
  console.log('Smoke: 全部通过')
}

main().catch(err => {
  console.error('Smoke 失败:', err.message || err)
  process.exit(1)
})

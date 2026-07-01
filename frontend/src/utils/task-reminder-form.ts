/** 后端 ISO 提醒时间 → `<input type="datetime-local">` 用的本地字符串 */
export function reminderIsoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso || !String(iso).trim()) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${mo}-${day}T${h}:${mi}`
}

/** `datetime-local` 取值 → 提交给后端的 ISO；空字符串返回 null */
export function datetimeLocalToIsoOrNull(local: string | null | undefined): string | null {
  if (local == null || !String(local).trim()) return null
  const d = new Date(local)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

/** Kiểm HTTP Basic Auth. File này chỉ dùng API chuẩn của Node để dùng được ở proxy. */
import { createHash, timingSafeEqual } from 'node:crypto'

const sha256 = (value: string) => createHash('sha256').update(value, 'utf8').digest()

/** Giải base64 sang chuỗi UTF-8; null khi base64 hỏng. */
function decode(b64: string): string | null {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64)) return null
  return Buffer.from(b64, 'base64').toString('utf8')
}

/**
 * Header `Authorization` có khớp `expected` (dạng user:password) không. Không ném lỗi.
 * So hai bản băm SHA-256 bằng timingSafeEqual để độ dài khác nhau không lộ qua thời gian.
 */
export function checkBasicAuth(header: string | null, expected: string): boolean {
  if (!header || !expected) return false
  const match = /^Basic +(\S*)$/i.exec(header.trim())
  if (!match) return false
  const decoded = decode(match[1])
  if (decoded === null) return false
  return timingSafeEqual(sha256(decoded), sha256(expected))
}

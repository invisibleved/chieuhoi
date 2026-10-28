import { draftMode, headers } from 'next/headers'

import { hasAdminSession } from './session'
import type { Mode } from './types'

/**
 * Draft Mode chỉ có giá trị khi request còn phiên admin: cookie __prerender_bypass dùng chung cả bản build,
 * không gắn với người dùng. Chỉ đọc headers() khi Draft Mode bật, để trang tĩnh vẫn tĩnh lúc build.
 */
export async function isAdminPreview(): Promise<boolean> {
  if (!(await draftMode()).isEnabled) return false
  return hasAdminSession(await headers())
}

/**
 * Chế độ hiển thị: Draft Mode + phiên admin là preview. PREVIEW_ALL chỉ có tác dụng ở staging, hoặc ở development
 * khi chạy `next dev` (NODE_ENV khác production): `next start` với APP_ENV=development không được mở nội dung chưa duyệt.
 */
export async function getMode(): Promise<Mode> {
  if (await isAdminPreview()) return 'preview'
  const appEnv = process.env.APP_ENV
  const allowed = appEnv === 'staging' || (appEnv === 'development' && process.env.NODE_ENV !== 'production')
  if (allowed && process.env.PREVIEW_ALL === 'true') return 'preview'
  return 'public'
}

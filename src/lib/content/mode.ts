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

/** Chế độ hiển thị: Draft Mode + phiên admin là preview; PREVIEW_ALL chỉ có tác dụng khi APP_ENV là development hoặc staging. */
export async function getMode(): Promise<Mode> {
  if (await isAdminPreview()) return 'preview'
  if ((process.env.APP_ENV === 'development' || process.env.APP_ENV === 'staging') &&
    process.env.PREVIEW_ALL === 'true') return 'preview'
  return 'public'
}

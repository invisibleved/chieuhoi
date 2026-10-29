import { draftMode, headers } from 'next/headers'

import { isPreviewAll } from '@/lib/env'

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

/** Chế độ hiển thị: Draft Mode + phiên admin là preview, hoặc PREVIEW_ALL ở môi trường cho phép (xem isPreviewAll). */
export async function getMode(): Promise<Mode> {
  if (await isAdminPreview()) return 'preview'
  return isPreviewAll(process.env) ? 'preview' : 'public'
}

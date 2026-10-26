import { draftMode } from 'next/headers'

import type { Mode } from './types'

/** Chế độ hiển thị: draft mode luôn là preview; PREVIEW_ALL chỉ có tác dụng khi APP_ENV là development hoặc staging. */
export async function getMode(): Promise<Mode> {
  if ((await draftMode()).isEnabled) return 'preview'
  if ((process.env.APP_ENV === 'development' || process.env.APP_ENV === 'staging') &&
    process.env.PREVIEW_ALL === 'true') return 'preview'
  return 'public'
}

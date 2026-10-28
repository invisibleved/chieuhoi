import { draftMode } from 'next/headers'
import type { Payload } from 'payload'

import { PREVIEW_EXIT_ROUTE } from '@/lib/routes'

import { previewCopy } from './copy/preview'
import type { PreviewBarView } from './types'

/** Ai đang đăng nhập admin (biên tập viên hoặc người duyệt) thì được bật xem trước. */
export function createPreview(payload: Payload) {
  return {
    async canPreview(headers: Headers): Promise<boolean> {
      try {
        const { user } = await payload.auth({ headers })
        return Boolean(user)
      } catch {
        return false
      }
    },
  }
}

/** Chỉ có giá trị khi Draft Mode bật; không phụ thuộc PREVIEW_ALL. */
export async function getPreviewBar(): Promise<PreviewBarView | null> {
  if (!(await draftMode()).isEnabled) return null
  return { label: previewCopy.label, exitLabel: previewCopy.exit, exitRoute: PREVIEW_EXIT_ROUTE }
}

import { PREVIEW_EXIT_ROUTE } from '@/lib/routes'

import { previewCopy } from './copy/preview'
import { isAdminPreview } from './mode'
import type { PreviewBarView } from './types'

/** Chỉ có giá trị khi Draft Mode bật và còn phiên admin; không phụ thuộc PREVIEW_ALL. */
export async function getPreviewBar(): Promise<PreviewBarView | null> {
  if (!(await isAdminPreview())) return null
  return { label: previewCopy.label, exitLabel: previewCopy.exit, exitRoute: PREVIEW_EXIT_ROUTE }
}

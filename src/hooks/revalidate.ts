import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

export type Revalidator = (path: string, type: 'layout') => void

/**
 * Làm mới toàn bộ trang công khai. Không bao giờ làm hỏng thao tác lưu:
 * ngoài request Next (seed, payload run, vitest) revalidatePath ném lỗi, ta nuốt và ghi debug.
 */
export function revalidateSite(req: PayloadRequest, revalidate: Revalidator = revalidatePath): void {
  if (req.context?.disableRevalidate === true) return
  try {
    revalidate('/', 'layout')
  } catch (err) {
    req.payload.logger.debug(`Bỏ qua revalidate: ${err instanceof Error ? err.message : String(err)}`)
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  revalidateSite(req)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidateSite(req)
  return doc
}

export const revalidateGlobalAfterChange: GlobalAfterChangeHook = ({ doc, req }) => {
  revalidateSite(req)
  return doc
}

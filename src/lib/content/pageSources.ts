// Hàm thuần chọn nguồn mà một trang trích, dùng chung cho /lang-hoi và /nghe-det-chieu.
import { formatDate } from './queries'
import type { SourceView } from './types'

/** Chỉ các nguồn trang trích, theo thứ tự đánh số (R9); nguồn đã bị ẩn (không có trong `all`) thì bỏ. */
export function pageSourcesInOrder(all: SourceView[], order: readonly string[]): SourceView[] {
  const byId = new Map(all.map((s) => [s.id, s]))
  return order
    .map((id) => byId.get(id))
    .filter((s): s is SourceView => s !== undefined)
    .map((s) => ({ ...s, date: formatDate(s.date) }))
}

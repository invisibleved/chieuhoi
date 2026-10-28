import type { ArchiveItemView } from './types'

// Tìm tư liệu theo mã `?anh=`: lấy giá trị đầu nếu là mảng, so không phân biệt hoa thường.
// Chỉ khớp trong `items` (view model đã lọc quyền), nên mã của ảnh bị ẩn không bao giờ khớp.
export function findArchiveItem(items: ArchiveItemView[], code: string | string[] | undefined | null): ArchiveItemView | null {
  const first = Array.isArray(code) ? code[0] : code
  if (!first) return null
  const wanted = first.toLowerCase()
  return items.find((i) => i.code.toLowerCase() === wanted) ?? null
}

import type { Flag } from '@/lib/content'

// Nhãn trên thẻ sản phẩm: chưa có ảnh, hoặc có ảnh mà chưa xác nhận loại.
export function productTag(p: {
  image: unknown | null
  typeConfirmed: boolean
}): { text: 'Ảnh cần xác nhận loại' | 'Chưa có ảnh'; style: 'filled' | 'dashed' } | null {
  if (!p.image) return { text: 'Chưa có ảnh', style: 'dashed' }
  if (!p.typeConfirmed) return { text: 'Ảnh cần xác nhận loại', style: 'filled' }
  return null
}

// Nhãn phụ chỉ dùng ở bản preview; public không có flag nên mảng rỗng.
export function previewNotes(flags: Flag[]): string[] {
  const notes: string[] = []
  if (flags.includes('rights-not-permitted')) notes.push('Ảnh chưa được phép đăng')
  if (flags.includes('unverified')) notes.push('[cần xác minh]')
  return notes
}

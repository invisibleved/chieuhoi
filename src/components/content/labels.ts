import type { Flag } from '@/lib/content'

// Nhãn phụ chỉ dùng ở bản preview; public không có flag nên mảng rỗng.
export function previewNotes(flags: Flag[]): string[] {
  const notes: string[] = []
  if (flags.includes('rights-not-permitted')) notes.push('Ảnh chưa được phép đăng')
  if (flags.includes('unverified')) notes.push('[cần xác minh]')
  return notes
}

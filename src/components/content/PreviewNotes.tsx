import type { Flag } from '@/lib/content'
import { previewNotes } from './labels'
import { Tag } from './Tag'

// Ghi chú phụ chỉ có ở bản preview; public không có flag nên không render gì.
export function PreviewNotes({ flags }: { flags: Flag[] }) {
  const notes = previewNotes(flags)
  if (notes.length === 0) return null
  return (
    <span className="flex flex-wrap gap-2">
      {notes.map((n) => (
        <Tag key={n} variant="dashed">{n}</Tag>
      ))}
    </span>
  )
}

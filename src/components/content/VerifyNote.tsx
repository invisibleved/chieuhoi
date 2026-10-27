import type { ReactNode } from 'react'
import { Eyebrow } from '@/components/ui/Eyebrow'

type VerifyNoteProps = {
  children: ReactNode
  size?: 'md' | 'sm'
  /** Có tiêu đề: khung nhiều dòng (danh sách việc cần thẩm định), tiêu đề là eyebrow viết hoa. */
  title?: string
}

// Khung ghi chú cần xác minh (viền đứt); chữ do nơi gọi truyền vào.
export function VerifyNote({ children, size = 'md', title }: VerifyNoteProps) {
  if (title) {
    return (
      <aside className="flex flex-col gap-2 border border-dashed border-border-dashed p-[18px] md:gap-2.5 md:px-6 md:py-[22px]">
        <Eyebrow as="p" tone="muted" tracking="label">{title}</Eyebrow>
        <div className="text-[14px] leading-[1.6] text-text-primary md:text-[15px] md:leading-[1.7]">{children}</div>
      </aside>
    )
  }
  const sizing = size === 'sm' ? 'px-3.5 py-3 text-[13px] leading-[1.55]' : 'px-[18px] py-3.5 text-[14px] leading-[1.6]'
  return <p className={`border border-dashed border-border-dashed text-text-secondary ${sizing}`}>{children}</p>
}

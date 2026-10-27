import type { ReactNode } from 'react'

type StageHintProps = {
  children: ReactNode
  /** Vị trí trên sân khấu; mặc định góc trên trái. */
  className?: string
  as?: 'span' | 'figcaption'
}

// Nhãn tối góc trên trái sân khấu ảnh, kèm ô caro. Chỉ hiện từ md.
export function StageHint({ children, className = 'left-4 top-4', as: Tag = 'span' }: StageHintProps) {
  return (
    <Tag className={`absolute hidden items-center gap-2.5 bg-surface-ink-on-image px-3.5 py-2.5 text-[13px] text-bg-primary md:flex ${className}`}>
      <span aria-hidden="true" className="check size-2.5" />
      {children}
    </Tag>
  )
}

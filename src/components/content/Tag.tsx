import type { ReactNode } from 'react'

type TagProps = { variant: 'dashed' | 'filled' | 'overlay'; children: ReactNode }

// Nhãn nhỏ: viền đứt, nền đặc, hoặc phủ trên ảnh (kèm chấm đứt).
export function Tag({ variant, children }: TagProps) {
  if (variant === 'overlay') {
    return (
      <span className="inline-flex items-center gap-2 bg-surface-on-image px-2.5 py-[5px] text-[12px] font-semibold text-text-secondary">
        <span aria-hidden="true" className="size-2 rounded-full border-[1.5px] border-dashed border-text-secondary" />
        {children}
      </span>
    )
  }
  const look = variant === 'filled' ? 'bg-bg-secondary' : 'border border-dashed border-text-muted'
  return <span className={`inline-block px-2 py-[3px] text-[12px] text-text-secondary ${look}`}>{children}</span>
}

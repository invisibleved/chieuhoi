import type { ReactNode } from 'react'
import { StatusDot } from '@/components/ui/StatusDot'

type TagProps = {
  variant: 'dashed' | 'filled' | 'overlay'
  /** Chỉ cho overlay. md: đệm rộng, có chấm; sm: đệm gọn, không chấm (mobile); fluid: gọn ở mobile, rộng từ md. */
  size?: 'md' | 'sm' | 'fluid'
  children: ReactNode
}

const overlaySizes = {
  md: { pad: 'px-2.5 py-[5px]', dot: true, dotClass: '' },
  sm: { pad: 'px-[7px] py-[3px]', dot: false, dotClass: '' },
  fluid: { pad: 'px-[7px] py-[3px] md:px-2.5 md:py-[5px]', dot: true, dotClass: 'max-md:hidden' },
} as const

// Nhãn nhỏ: viền đứt, nền đặc, hoặc phủ trên ảnh (kèm chấm đứt).
export function Tag({ variant, size = 'md', children }: TagProps) {
  if (variant === 'overlay') {
    const o = overlaySizes[size]
    return (
      <span className={`inline-flex items-center gap-2 bg-surface-on-image text-[12px] font-semibold text-text-secondary ${o.pad}`}>
        {o.dot ? (
          <span className={`inline-flex ${o.dotClass}`}>
            <StatusDot state="none" size={8} />
          </span>
        ) : null}
        {children}
      </span>
    )
  }
  const look = variant === 'filled' ? 'bg-bg-secondary' : 'border border-dashed border-text-muted'
  return <span className={`inline-block px-2 py-[3px] text-[12px] text-text-secondary ${look}`}>{children}</span>
}

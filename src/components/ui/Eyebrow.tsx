import type { ReactNode } from 'react'

type EyebrowProps = {
  children: ReactNode
  tone?: 'light' | 'dark'
  /** Thêm vạch ngang 48×1px (32px trên mobile) trước chữ. */
  rule?: boolean
  as?: 'p' | 'span'
  id?: string
  className?: string
}

const tones = { light: 'text-accent', dark: 'text-accent-on-dark' } as const

// Nhãn nhỏ viết hoa phía trên tiêu đề: 12px, đậm, giãn chữ .22em (mobile) / .24em (từ md).
export function Eyebrow({ children, tone = 'light', rule = false, as: Tag = 'span', id, className }: EyebrowProps) {
  const cls = [
    'text-eyebrow font-semibold tracking-eyebrow-sm md:tracking-eyebrow',
    tones[tone],
    rule ? 'flex items-center gap-3 md:gap-4' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <Tag id={id} className={cls}>
      {rule ? <span aria-hidden="true" className="h-px w-8 bg-current md:w-12" /> : null}
      {children}
    </Tag>
  )
}

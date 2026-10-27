import type { ReactNode } from 'react'

type EyebrowProps = {
  children: ReactNode
  /** light/dark: nhấn đỏ điều / vàng; muted, muted-alt: chữ phụ trên nền sáng / nền cói đậm. */
  tone?: 'light' | 'dark' | 'muted' | 'muted-alt'
  /** Thêm vạch ngang 48×1px (32px trên mobile) trước chữ. */
  rule?: boolean
  /** eyebrow: .22em mobile, .24em từ md (đầu section). label: .2em cố định (nhãn trong khối). */
  tracking?: 'eyebrow' | 'label'
  as?: 'p' | 'span' | 'dt'
  id?: string
  className?: string
}

const tones = {
  light: 'text-accent',
  dark: 'text-accent-on-dark',
  muted: 'text-text-muted',
  'muted-alt': 'text-text-muted-alt',
} as const

const trackings = { eyebrow: 'tracking-eyebrow-sm md:tracking-eyebrow', label: 'tracking-label' } as const

// Nhãn nhỏ viết hoa: 12px, đậm, giãn chữ. Dùng cho eyebrow đầu section và nhãn trong khối.
export function Eyebrow({ children, tone = 'light', rule = false, tracking = 'eyebrow', as: Tag = 'span', id, className }: EyebrowProps) {
  const cls = [
    'text-eyebrow font-semibold',
    trackings[tracking],
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

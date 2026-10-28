import type { ReactNode } from 'react'
import { Eyebrow } from './Eyebrow'

type CalloutProps = {
  title: string
  children: ReactNode
  className?: string
  /** light: nền cói đậm, viền trái đỏ điều. outline: khung viền mảnh (VỀ DANH MỤC). dark: nền xanh làng, eyebrow vàng (khung "Nguyên tắc chân dung"). */
  tone?: 'light' | 'dark' | 'outline'
  /** aria-label của vùng, khi tiêu đề viết hoa không đọc tự nhiên. */
  label?: string
}

const tones = {
  light: { box: 'gap-2.5 border-l-[3px] border-accent bg-bg-secondary p-5 md:p-6', eyebrow: 'muted-alt' },
  outline: { box: 'gap-2.5 border border-border-subtle p-6', eyebrow: 'muted' },
  dark: { box: 'gap-3.5 bg-bg-inverse p-5 text-text-on-dark md:p-7', eyebrow: 'dark' },
} as const

// Khối chú ý có tiêu đề eyebrow.
export function Callout({ title, children, className, tone = 'light', label }: CalloutProps) {
  const dark = tone === 'dark'
  return (
    <aside aria-label={label} className={['flex flex-col', tones[tone].box, className].filter(Boolean).join(' ')}>
      <Eyebrow as="p" tone={tones[tone].eyebrow} tracking="label">{title}</Eyebrow>
      <div className={dark ? 'text-[15px] leading-[1.65]' : 'text-[15px] leading-[1.6] text-text-secondary'}>{children}</div>
    </aside>
  )
}

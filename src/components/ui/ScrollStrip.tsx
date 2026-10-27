import type { ReactNode } from 'react'

type ScrollStripProps = {
  children: ReactNode
  /** Có nhãn thì dải được đọc như một nhóm có tên. */
  label?: string
  as?: 'div' | 'ol'
  /** Dải không có phần tử tương tác bên trong: cho focus bằng bàn phím để cuộn được (axe: scrollable-region-focusable). */
  focusable?: boolean
  className?: string
}

// Dải vuốt ngang trên mobile, tràn ra lề trang (-mx-5), ẩn thanh cuộn. Bố cục từ md do nơi gọi đặt qua className (kể cả khoảng cách gap).
export function ScrollStrip({ children, label, as: Tag = 'div', focusable = false, className }: ScrollStripProps) {
  const cls = [
    '-mx-5 flex snap-x overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <Tag className={cls} {...(label ? { role: 'group', 'aria-label': label } : {})} {...(focusable ? { tabIndex: 0 } : {})}>
      {children}
    </Tag>
  )
}

/**
 * Cuộn ngang chính dải chứa `item` để item nằm giữa dải. Chỉ cuộn dải, không cuộn trang
 * (scrollIntoView làm trang nhảy dọc). Giảm chuyển động thì cuộn ngay.
 */
export function centreInStrip(item: HTMLElement | null | undefined) {
  const strip = item?.parentElement
  if (!item || !strip || typeof strip.scrollTo !== 'function') return
  const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const s = strip.getBoundingClientRect()
  const r = item.getBoundingClientRect()
  const left = strip.scrollLeft + (r.left - s.left) - (strip.clientWidth - r.width) / 2
  strip.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' })
}

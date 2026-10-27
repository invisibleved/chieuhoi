import type { ReactNode } from 'react'

type ScrollStripProps = {
  children: ReactNode
  /** Có nhãn thì dải được đọc như một nhóm có tên. */
  label?: string
  as?: 'div' | 'ol'
  className?: string
}

// Dải vuốt ngang trên mobile, tràn ra lề trang (-mx-5), ẩn thanh cuộn. Bố cục từ md do nơi gọi đặt qua className (kể cả khoảng cách gap).
export function ScrollStrip({ children, label, as: Tag = 'div', className }: ScrollStripProps) {
  const cls = [
    '-mx-5 flex snap-x overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <Tag className={cls} {...(label ? { role: 'group', 'aria-label': label } : {})}>
      {children}
    </Tag>
  )
}

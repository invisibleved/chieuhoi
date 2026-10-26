import type { ReactNode } from 'react'

// Khung ghi chú cần xác minh; chữ do nơi gọi truyền vào.
export function VerifyNote({ children, size = 'md' }: { children: ReactNode; size?: 'md' | 'sm' }) {
  const sizing = size === 'sm' ? 'px-3.5 py-3 text-[13px] leading-[1.55]' : 'px-[18px] py-3.5 text-[14px] leading-[1.6]'
  return <p className={`border border-dashed border-border-dashed text-text-secondary ${sizing}`}>{children}</p>
}

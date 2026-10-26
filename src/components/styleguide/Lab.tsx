import type { ReactNode } from 'react'

// Nhãn trạng thái mẫu (MẶC ĐỊNH, HOVER...) và dòng token, theo artboard.
export function Lab({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <span className={`text-[12px] font-semibold tracking-[.16em] ${tone === 'dark' ? 'text-text-on-dark-muted' : 'text-text-muted'}`}>
      {children}
    </span>
  )
}

export function Tok({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <span className={`font-mono text-[12px] ${tone === 'dark' ? 'text-text-on-dark-muted' : 'text-text-secondary'}`}>{children}</span>
  )
}

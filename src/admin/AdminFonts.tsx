import { Be_Vietnam_Pro, Noto_Serif_Display } from 'next/font/google'
import type { ReactNode } from 'react'

const body = Be_Vietnam_Pro({
  display: 'swap',
  subsets: ['vietnamese', 'latin'],
  variable: '--admin-font-body',
  weight: ['400', '500', '600'],
})

const display = Noto_Serif_Display({
  display: 'swap',
  subsets: ['vietnamese', 'latin'],
  variable: '--admin-font-display',
  weight: '400',
})

/** Nạp font cho admin; `display: contents` để không đổi bố cục của Payload. */
export function AdminFonts({ children }: { children?: ReactNode }) {
  return (
    <div className={`ch-admin-fonts ${body.variable} ${display.variable}`} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}

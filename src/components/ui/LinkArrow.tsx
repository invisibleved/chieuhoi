import Link from 'next/link'
import type { ReactNode } from 'react'

type LinkArrowProps = {
  href: string
  tone?: 'light' | 'dark'
  className?: string
  children: ReactNode
}

const tones = {
  light:
    'text-accent hover:text-accent-hover hover:underline hover:decoration-2 hover:underline-offset-4',
  dark: 'text-accent-on-dark hover:underline hover:decoration-2 hover:underline-offset-4',
} as const

export function LinkArrow({ href, tone = 'light', className, children }: LinkArrowProps) {
  const cls = [
    'inline-flex min-h-11 items-center text-[15px] font-medium transition-colors duration-[var(--dur-micro)] ease-[var(--ease-weave)]',
    tones[tone],
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <Link href={href} className={cls}>
      {children} →
    </Link>
  )
}

import Link from 'next/link'
import type { ReactNode } from 'react'

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline-dark'
  href?: string
  /** Chỉ cho outline-dark: md 48/22 (màn hình thành công), lg 52/28 (khối kêu gọi). Nút chính luôn 52/28. */
  size?: 'md' | 'lg'
  icon?: 'play'
  iconSize?: number
  disabled?: boolean
  type?: 'button' | 'submit'
  onClick?: () => void
  className?: string
  children: ReactNode
}

const base =
  'inline-flex items-center no-underline transition-colors duration-[var(--dur-micro)] ease-[var(--ease-weave)]'

const variants = {
  // Nút chính: nền accent, hover/nhấn đậm dần. Vô hiệu dùng màu artboard (không có token).
  primary:
    'min-h-[52px] px-7 bg-accent text-on-accent text-[15px] font-medium hover:bg-accent-hover active:bg-accent-press disabled:bg-[#D9CDB8] disabled:text-[#3E3B35] disabled:cursor-not-allowed',
  secondary: 'min-h-11 gap-3 text-[15px] font-medium text-text-primary',
  'outline-dark':
    'border border-text-on-dark text-text-on-dark text-[15px] hover:bg-text-on-dark/10',
} as const

const outlineSizes = { md: 'min-h-12 px-[22px]', lg: 'min-h-[52px] px-7 font-medium' } as const

// Biểu tượng phát: vòng tròn 36px + tam giác, nét 1.2 (nguyên từ artboard).
function PlayIcon({ size }: { size: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="18" cy="18" r="17" />
      <path d="M15 12.5v11l8.5-5.5z" />
    </svg>
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  icon,
  iconSize = 36,
  disabled,
  type = 'button',
  onClick,
  className,
  children,
}: ButtonProps) {
  const cls = [base, variants[variant], variant === 'outline-dark' && outlineSizes[size], className].filter(Boolean).join(' ')
  const content = (
    <>
      {icon === 'play' ? <PlayIcon size={iconSize} /> : null}
      {children}
    </>
  )
  if (href !== undefined) {
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {content}
      </Link>
    )
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls}>
      {content}
    </button>
  )
}

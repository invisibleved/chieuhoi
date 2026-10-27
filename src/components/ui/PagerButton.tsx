'use client'

type PagerButtonProps = {
  direction: 'prev' | 'next'
  label: string
  onClick: () => void
  /** Đã ở đầu/cuối: nút giữ focus (aria-disabled) nhưng không chạy onClick. */
  atEnd: boolean
  variant?: 'outline' | 'solid'
  iconOnly?: boolean
  tone?: 'dark'
}

const variants = {
  light: {
    outline: 'border-border-strong text-text-primary',
    solid: 'border-text-primary bg-text-primary text-bg-primary',
  },
  dark: {
    outline: 'border-border-on-dark-strong text-text-on-dark',
    solid: 'border-bg-primary bg-bg-primary text-bg-inverse',
  },
} as const

// Nút Trước / Tiếp. Dùng aria-disabled thay vì disabled để focus không mất khi chạm đầu cuối.
export function PagerButton({ direction, label, onClick, atEnd, variant = 'outline', iconOnly = false, tone }: PagerButtonProps) {
  const prev = direction === 'prev'
  const icon = (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d={prev ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'} />
    </svg>
  )
  const cls = [
    'inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-2 border text-[15px]',
    iconOnly ? 'size-12' : 'px-5',
    variants[tone === 'dark' ? 'dark' : 'light'][variant],
    atEnd ? 'cursor-default opacity-40' : null,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button
      type="button"
      aria-label={iconOnly ? label : undefined}
      aria-disabled={atEnd ? 'true' : undefined}
      onClick={() => {
        if (!atEnd) onClick()
      }}
      className={cls}
    >
      {prev ? icon : null}
      {iconOnly ? null : label}
      {prev ? null : icon}
    </button>
  )
}

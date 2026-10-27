import type { ComponentProps } from 'react'

type PillButtonProps = {
  active: boolean
  tone?: 'light' | 'dark'
} & Omit<ComponentProps<'button'>, 'type' | 'className'>

const tones = {
  light: { on: 'bg-text-primary font-semibold text-bg-primary', off: 'border border-border-strong text-text-primary' },
  dark: { on: 'bg-bg-primary font-semibold text-bg-inverse', off: 'border border-border-on-dark-strong text-text-on-dark' },
} as const

// Nút chọn dạng viên trong dải cuộn (chọn công đoạn). ref và aria-current truyền qua props như nút thường.
export function PillButton({ active, tone = 'light', children, ...rest }: PillButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex min-h-11 shrink-0 snap-start cursor-pointer items-center px-4 text-[14px] whitespace-nowrap ${
        active ? tones[tone].on : tones[tone].off
      }`}
    >
      {children}
    </button>
  )
}

import type { ComponentProps } from 'react'

type PillButtonProps = {
  active: boolean
  tone?: 'light' | 'dark'
  /** Chiếm đều chiều ngang, cao 48 (nhóm Segmented trên mobile). */
  stretch?: boolean
} & Omit<ComponentProps<'button'>, 'type' | 'className'>

const tones = {
  light: { on: 'bg-text-primary font-semibold text-bg-primary', off: 'border border-border-strong text-text-primary' },
  dark: { on: 'bg-bg-primary font-semibold text-bg-inverse', off: 'border border-border-on-dark-strong text-text-on-dark' },
} as const

// Nút chọn dạng viên trong dải cuộn (chọn công đoạn). snap-center để khớp với việc cuộn nút đang chọn vào giữa dải.
// ref và aria-current truyền qua props như nút thường.
export function PillButton({ active, tone = 'light', stretch = false, children, ...rest }: PillButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex cursor-pointer items-center text-[14px] whitespace-nowrap ${
        stretch ? 'min-h-12 flex-1 justify-center px-2 font-medium' : 'min-h-11 shrink-0 snap-center px-4'
      } ${
        active ? tones[tone].on : tones[tone].off
      }`}
    >
      {children}
    </button>
  )
}

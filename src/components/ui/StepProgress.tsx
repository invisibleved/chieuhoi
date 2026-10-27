type StepProgressProps = {
  /** Chỉ số từ 0. */
  index: number
  total: number
  /** Tên cho thanh tiến trình (aria-label). */
  label: string
  /** Chữ đầu dòng, ví dụ "Công đoạn". */
  unit: string
  tone?: 'dark' | 'light'
  className?: string
}

const pad = (n: number) => String(n).padStart(2, '0')

const tones = {
  dark: { text: 'text-text-on-dark-muted', strong: 'text-text-on-dark', track: 'bg-track-on-dark', fill: 'bg-accent-on-dark' },
  light: { text: 'text-text-muted', strong: 'text-text-primary', track: 'bg-border-soft', fill: 'bg-accent' },
} as const

// Bộ đếm "Công đoạn 04 / 06" kèm thanh tiến trình.
export function StepProgress({ index, total, label, unit, tone = 'dark', className }: StepProgressProps) {
  const t = tones[tone]
  return (
    <div className={['flex flex-col gap-2', className].filter(Boolean).join(' ')}>
      <div className={`flex justify-between text-small ${t.text}`}>
        <span>{unit}</span>
        <span>
          <strong className={`font-semibold ${t.strong}`}>{pad(index + 1)}</strong> / {pad(total)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        className={`h-[3px] ${t.track}`}
      >
        <div className={`h-full ${t.fill}`} style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
    </div>
  )
}

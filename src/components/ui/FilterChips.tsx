'use client'

// Nhóm chip lọc: nút bật/tắt dùng aria-pressed. Mobile: dải vuốt ngang, không làm trang cuộn ngang.
type FilterChipsProps<K extends string> = {
  label: string
  options: { key: K; label: string }[]
  value: K
  onChange: (k: K) => void
  tone?: 'light' | 'dark'
}

const chipBase =
  'inline-flex min-h-11 shrink-0 cursor-pointer items-center px-[18px] text-[14px] transition-colors duration-[var(--dur-micro)] ease-[var(--ease-weave)]'

const tones = {
  light: {
    on: 'bg-text-primary text-bg-primary border border-text-primary font-semibold',
    off: 'border border-[rgba(40,39,36,.35)] hover:border-text-primary',
  },
  dark: {
    on: 'bg-bg-primary text-bg-deep font-semibold border border-bg-primary',
    off: 'border border-[rgba(243,235,221,.4)] text-text-on-dark hover:border-text-on-dark',
  },
}

export function FilterChips<K extends string>({
  label,
  options,
  value,
  onChange,
  tone = 'light',
}: FilterChipsProps<K>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex max-w-full flex-nowrap gap-2 overflow-x-auto md:flex-wrap md:overflow-x-visible"
    >
      {options.map((o) => {
        const on = o.key === value
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.key)}
            className={`${chipBase} ${on ? tones[tone].on : tones[tone].off}`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

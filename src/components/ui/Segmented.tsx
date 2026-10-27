import { PillButton } from './PillButton'

type SegmentedProps<K extends string> = {
  label: string
  options: { key: K; label: string }[]
  value: K
  onChange: (k: K) => void
  tone?: 'light' | 'dark'
  /** Mỗi nút chiếm đều chiều ngang, cao 48 (mobile). */
  stretch?: boolean
}

// Nhóm nút chọn một: aria-pressed trong role="group". Dùng lại kiểu PillButton.
export function Segmented<K extends string>({ label, options, value, onChange, tone = 'light', stretch = false }: SegmentedProps<K>) {
  return (
    <div role="group" aria-label={label} className={stretch ? 'flex w-full' : 'flex flex-wrap'}>
      {options.map((o) => (
        <PillButton key={o.key} active={o.key === value} tone={tone} stretch={stretch} aria-pressed={o.key === value} onClick={() => onChange(o.key)}>
          {o.label}
        </PillButton>
      ))}
    </div>
  )
}

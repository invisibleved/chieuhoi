import type { Confidence } from '@/lib/content'

type Labels = Record<Confidence, string | null>

const SIZES = {
  sm: { base: 'size-3', oral: 'size-2.5', active: 'size-3', activeOral: 'size-2.5' },
  md: { base: 'size-3.5', oral: 'size-3', active: 'size-[22px]', activeOral: 'size-[18px]' },
} as const

// Điểm mốc: hình dạng (tròn đặc / thoi viền / tròn nét đứt) cho biết mức tin cậy, không chỉ màu.
export function ConfidenceMark({ level, active = false, size = 'md' }: { level: Confidence; active?: boolean; size?: 'sm' | 'md' }) {
  const s = SIZES[size]
  const dims = level === 'oral' ? (active ? s.activeOral : s.oral) : active ? s.active : s.base
  const shape =
    level === 'press'
      ? 'rounded-full bg-accent-on-dark'
      : level === 'oral'
        ? 'rotate-45 border-2 border-solid border-accent-on-dark bg-bg-inverse'
        : 'rounded-full border-2 border-dashed border-text-on-dark-muted bg-bg-inverse'
  // Vòng ngoài 6px là đường viền đặc (outline), không phải bóng đổ.
  const ring = active ? 'outline outline-[6px] outline-track-on-dark' : ''
  return <span aria-hidden="true" data-confidence={level} className={`box-border block shrink-0 ${dims} ${shape} ${ring}`} />
}

const BADGE = {
  press: 'bg-accent-on-dark px-3 py-1.5 text-bg-ink',
  oral: 'border border-solid border-accent-on-dark px-[11px] py-[5px] text-accent-on-dark',
  pending: 'border border-dashed border-text-on-dark-muted px-[11px] py-[5px] text-text-on-dark-muted',
} as const

export function ConfidenceBadge({ level, labels }: { level: Confidence; labels: Labels }) {
  return <span className={`inline-block self-start text-[13px] font-semibold ${BADGE[level]}`}>{labels[level]}</span>
}

const LEVELS: Confidence[] = ['press', 'oral', 'pending']

// Chú giải trên nền tối: mỗi mục là mark kèm nhãn.
export function ConfidenceLegend({ label, labels, className }: { label: string | null; labels: Labels; className?: string }) {
  return (
    <ul
      aria-label={label ?? undefined}
      className={`m-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0 text-[13px] text-text-on-dark-muted md:gap-x-6 md:text-small ${className ?? ''}`}
    >
      {LEVELS.map((level) => (
        <li key={level} className="flex items-center gap-2">
          <ConfidenceMark level={level} size="sm" />
          {labels[level]}
        </li>
      ))}
    </ul>
  )
}

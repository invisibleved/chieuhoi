import type { ReactNode } from 'react'

/** "TƯ LIỆU · 021": nhãn lấy từ copy; thiếu nhãn hoặc mã thì null. */
export function docCode(label: string | null | undefined, code: string | null | undefined): string | null {
  return label && code ? `${label} · ${code}` : null
}

type DocumentLabelProps = {
  /** Nhãn trước mã (copy, ví dụ "TƯ LIỆU"). */
  label: string | null
  code?: string | null
  /** Dòng chính dưới mã; rỗng thì bỏ. */
  title?: ReactNode
  meta?: string | null
  /** card: thẻ viền nền nổi; overlay: nhãn nền cói phủ trên ảnh (khoảng cách do nơi gọi đặt qua className). */
  variant?: 'card' | 'overlay'
  /** md: tiêu đề serif 16px; sm: 13px. */
  size?: 'md' | 'sm'
  className?: string
}

const variants = {
  card: 'border border-border-subtle bg-bg-raised px-4 py-3.5',
  overlay: 'flex flex-col bg-bg-primary text-text-primary',
} as const

// Khối nhãn tư liệu (desktop): dòng mã "TƯ LIỆU · n", tiêu đề, dòng chú thích. className thêm vào cuối.
export function DocumentLabel({ label, code, title, meta, variant = 'card', size = 'md', className }: DocumentLabelProps) {
  const head = docCode(label, code)
  const cls = [variants[variant], className].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      {head ? <span className="block text-[12px] font-semibold tracking-label text-text-muted">{head}</span> : null}
      {title ? <span className={`block ${size === 'sm' ? 'text-[13px] leading-[1.45]' : 'font-serif text-[16px] leading-[1.35]'}`}>{title}</span> : null}
      {meta ? <span className="block text-[13px] leading-[1.45] text-text-secondary">{meta}</span> : null}
    </div>
  )
}

type DocumentLineProps = {
  /** Nhãn trước mã (copy, ví dụ "TL"). */
  label: string | null
  code?: string | null
  caption?: string | null
  /** light: chữ phụ trên nền sáng; dark: trên nền xanh làng. */
  tone?: 'light' | 'dark'
  as?: 'p' | 'figcaption'
  className?: string
}

const lineTones = {
  light: 'tracking-[.1em] text-text-muted',
  dark: 'tracking-[.14em] text-text-on-dark-muted',
} as const

// Dòng nhãn tư liệu trên mobile: "TL · n · chú thích". Không còn chữ nào thì không render.
export function DocumentLine({ label, code, caption, tone = 'light', as: Tag = 'p', className }: DocumentLineProps) {
  const text = [docCode(label, code), caption].filter(Boolean).join(' · ')
  if (!text) return null
  return <Tag className={['m-0 text-[12px]', lineTones[tone], className].filter(Boolean).join(' ')}>{text}</Tag>
}

type ArchiveChipProps = {
  /** Nhãn trước mã (copy, ví dụ "TL"). */
  label: string
  code: string
  category?: string | null
  /** Chip phủ trên ảnh: nền tối trong suốt, nhỏ hơn; chủ đề chỉ hiện từ md. */
  overlay?: boolean
  className?: string
}

// Chip lưu trữ: TL · mã · CHỦ ĐỀ (in hoa bằng CSS).
export function ArchiveChip({ label, code, category, overlay = false, className }: ArchiveChipProps) {
  const cls = [
    'inline-block text-[12px] text-text-on-dark',
    overlay ? 'bg-surface-deep-on-image px-2.5 py-1.5 tracking-[.1em] md:tracking-[.12em]' : 'bg-bg-deep px-3 py-2.5 tracking-[.12em]',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={cls}>
      {docCode(label, code)}
      {category ? <span className={overlay ? 'max-md:hidden' : undefined}>{' · '}<span className="uppercase">{category}</span></span> : null}
    </span>
  )
}

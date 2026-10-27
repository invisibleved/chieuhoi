import { Eyebrow } from './Eyebrow'

type PlaceholderFrameProps = {
  label: string
  title?: string
  description?: string
  /** Thêm vào đoạn mô tả (ví dụ ẩn trên mobile). */
  descriptionClassName?: string
  tone?: 'light' | 'dark'
  /** weave: nền sợi cói với nhãn nổi ở giữa (ô ảnh sản phẩm), thay cho khung nét đứt. */
  pattern?: 'dashed' | 'weave'
  className?: string
  role?: string
  'aria-label'?: string
}

const tones = {
  light: { frame: 'border-border-dashed', label: 'muted', title: 'text-text-primary', desc: 'text-text-secondary' },
  dark: { frame: 'border-border-on-dark-dashed', label: 'dark', title: 'text-text-on-dark', desc: 'text-text-on-dark-muted' },
} as const

// Khung nét đứt giữ chỗ cho nội dung chưa có (ảnh cần chụp, tư liệu chờ). Các khối chữ căn giữa.
export function PlaceholderFrame({ label, title, description, descriptionClassName, tone = 'light', pattern = 'dashed', className, role, 'aria-label': ariaLabel }: PlaceholderFrameProps) {
  const t = tones[tone]
  if (pattern === 'weave') {
    return (
      <div role={role} aria-label={ariaLabel} className={['weave flex items-center justify-center p-6 text-center', className].filter(Boolean).join(' ')}>
        <span className="bg-bg-primary px-3.5 py-2.5 text-[13px] leading-[1.5]">
          <strong className="font-semibold tracking-[.1em]">{label}</strong>
          {description ? (
            <>
              <br />
              {description}
            </>
          ) : null}
        </span>
      </div>
    )
  }
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={[
        'flex flex-col items-center justify-center gap-2.5 border border-dashed p-6 text-center',
        t.frame,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Eyebrow as="p" tone={t.label} tracking="label">{label}</Eyebrow>
      {title ? <p className={`font-display text-[21px] leading-[1.3] md:text-[28px] ${t.title}`}>{title}</p> : null}
      {description ? <p className={`max-w-[440px] text-[14px] leading-[1.55] ${t.desc} ${descriptionClassName ?? ''}`}>{description}</p> : null}
    </div>
  )
}

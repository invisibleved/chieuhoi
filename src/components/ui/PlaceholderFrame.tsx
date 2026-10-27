type PlaceholderFrameProps = {
  label: string
  title?: string
  description?: string
  tone?: 'light' | 'dark'
  className?: string
  role?: string
  'aria-label'?: string
}

const tones = {
  light: { frame: 'border-border-dashed', label: 'text-text-muted', title: 'text-text-primary', desc: 'text-text-secondary' },
  dark: { frame: 'border-border-on-dark-dashed', label: 'text-accent-on-dark', title: 'text-text-on-dark', desc: 'text-text-on-dark-muted' },
} as const

// Khung nét đứt giữ chỗ cho nội dung chưa có (ảnh cần chụp, tư liệu chờ). Các khối chữ căn giữa.
export function PlaceholderFrame({ label, title, description, tone = 'light', className, role, 'aria-label': ariaLabel }: PlaceholderFrameProps) {
  const t = tones[tone]
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
      <p className={`text-eyebrow font-semibold tracking-[.2em] ${t.label}`}>{label}</p>
      {title ? <p className={`font-display text-[21px] leading-[1.3] md:text-[28px] ${t.title}`}>{title}</p> : null}
      {description ? <p className={`max-w-[440px] text-[14px] leading-[1.55] ${t.desc}`}>{description}</p> : null}
    </div>
  )
}

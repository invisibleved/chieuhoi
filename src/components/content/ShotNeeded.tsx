type ShotNeededProps = { description?: string; tone?: 'light' | 'dark'; className?: string }

// Khung giữ chỗ cho ảnh chưa chụp. light: ô ảnh sản phẩm; dark: sân khấu công đoạn.
export function ShotNeeded({ description, tone = 'light', className = '' }: ShotNeededProps) {
  const label = description ? `Ảnh cần chụp: ${description}` : 'Ảnh cần chụp'
  if (tone === 'dark') {
    return (
      <div
        role="img"
        aria-label={label}
        className={`border border-dashed border-[rgba(243,235,221,.45)] p-6 ${className}`}
      >
        <div className="text-[12px] font-semibold tracking-[.1em] text-accent-on-dark">ẢNH CẦN CHỤP</div>
        {description && <p className="mt-2 max-w-[440px] font-display text-[28px] leading-[1.3]">{description}</p>}
      </div>
    )
  }
  return (
    <div
      role="img"
      aria-label={label}
      className={`weave flex items-center justify-center p-6 text-center ${className}`}
    >
      <span className="bg-bg-primary px-3.5 py-2.5 text-[13px] leading-[1.5]">
        <strong className="font-semibold tracking-[.1em]">ẢNH CẦN CHỤP</strong>
        {description && (
          <>
            <br />
            {description}
          </>
        )}
      </span>
    </div>
  )
}

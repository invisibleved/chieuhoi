import { PlaceholderFrame } from '@/components/ui/PlaceholderFrame'

type ShotNeededProps = { description?: string; tone?: 'light' | 'dark'; className?: string }

// Khung giữ chỗ cho ảnh chưa chụp. light: ô ảnh sản phẩm; dark: sân khấu công đoạn.
export function ShotNeeded({ description, tone = 'light', className = '' }: ShotNeededProps) {
  const label = description ? `Ảnh cần chụp: ${description}` : 'Ảnh cần chụp'
  if (tone === 'dark') {
    return <PlaceholderFrame role="img" aria-label={label} label="ẢNH CẦN CHỤP" title={description} tone="dark" className={className} />
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

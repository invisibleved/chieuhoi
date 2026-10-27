import { PlaceholderFrame } from '@/components/ui/PlaceholderFrame'

type ShotNeededProps = { description?: string; tone?: 'light' | 'dark'; className?: string }

// Khung giữ chỗ cho ảnh chưa chụp. light: ô ảnh sản phẩm (nền sợi cói); dark: sân khấu công đoạn (nét đứt).
export function ShotNeeded({ description, tone = 'light', className }: ShotNeededProps) {
  const ariaLabel = description ? `Ảnh cần chụp: ${description}` : 'Ảnh cần chụp'
  if (tone === 'dark') {
    return <PlaceholderFrame role="img" aria-label={ariaLabel} label="ẢNH CẦN CHỤP" title={description} tone="dark" className={className} />
  }
  return <PlaceholderFrame role="img" aria-label={ariaLabel} label="ẢNH CẦN CHỤP" description={description} pattern="weave" className={className} />
}

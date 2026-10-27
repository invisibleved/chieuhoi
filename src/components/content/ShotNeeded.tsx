import type { Variant } from '@/lib/content'
import { PlaceholderFrame } from '@/components/ui/PlaceholderFrame'

type ShotNeededProps = {
  /** Chữ thường, hoặc Variant desktop/mobile (hai khung, mỗi khung chỉ hiện ở khổ của nó). */
  description?: string | Variant
  tone?: 'light' | 'dark'
  className?: string
}

function Frame({ description, tone, className }: { description?: string; tone: 'light' | 'dark'; className?: string }) {
  const ariaLabel = description ? `Ảnh cần chụp: ${description}` : 'Ảnh cần chụp'
  if (tone === 'dark') {
    return <PlaceholderFrame role="img" aria-label={ariaLabel} label="ẢNH CẦN CHỤP" title={description} tone="dark" className={className} />
  }
  return <PlaceholderFrame role="img" aria-label={ariaLabel} label="ẢNH CẦN CHỤP" description={description} pattern="weave" className={className} />
}

// Khung giữ chỗ cho ảnh chưa chụp. light: ô ảnh sản phẩm (nền sợi cói); dark: sân khấu công đoạn (nét đứt).
export function ShotNeeded({ description, tone = 'light', className }: ShotNeededProps) {
  if (typeof description !== 'object' || description === null) return <Frame description={description} tone={tone} className={className} />
  const { desktop, mobile } = description
  if (desktop === mobile || !mobile || !desktop) return <Frame description={desktop ?? mobile ?? undefined} tone={tone} className={className} />
  const cls = (v: string) => [v, className].filter(Boolean).join(' ')
  return (
    <>
      <Frame description={desktop} tone={tone} className={cls('max-md:hidden')} />
      <Frame description={mobile} tone={tone} className={cls('md:hidden')} />
    </>
  )
}

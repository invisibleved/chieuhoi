import type { ImageView, Variant } from '@/lib/content'
import { hasVariant, VariantText } from '@/components/ui/VariantText'
import { ContentImage } from './ContentImage'
import { ShotNeeded } from './ShotNeeded'

type FigureCardProps = {
  /** Nhãn trên tiêu đề, chỉ hiện từ md (ví dụ "DỤNG CỤ · 01"). */
  label: string
  title: string
  caption: Variant
  image: ImageView | null
  /** Chiều cao ảnh; mặc định 200px mobile, 320px desktop. */
  imageClassName?: string
}

// Thẻ hình + tiêu đề + chú thích. Mobile: thẻ 240px trong dải vuốt; desktop: một ô của lưới. Chưa có ảnh: khung "ẢNH CẦN CHỤP".
export function FigureCard({ label, title, caption, image, imageClassName = 'h-[200px] md:h-[320px]' }: FigureCardProps) {
  return (
    <figure className="m-0 flex shrink-0 flex-[0_0_240px] flex-col gap-2 md:flex-auto md:gap-3.5">
      {image ? (
        <ContentImage image={image} size="card" sizes="(min-width: 768px) 30vw, 240px" className={`block ${imageClassName}`} />
      ) : (
        <ShotNeeded className={imageClassName} />
      )}
      <span className="text-[12px] font-semibold tracking-label text-text-muted max-md:hidden">{label}</span>
      <span className="font-display text-[21px] leading-[1.25] md:text-[28px]">{title}</span>
      {hasVariant(caption) ? (
        <figcaption className="text-[13px] text-text-muted md:text-[15px] md:leading-[1.6] md:text-text-secondary">
          <VariantText value={caption} />
        </figcaption>
      ) : null}
    </figure>
  )
}

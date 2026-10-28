import Link from 'next/link'
import type { ProductCardView, Variant } from '@/lib/content'
import { ContentImage } from './ContentImage'
import { ShotNeeded } from './ShotNeeded'
import { PreviewNotes } from './PreviewNotes'
import { Tag } from './Tag'

type ProductCardProps = {
  product: ProductCardView
  href: string
  /** Chữ khung "Ảnh cần chụp" (đã điền tên), hai bản desktop/mobile. */
  shotNeeded?: Variant | null
  /** Hiện tóm tắt dưới tên, chỉ từ md. */
  showSummary?: boolean
}

const frame = 'h-[220px] md:h-[340px]'

// Thẻ sản phẩm. Chưa có ảnh: khung "ẢNH CẦN CHỤP" giữ nguyên chiều cao.
export function ProductCard({ product, href, shotNeeded, showSummary = false }: ProductCardProps) {
  const { tag } = product
  return (
    <Link href={href} className="group flex flex-col gap-3 text-text-primary no-underline">
      {product.image ? (
        <ContentImage image={product.image} size="card" sizes="(min-width: 1024px) 25vw, 50vw" className={`block ${frame} transition-opacity duration-[var(--dur-micro)] group-hover:opacity-[.88]`} />
      ) : (
        <ShotNeeded description={product.name && shotNeeded ? shotNeeded : undefined} className={frame} />
      )}
      <span className="flex items-center justify-between gap-2 border-t border-border-strong pt-1">
        <span className="text-[12px] font-semibold tracking-label text-text-muted-alt">{product.code}</span>
        {tag && <Tag variant={tag.style}>{tag.text}</Tag>}
      </span>
      {product.name && (
        <span className="font-display text-[26px] leading-[1.2] transition-colors duration-[var(--dur-micro)] ease-[var(--ease-weave)] group-hover:text-accent md:text-[32px]">{product.name}</span>
      )}
      {showSummary && product.summary ? (
        <span className="text-[15px] leading-[1.6] text-text-secondary max-md:hidden">{product.summary}</span>
      ) : null}
      <PreviewNotes flags={product.flags} />
    </Link>
  )
}

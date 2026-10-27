import Link from 'next/link'
import type { ProductCardView } from '@/lib/content'
import { ContentImage } from './ContentImage'
import { ShotNeeded } from './ShotNeeded'
import { PreviewNotes } from './PreviewNotes'
import { Tag } from './Tag'

type ProductCardProps = { product: ProductCardView; href: string }

// Thẻ sản phẩm. Chưa có ảnh: khung "ẢNH CẦN CHỤP" giữ nguyên chiều cao.
export function ProductCard({ product, href }: ProductCardProps) {
  const { tag } = product
  return (
    <Link href={href} className="group flex flex-col gap-3 text-text-primary no-underline">
      {product.image ? (
        <ContentImage image={product.image} size="card" sizes="(min-width: 1024px) 25vw, 50vw" className="block h-[340px] transition-opacity duration-[var(--dur-micro)] group-hover:opacity-[.88]" />
      ) : (
        <ShotNeeded
          description={product.name ? `${product.name} chụp phẳng, ánh sáng tự nhiên, kèm cận cảnh mặt dệt` : undefined}
          className="h-[340px]"
        />
      )}
      <span className="flex items-center justify-between gap-2 border-t border-border-strong pt-1">
        <span className="text-[12px] font-semibold tracking-label text-text-muted-alt">{product.code}</span>
        {tag && <Tag variant={tag.style}>{tag.text}</Tag>}
      </span>
      {product.name && (
        <span className="font-display text-[24px] leading-[1.2] transition-colors duration-[var(--dur-micro)] ease-[var(--ease-weave)] group-hover:text-accent">{product.name}</span>
      )}
      <PreviewNotes flags={product.flags} />
    </Link>
  )
}

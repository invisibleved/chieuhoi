import Link from 'next/link'
import type { ProductCardView } from '@/lib/content'
import { ContentImage } from './ContentImage'
import { previewNotes, productTag } from './labels'
import { ShotNeeded } from './ShotNeeded'
import { Tag } from './Tag'

type ProductCardProps = { product: ProductCardView; href: string }

// Thẻ sản phẩm. Chưa có ảnh: khung "ẢNH CẦN CHỤP" giữ nguyên chiều cao.
export function ProductCard({ product, href }: ProductCardProps) {
  const tag = productTag(product)
  const notes = previewNotes(product.flags)
  return (
    <Link href={href} className="group flex flex-col gap-3 text-text-primary no-underline">
      {product.image ? (
        <ContentImage image={product.image} size="card" sizes="(min-width: 1024px) 25vw, 50vw" className="block h-[340px] transition-opacity duration-[var(--dur-micro)] group-hover:opacity-[.88]" />
      ) : (
        <ShotNeeded
          description={`${product.name ?? 'Sản phẩm'} chụp phẳng, ánh sáng tự nhiên, kèm cận cảnh mặt dệt`}
          className="h-[340px]"
        />
      )}
      <span className="flex items-center justify-between gap-2 border-t border-border-strong pt-1">
        <span className="text-[12px] font-semibold tracking-[.2em] text-text-muted-alt">{product.code}</span>
        {tag && <Tag variant={tag.style}>{tag.text}</Tag>}
      </span>
      {product.name && (
        <span className="font-display text-[24px] leading-[1.2] transition-colors duration-[var(--dur-micro)] ease-[var(--ease-weave)] group-hover:text-accent">{product.name}</span>
      )}
      {notes.length > 0 && (
        <span className="flex flex-wrap gap-2">
          {notes.map((n) => (
            <Tag key={n} variant="dashed">{n}</Tag>
          ))}
        </span>
      )}
    </Link>
  )
}

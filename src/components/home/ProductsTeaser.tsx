import type { Mode, ProductCardView, ProductView } from '@/lib/content'
import { ExhibitCard } from '@/components/content/ExhibitCard'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { PatternTeaser } from './PatternTeaser'

type ProductsTeaserProps = { featured: ProductView | null; products: ProductCardView[]; mode: Mode }

export function ProductsTeaser({ featured, products, mode }: ProductsTeaserProps) {
  const showPattern = featured !== null && featured.images.length > 0 && featured.annotations.length > 0
  // Số HIỆN VẬT là vị trí gốc trong danh sách; thẻ thiếu tên thì bỏ, không đánh số lại.
  const cards = products
    .slice(0, 4)
    .map((p, i) => ({ p, index: i + 1 }))
    .filter((c): c is { p: ProductCardView & { name: string }; index: number } => c.p.name !== null)
  if (!showPattern && cards.length === 0) return null
  return (
    <section className="flex flex-col gap-5 bg-bg-secondary px-5 py-14 md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-14 md:px-20 md:py-[120px]">
      <div className="flex flex-col gap-5 md:col-span-12 md:gap-[18px]">
        <span className="text-eyebrow font-semibold tracking-[.22em] text-accent md:tracking-[.24em]">SẢN PHẨM</span>
        <h2 className="font-display text-h2 leading-[1.15] font-normal md:leading-[1.1]">Nét đẹp từ những đường dệt.</h2>
      </div>
      {showPattern ? <PatternTeaser product={featured} /> : null}
      {cards.length > 0 ? (
        <>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 md:col-span-12 md:mt-4">
            <p className="m-0 font-display text-[24px] md:text-[30px]">Bộ sưu tập chiếu</p>
            <LinkArrow href="/san-pham">Xem toàn bộ sưu tập</LinkArrow>
          </div>
          <div className="flex flex-col gap-4 md:col-span-12 md:-mt-6 md:grid md:grid-cols-4 md:gap-6">
            {cards.map(({ p, index }) => (
              <ExhibitCard key={p.slug} index={index} name={p.name} note={p.summary} href={`/san-pham/${p.slug}`} large onSecondary />
            ))}
          </div>
          {mode === 'preview' ? <p className="m-0 text-[13px] text-text-muted-alt md:hidden">Danh mục đang xác minh với cơ sở dệt.</p> : null}
        </>
      ) : null}
    </section>
  )
}

import type { ReactNode } from 'react'
import type { ImageView } from '@/lib/content'
import { ContentImage } from './ContentImage'

type PhotoEssayProps = {
  title: string
  /** Ghi chú cạnh tiêu đề (có thể là VariantText hai bản). */
  note?: ReactNode
  items: { image: ImageView; caption: string | null }[]
}

// Cứ bốn ảnh lặp 8 · 4 · 4 · 8 cột để hai ảnh một hàng luôn tròn 12 cột.
const SPANS = ['md:col-span-8', 'md:col-span-4', 'md:col-span-4', 'md:col-span-8'] as const

// Không có lề từ cha: tiêu đề, ghi chú mang px-5; ảnh tràn viền ở mobile; chú thích ảnh chỉ từ md (theo PersonMobile).
// Phóng sự ảnh: desktop lưới 12 cột (8/4), mobile ảnh tràn viền xếp dọc.
export function PhotoEssay({ title, note, items }: PhotoEssayProps) {
  if (items.length === 0) return null
  return (
    <section className="flex flex-col gap-4 md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-6">
      <h2 className="m-0 px-5 font-display text-[26px] font-normal leading-[1.2] md:col-span-8 md:px-0 md:text-[40px]">{title}</h2>
      {note ? <p className="m-0 px-5 text-[13px] text-text-muted max-md:order-last md:col-span-4 md:self-end md:px-0 md:text-right md:text-[14px]">{note}</p> : null}
      {items.map((it, i) => (
        <figure key={i} className={`m-0 flex flex-col gap-2.5 ${SPANS[i % 4]}`}>
          <ContentImage image={it.image} size="wide" sizes="(min-width: 768px) 60vw, 100vw" className="block h-[260px] md:h-[520px]" />
          {it.caption ? <figcaption className="px-5 max-md:hidden font-serif text-[14px] italic leading-[1.5] text-text-secondary md:px-0">{it.caption}</figcaption> : null}
        </figure>
      ))}
    </section>
  )
}

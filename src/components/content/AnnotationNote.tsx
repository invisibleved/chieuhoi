import type { ProductView } from '@/lib/content'
import { FootnoteRef } from './Sources'

type AnnotationNoteProps = {
  annotation: ProductView['annotations'][number]
  productSlug: string
  /** panel: khung nổi viền nhấn trên; teaser: khối chữ cạnh ảnh ở trang chủ. */
  variant: 'panel' | 'teaser'
  /** md: 24px; lg: 24px, từ md 30px. */
  headingSize?: 'md' | 'lg'
}

const frames = {
  panel: 'flex flex-col gap-2.5 border-t-[3px] border-accent bg-bg-raised p-[18px]',
  teaser: 'flex flex-col gap-2 border-t-[3px] border-accent bg-bg-primary p-[18px] md:gap-2.5 md:border-l-[3px] md:border-t-0 md:bg-transparent md:p-0 md:pl-[18px]',
} as const
const headings = { md: 'text-[24px]', lg: 'text-[24px] md:text-[30px]' } as const
const bodies = {
  panel: 'text-[15px] leading-[1.65] text-text-primary',
  teaser: 'text-[15px] leading-[1.6] text-text-secondary md:text-[16px] md:leading-[1.65]',
} as const

// Chú thích một điểm hoa văn: "n · tiêu đề", nội dung (kèm số nguồn) và dòng nguồn (chỉ ở panel).
export function AnnotationNote({ annotation: a, productSlug, variant, headingSize = variant === 'panel' ? 'md' : 'lg' }: AnnotationNoteProps) {
  const href = variant === 'teaser' ? `/san-pham/${productSlug}#nguon-${a.sourceN}` : `#nguon-${a.sourceN}`
  return (
    <div className={frames[variant]}>
      <p className={`m-0 font-display leading-[1.2] ${headings[headingSize]}`}>{a.title ? `${a.n} · ${a.title}` : `${a.n}`}</p>
      <p className={`m-0 ${bodies[variant]}`}>
        {a.body}
        {a.sourceN !== null ? <FootnoteRef n={a.sourceN} href={href} /> : null}
      </p>
      {variant === 'panel' && a.sourceLine ? <p className="m-0 text-[13px] leading-[1.55] text-text-muted">{a.sourceLine}</p> : null}
    </div>
  )
}

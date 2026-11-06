import type { SourceView } from '@/lib/content'
import { NewTabHint, newTabProps } from '@/components/ui/newTab'

// Đánh số nguồn 1..n theo thứ tự mảng.
export function sourceNumbers(sources: SourceView[]): Map<string, number> {
  return new Map(sources.map((s, i) => [s.id, i + 1]))
}

type FootnoteVariant = 'number' | 'bracket'

const footnoteVariants = {
  // Số trơn đậm 13px (bài viết, trang chủ).
  number: 'ml-1 font-sans text-[13px] font-semibold',
  // "[n]" 12px như .src của VillagePage (giãn chữ .06em từ md theo artboard desktop).
  bracket: 'ml-0.5 font-sans text-[12px] md:tracking-cite',
} as const

// Số chú thích trên dòng; vùng chạm 44px mở rộng bằng pseudo-element.
export function FootnoteRef({ n, href, variant = 'number' }: { n: number; href?: string; variant?: FootnoteVariant }) {
  return (
    <a
      href={href ?? `#nguon-${n}`}
      className={`fn relative align-super text-text-meta no-underline before:absolute before:left-1/2 before:top-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] ${footnoteVariants[variant]}`}
      aria-label={`Nguồn ${n}`}
    >
      <span className="relative z-[1]">{variant === 'bracket' ? `[${n}]` : n}</span>
    </a>
  )
}

// Chú thích cuối câu: các số nguồn theo thứ tự tăng dần; id không có số (nguồn bị ẩn) thì bỏ.
export function Cite({ ids, numbers, variant }: { ids: string[]; numbers: Map<string, number>; variant?: FootnoteVariant }) {
  const ns = ids.flatMap((id) => numbers.get(id) ?? []).sort((a, b) => a - b)
  if (ns.length === 0) return null
  return (
    <>
      {ns.map((n) => (
        <FootnoteRef key={n} n={n} variant={variant} />
      ))}
    </>
  )
}

type ListVariant = 'reference' | 'notes'

// Thứ tự trong mục: đơn vị xuất bản, tác giả, tiêu đề, ngày (artboard VillagePage, StoryDetail).
// reference: mục "[n]" một cột phụ + một cột chữ, ngăn bằng " · " (trang Làng Hới, styleguide).
// notes: "Ghi chú nguồn" cuối bài đọc, cột 4–9, số "n." và ngăn bằng ", " (StoryDetail).
const listStyles = {
  reference: {
    section: 'px-5 py-10 md:grid md:grid-cols-12 md:gap-x-6 md:px-20 md:py-24',
    inner: 'contents',
    h: 'mb-3 font-display text-[24px] font-normal md:col-span-3 md:mb-0 md:text-h4',
    ol: 'm-0 flex list-none flex-col p-0 text-[14px] leading-[1.55] md:col-span-8 md:col-start-5 md:text-[15px] md:leading-[1.6]',
    li: 'border-t py-3 md:grid md:grid-cols-[40px_1fr] md:py-3.5',
    first: 'border-border-strong',
    rest: 'border-border-soft',
    last: 'border-b border-b-border-soft',
    num: 'mr-1.5 font-semibold text-text-meta md:mr-0',
    sep: ' · ',
    end: '',
  },
  notes: {
    section: 'mx-5 mt-10 md:mx-0 md:mt-0 md:grid md:grid-cols-12 md:gap-x-6 md:px-20 md:pt-[72px]',
    inner: 'flex flex-col border-t border-border-strong pt-[18px] md:col-span-6 md:col-start-4 md:pt-6',
    h: 'm-0 mb-2 font-display text-[22px] font-normal md:mb-3 md:text-h5',
    ol: 'm-0 flex list-none flex-col p-0 text-[14px] leading-[1.55] md:text-[15px] md:leading-[1.6]',
    li: 'border-b border-border-soft py-2.5 md:py-3',
    first: '',
    rest: '',
    last: '',
    num: 'font-semibold text-text-meta',
    sep: ', ',
    end: '.',
  },
} as const

// Danh sách nguồn; mục null bỏ cả dấu ngăn đi kèm.
export function SourceList({
  sources,
  headingId = 'nguon-tham-khao',
  title = 'Nguồn tham khảo',
  variant = 'reference',
  idPrefix = 'nguon',
}: {
  sources: SourceView[]
  headingId?: string
  title?: string
  variant?: ListVariant
  /** Tiền tố id của từng mục (`<prefix>-n`), khớp href của FootnoteRef. */
  idPrefix?: string
}) {
  if (sources.length === 0) return null
  const st = listStyles[variant]
  return (
    <section aria-labelledby={headingId} className={st.section}>
      <div className={st.inner}>
        <h2 id={headingId} className={st.h}>
          {title}
        </h2>
        <ol className={st.ol}>
          {sources.map((s, i) => {
            const n = i + 1
            const parts = [
              s.publisher,
              s.author,
              s.url ? (
                <a key="t" href={s.url} className="underline underline-offset-2 hover:decoration-2" {...newTabProps}>
                  {s.title}
                  <NewTabHint />
                </a>
              ) : (
                s.title
              ),
              s.date,
            ].filter((p) => p !== null)
            return (
              <li
                key={s.id}
                id={`${idPrefix}-${n}`}
                className={[st.li, i === 0 ? st.first : st.rest, i === sources.length - 1 ? st.last : ''].filter(Boolean).join(' ')}
              >
                <span className={st.num}>{variant === 'notes' ? `${n}. ` : `[${n}]`}</span>
                <span>
                  {parts.map((p, j) => (
                    <span key={j}>
                      {j > 0 ? st.sep : ''}
                      {p}
                    </span>
                  ))}
                  {st.end}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

import type { SourceView } from '@/lib/content'

// Đánh số nguồn 1..n theo thứ tự mảng.
export function sourceNumbers(sources: SourceView[]): Map<string, number> {
  return new Map(sources.map((s, i) => [s.id, i + 1]))
}

// Số chú thích trên dòng; vùng chạm 44px mở rộng bằng pseudo-element.
export function FootnoteRef({ n }: { n: number }) {
  return (
    <a
      href={`#nguon-${n}`}
      className="fn relative ml-1 align-super font-sans text-[13px] font-semibold text-text-meta no-underline before:absolute before:left-1/2 before:top-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
      aria-label={`Nguồn ${n}`}
    >
      <span className="relative z-[1]">{n}</span>
    </a>
  )
}

// Danh sách nguồn; mục null bỏ cả dấu " · " đi kèm.
export function SourceList({
  sources,
  headingId = 'nguon-tham-khao',
  title = 'Nguồn tham khảo',
}: {
  sources: SourceView[]
  headingId?: string
  title?: string
}) {
  if (sources.length === 0) return null
  return (
    <section
      aria-labelledby={headingId}
      className="px-5 py-10 md:grid md:grid-cols-12 md:gap-x-6 md:px-20 md:py-24"
    >
      <h2
        id={headingId}
        className="mb-3 font-display text-[24px] font-normal md:col-span-3 md:mb-0 md:text-h4"
      >
        {title}
      </h2>
      <ol className="m-0 flex list-none flex-col p-0 text-[14px] leading-[1.55] md:col-span-8 md:col-start-5 md:text-[15px] md:leading-[1.6]">
        {sources.map((s, i) => {
          const n = i + 1
          const parts = [
            s.publisher,
            s.url ? (
              <a key="t" href={s.url}>
                {s.title}
              </a>
            ) : (
              s.title
            ),
            s.date,
          ].filter((p) => p !== null)
          return (
            <li
              key={s.id}
              id={`nguon-${n}`}
              className={`border-t py-3 md:grid md:grid-cols-[40px_1fr] md:py-3.5 ${
                i === 0 ? 'border-border-strong' : 'border-[rgba(40,39,36,.2)]'
              } ${i === sources.length - 1 ? 'border-b border-b-[rgba(40,39,36,.2)]' : ''}`}
            >
              <span className="mr-1.5 font-semibold text-text-meta md:mr-0">[{n}]</span>
              <span>
                {parts.map((p, j) => (
                  <span key={j}>
                    {j > 0 ? ' · ' : ''}
                    {p}
                  </span>
                ))}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

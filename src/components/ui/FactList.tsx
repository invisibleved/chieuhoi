import type { ReactNode } from 'react'
import { Eyebrow } from './Eyebrow'

type FactListProps = {
  items: {
    term: string
    detail: ReactNode
    /** Chỉ columns=2: dòng trải hai cột. */
    wide?: boolean
    /** Liên kết đặt bên phải dòng (ví dụ "Kết nối với làng"). */
    action?: ReactNode
  }[]
  /** stacked: nhãn viết hoa trên, chi tiết dưới. inline: hai cột, nhãn chữ thường màu phụ (PersonDetail). */
  layout?: 'stacked' | 'inline'
  /** 2: từ md chia hai cột, hai hàng đầu viền đậm (bảng thông số hiện vật). */
  columns?: 1 | 2
  className?: string
}

const rows = {
  stacked: 'flex flex-col gap-1.5 py-3.5',
  inline: 'grid grid-cols-[120px_1fr] py-2.5 text-[15px] leading-[1.55] md:grid-cols-[130px_1fr] md:py-3',
} as const

// Danh sách "thuật ngữ — chi tiết" kẻ ngang: viền trên mục đầu đậm, các mục sau mảnh, viền dưới mục cuối.
export function FactList({ items, layout = 'stacked', columns = 1, className }: FactListProps) {
  const two = columns === 2
  return (
    <dl className={['m-0 flex flex-col', two && 'md:grid md:grid-cols-2 md:gap-x-8', className].filter(Boolean).join(' ')}>
      {items.map((it, i) => (
        <div
          key={`${i}-${it.term}`}
          className={`border-t ${it.action ? 'grid grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 py-3.5' : rows[layout]} ${i === 0 ? 'border-border-strong' : 'border-border-soft'} ${
            two ? `md:py-4 ${i === 1 ? 'md:border-border-strong' : ''} ${it.wide ? 'md:col-span-2' : ''}` : ''
          } ${i === items.length - 1 ? 'border-b border-b-border-soft' : ''}`}
        >
          {it.action ? (
            <>
              <Eyebrow as="dt" tone="muted" tracking="label" uppercase className="col-start-1 row-start-1">{it.term}</Eyebrow>
              <dd className="col-start-1 row-start-2 m-0 text-[15px] leading-[1.6] text-text-primary">{it.detail}</dd>
              <dd className="col-start-2 row-span-2 row-start-1 m-0 self-center whitespace-nowrap">{it.action}</dd>
            </>
          ) : (
            <>
              {layout === 'inline' ? (
                <dt className="text-text-muted">{it.term}</dt>
              ) : (
                <Eyebrow as="dt" tone="muted" tracking="label" uppercase>{it.term}</Eyebrow>
              )}
              <dd className={`m-0 text-text-primary ${layout === 'stacked' ? 'text-[15px] leading-[1.6]' : ''}`}>{it.detail}</dd>
            </>
          )}
        </div>
      ))}
    </dl>
  )
}

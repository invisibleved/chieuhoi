import type { ReactNode } from 'react'
import { Eyebrow } from './Eyebrow'

type FactListProps = {
  items: { term: string; detail: ReactNode }[]
  /** stacked: nhãn viết hoa trên, chi tiết dưới. inline: hai cột, nhãn chữ thường màu phụ (PersonDetail). */
  layout?: 'stacked' | 'inline'
  className?: string
}

const rows = {
  stacked: 'flex flex-col gap-1.5 py-3.5',
  inline: 'grid grid-cols-[120px_1fr] py-2.5 text-[15px] leading-[1.55] md:grid-cols-[130px_1fr] md:py-3',
} as const

// Danh sách "thuật ngữ — chi tiết" kẻ ngang: viền trên mục đầu đậm, các mục sau mảnh, viền dưới mục cuối.
export function FactList({ items, layout = 'stacked', className }: FactListProps) {
  return (
    <dl className={['m-0 flex flex-col', className].filter(Boolean).join(' ')}>
      {items.map((it, i) => (
        <div
          key={`${i}-${it.term}`}
          className={`border-t ${rows[layout]} ${i === 0 ? 'border-border-strong' : 'border-border-soft'} ${
            i === items.length - 1 ? 'border-b border-b-border-soft' : ''
          }`}
        >
          {layout === 'inline' ? (
            <dt className="text-text-muted">{it.term}</dt>
          ) : (
            <Eyebrow as="dt" tone="muted" tracking="label">{it.term}</Eyebrow>
          )}
          <dd className={`m-0 text-text-primary ${layout === 'stacked' ? 'text-[15px] leading-[1.6]' : ''}`}>{it.detail}</dd>
        </div>
      ))}
    </dl>
  )
}

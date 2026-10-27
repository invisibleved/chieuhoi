import type { ReactNode } from 'react'
import { Eyebrow } from './Eyebrow'

type FactListProps = { items: { term: string; detail: ReactNode }[]; className?: string }

// Danh sách "thuật ngữ — chi tiết" kẻ ngang: viền trên mục đầu đậm, các mục sau mảnh, viền dưới mục cuối.
export function FactList({ items, className }: FactListProps) {
  return (
    <dl className={['m-0 flex flex-col', className].filter(Boolean).join(' ')}>
      {items.map((it, i) => (
        <div
          key={`${i}-${it.term}`}
          className={`flex flex-col gap-1.5 border-t py-3.5 ${i === 0 ? 'border-border-strong' : 'border-border-soft'} ${
            i === items.length - 1 ? 'border-b border-b-border-soft' : ''
          }`}
        >
          <Eyebrow as="dt" tone="muted" tracking="label">{it.term}</Eyebrow>
          <dd className="m-0 text-[15px] leading-[1.6] text-text-primary">{it.detail}</dd>
        </div>
      ))}
    </dl>
  )
}

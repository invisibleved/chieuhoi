import type { ReactNode } from 'react'

type FactListProps = { items: { term: string; detail: ReactNode }[]; className?: string }

// Danh sách "thuật ngữ — chi tiết" kẻ ngang: viền trên mục đầu đậm, các mục sau mảnh, viền dưới mục cuối.
export function FactList({ items, className }: FactListProps) {
  return (
    <dl className={['m-0 flex flex-col', className].filter(Boolean).join(' ')}>
      {items.map((it, i) => (
        <div
          key={it.term}
          className={`flex flex-col gap-1.5 border-t py-3.5 ${i === 0 ? 'border-border-strong' : 'border-border-soft'} ${
            i === items.length - 1 ? 'border-b border-b-border-soft' : ''
          }`}
        >
          <dt className="text-eyebrow font-semibold tracking-[.2em] text-text-muted">{it.term}</dt>
          <dd className="m-0 text-[15px] leading-[1.6] text-text-primary">{it.detail}</dd>
        </div>
      ))}
    </dl>
  )
}

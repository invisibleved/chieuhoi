import type { ReactNode } from 'react'
import { Eyebrow } from './Eyebrow'

type CalloutProps = { title: string; children: ReactNode; className?: string }

// Khối chú ý: nền cói đậm, viền trái đỏ điều, tiêu đề eyebrow.
export function Callout({ title, children, className }: CalloutProps) {
  return (
    <aside className={['flex flex-col gap-2.5 border-l-[3px] border-accent bg-bg-secondary p-5 md:p-6', className].filter(Boolean).join(' ')}>
      <Eyebrow as="p" tone="muted-alt" tracking="label">{title}</Eyebrow>
      <div className="text-[15px] leading-[1.6] text-text-secondary">{children}</div>
    </aside>
  )
}

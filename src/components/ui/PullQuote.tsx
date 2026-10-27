import type { ReactNode } from 'react'

type PullQuoteProps = {
  /** article: viền trên/dưới, màu nhấn (bài viết). testimony: viền trái rơm, màu phụ (lời kể chân dung). */
  variant: 'article' | 'testimony'
  /** Dòng nhỏ dưới câu trích (nguồn, ghi chú). */
  note?: ReactNode
  /** Thêm vào dòng ghi chú (ví dụ `max-md:hidden` khi artboard mobile không có dòng này). */
  noteClassName?: string
  children: ReactNode
}

const shells = {
  article: 'my-2 flex flex-col gap-3.5 border-y border-border-strong py-[22px] md:my-6 md:py-8',
  testimony: 'm-0 flex flex-col gap-2.5 border-l-[3px] border-decor-straw py-5 pl-5 md:my-2 md:gap-3 md:py-7 md:pl-7',
} as const

const texts = {
  article: 'text-quote leading-[1.35] text-accent',
  testimony: 'text-[26px] leading-[1.35] text-text-muted md:text-[32px]',
} as const

export function PullQuote({ variant, note, noteClassName, children }: PullQuoteProps) {
  return (
    <blockquote className={shells[variant]}>
      <p className={`m-0 font-display italic ${texts[variant]}`}>{children}</p>
      {note ? <span className={['text-[13px] text-text-muted', noteClassName].filter(Boolean).join(' ')}>{note}</span> : null}
    </blockquote>
  )
}

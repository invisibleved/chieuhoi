import type { ReactNode } from 'react'
import { Eyebrow } from './Eyebrow'

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  note?: ReactNode
  as?: 'h2' | 'h3'
  id?: string
  tone?: 'light' | 'dark'
  /** Thêm vào ghi chú (ví dụ ẩn trên mobile). */
  noteClassName?: string
  /** section: 52px desktop / 32px mobile (h2 các section của trang con). */
  size?: 'default' | 'section'
}

export function SectionHeading({ eyebrow, title, note, as: Tag = 'h2', id, tone = 'light', noteClassName, size = 'default' }: SectionHeadingProps) {
  const dark = tone === 'dark'
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-4">
        {eyebrow ? (
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        ) : null}
        <Tag
          id={id}
          className={`font-display ${size === 'section' ? 'text-h2-section' : 'text-h2'} leading-[1.1] font-normal ${dark ? 'text-text-on-dark' : 'text-text-primary'}`}
        >
          {title}
        </Tag>
      </div>
      {note ? (
        <p className={`max-w-[340px] text-small md:text-right ${dark ? 'text-text-on-dark-muted' : 'text-text-muted'} ${noteClassName ?? ''}`}>
          {note}
        </p>
      ) : null}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'

// Mục lục bài: liên kết neo (đọc được khi không có JS); IntersectionObserver đánh dấu mục đang đọc bằng aria-current.
export function TableOfContents({
  label,
  title,
  items,
}: {
  label: string
  title: string
  items: { id: string; title: string }[]
}) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const visible = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        }
        const first = items.find((i) => visible.has(i.id))
        if (first) setActive(first.id)
      },
      { rootMargin: '0px 0px -60% 0px' },
    )
    for (const i of items) {
      const el = document.getElementById(i.id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [items])

  if (items.length === 0) return null
  return (
    <nav aria-label={label} className="flex flex-col gap-2.5 text-[14px] leading-[1.45]">
      <span className="text-[12px] font-semibold tracking-label text-text-muted">{title}</span>
      {items.map((i) => {
        const on = i.id === active
        return (
          <a
            key={i.id}
            href={`#${i.id}`}
            aria-current={on ? 'true' : undefined}
            className={`border-l-2 pl-2.5 ${on ? 'border-accent text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            {i.title}
          </a>
        )
      })}
    </nav>
  )
}

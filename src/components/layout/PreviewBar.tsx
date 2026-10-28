'use client'

import { usePathname, useSearchParams } from 'next/navigation'

import type { PreviewBarView } from '@/lib/content'

export function PreviewBar({ view }: { view: PreviewBarView }) {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const here = pathname + (search ? `?${search}` : '')
  return (
    <aside
      aria-label="Chế độ xem trước"
      className="flex flex-wrap items-center justify-between gap-x-6 bg-bg-ink px-5 py-1 text-caption text-text-on-dark lg:px-10 xl:px-20"
    >
      <p className="m-0">{view.label}</p>
      <a
        href={`${view.exitRoute}?path=${encodeURIComponent(here)}`}
        className="flex min-h-11 items-center underline underline-offset-4 hover:text-accent-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-dark"
      >
        {view.exitLabel}
      </a>
    </aside>
  )
}

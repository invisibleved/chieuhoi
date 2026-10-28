import Link from 'next/link'
import { Fragment } from 'react'

const tones = {
  light: { sep: 'text-text-muted', link: 'text-text-secondary hover:text-accent', current: 'text-text-primary' },
  dark: { sep: 'text-text-deep-muted', link: 'text-text-on-dark-muted hover:text-accent-on-dark', current: 'text-text-on-dark' },
} as const

export function Breadcrumb({ items, tone = 'light' }: { items: { label: string; href?: string }[]; tone?: 'light' | 'dark' }) {
  const c = tones[tone]
  return (
    <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-x-2.5 text-[14px]">
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <Fragment key={`${i}-${item.label}`}>
            {i > 0 ? (
              <span aria-hidden="true" className={c.sep}>
                /
              </span>
            ) : null}
            {item.href && !last ? (
              <Link href={item.href} className={`inline-flex min-h-11 items-center ${c.link} lg:min-h-0`}>
                {item.label}
              </Link>
            ) : (
              <span aria-current={last ? 'page' : undefined} className={`font-medium ${c.current}`}>
                {item.label}
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

import Link from 'next/link'
import { Fragment } from 'react'

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-x-2.5 text-[14px]">
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <Fragment key={`${i}-${item.label}`}>
            {i > 0 ? (
              <span aria-hidden="true" className="text-text-muted">
                /
              </span>
            ) : null}
            {item.href && !last ? (
              <Link href={item.href} className="inline-flex min-h-11 items-center text-text-secondary hover:text-accent lg:min-h-0">
                {item.label}
              </Link>
            ) : (
              <span aria-current={last ? 'page' : undefined} className="font-medium text-text-primary">
                {item.label}
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

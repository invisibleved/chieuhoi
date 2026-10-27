'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ThreadsDivider } from '@/components/ui/ThreadsDivider'
import { isCurrent, NAV_ITEMS } from './nav'

export function DesktopNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Điều hướng chính"
      className="hidden items-baseline gap-4 text-[14px] lg:flex xl:gap-8"
    >
      {NAV_ITEMS.map((item) => {
        const current = isCurrent(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? 'page' : undefined}
            className="relative flex items-baseline gap-2 whitespace-nowrap text-text-primary no-underline hover:text-accent"
          >
            <span className="text-[12px] text-text-meta">{item.n}</span>
            {item.label}
            {current ? (
              <ThreadsDivider className="absolute inset-x-0 -bottom-2.5 h-1.5!" />
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}

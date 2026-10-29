'use client'

import { Link } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'

export const GUIDE_HREF = '/admin/huong-dan'

/** Link "Hướng dẫn" ở cuối menu (afterNavLinks), cùng kiểu với các link mục của Payload. */
export function GuideNavLink() {
  const active = usePathname() === GUIDE_HREF
  return (
    <Link className="nav__link ch-guide-nav-link" href={GUIDE_HREF} prefetch={false} aria-current={active ? 'page' : undefined}>
      {active && <div className="nav__link-indicator" />}
      <span className="nav__link-label">Hướng dẫn</span>
    </Link>
  )
}

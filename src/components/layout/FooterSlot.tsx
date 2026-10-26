'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/** Footer đầy đủ chỉ ở trang chủ; các trang khác dùng bản gọn. */
export function FooterSlot({ full, compact }: { full: ReactNode; compact: ReactNode }) {
  return usePathname() === '/' ? full : compact
}

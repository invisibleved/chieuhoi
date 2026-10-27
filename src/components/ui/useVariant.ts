'use client'

import { useSyncExternalStore } from 'react'
import type { Variant } from '@/lib/content'

const QUERY = '(min-width: 768px)'
const subscribe = (cb: () => void) => {
  if (typeof window.matchMedia !== 'function') return () => {}
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/** Chọn chuỗi theo bản desktop/mobile cho thuộc tính không chọn được bằng CSS (placeholder, aria-label). Server và lần render đầu dùng bản desktop. */
export function useVariantString(v: Variant): string {
  const desktop = useSyncExternalStore(
    subscribe,
    () => (typeof window.matchMedia === 'function' ? window.matchMedia(QUERY).matches : true),
    () => true,
  )
  if (!v.mobile) return v.desktop ?? ''
  if (!v.desktop) return v.mobile
  return desktop ? v.desktop : v.mobile
}

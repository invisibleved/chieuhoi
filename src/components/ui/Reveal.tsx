'use client'

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type RevealProps = { children: ReactNode }

/** Hiện dần khi cuộn tới. Server/không JS: hiện đầy đủ. Chỉ ẩn sau khi mount nếu phần tử nằm dưới khung nhìn. */
export function Reveal({ children }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'idle' | 'hidden' | 'shown'>('idle')

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (el.getBoundingClientRect().top < window.innerHeight) return
    setState('hidden')
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setState('shown')
        io.disconnect()
      }
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const cls =
    state === 'idle' ? '' :
    state === 'hidden' ? 'opacity-0 translate-y-4 print:opacity-100 print:translate-y-0 transition-[opacity,transform] duration-[var(--dur-reveal)]' :
    'opacity-100 translate-y-0 transition-[opacity,transform] duration-[var(--dur-reveal)]'
  return <div ref={ref} className={cls}>{children}</div>
}

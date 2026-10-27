'use client'

import { useEffect, useRef } from 'react'
import type { PointerEvent, ReactNode, RefObject } from 'react'
import { interceptClick } from './plainClick'

type LightboxProps = {
  /** aria-label của hộp thoại. */
  label: string
  /** Dòng vị trí ở đầu hộp ("1 / 14 · ← → để chuyển ảnh"). */
  position: ReactNode
  /** Liên kết thật để dùng khi không có JS; có JS thì bị chặn và gọi callback tương ứng (R11). */
  closeHref: string
  prevHref: string
  nextHref: string
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  closeLabel: string
  prevLabel: string
  nextLabel: string
  /** Chữ gợi ý vuốt ngang, chỉ hiện trên mobile giữa hai nút. */
  swipeHint?: string
  /** Vùng ảnh. */
  image: ReactNode
  /** Cột metadata. */
  children: ReactNode
  /** Phần tử nhận lại focus khi hộp đóng. */
  returnFocusRef?: RefObject<HTMLElement | null>
}

const SWIPE_MIN = 40
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

const btn =
  'flex size-12 items-center justify-center border border-border-on-dark-strong text-text-on-dark hover:border-text-on-dark md:size-14'

const icons = {
  close: 'M2 2l14 14M16 2L2 16',
  prev: 'M12 3L6 9l6 6',
  next: 'M6 3l6 6-6 6',
} as const

function Icon({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d={d} />
    </svg>
  )
}

// Hộp xem ảnh toàn màn hình. Không biết gì về tư liệu: nhận ảnh, metadata, nhãn và callback.
// Giữ focus trong hộp, ← → Esc, vuốt ngang (pointer events). Không khoá cuộn của trang nền (R15).
export function Lightbox({
  label, position, closeHref, prevHref, nextHref, onClose, onPrev, onNext, closeLabel, prevLabel, nextLabel, swipeHint, image, children, returnFocusRef,
}: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLAnchorElement>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  // Callback mới nhất, để listener cấp document không phải gắn lại mỗi lần render.
  const latest = useRef({ onClose, onPrev, onNext })
  useEffect(() => {
    latest.current = { onClose, onPrev, onNext }
  })

  useEffect(() => {
    closeRef.current?.focus()
    const back = returnFocusRef
    return () => back?.current?.focus()
  }, [returnFocusRef])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        latest.current.onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        latest.current.onPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        latest.current.onNext()
      } else if (e.key === 'Tab') {
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
        if (!nodes || nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        const active = document.activeElement
        const inside = dialogRef.current?.contains(active) ?? false
        if (!inside) {
          e.preventDefault()
          ;(e.shiftKey ? last : first).focus()
        } else if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const down = (e: PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY }
  }
  const up = (e: PointerEvent) => {
    const s = start.current
    start.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) <= Math.abs(dy)) return
    if (dx < 0) onNext()
    else onPrev()
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-overlay-lightbox text-text-on-dark md:grid md:grid-cols-[1fr_360px] md:grid-rows-[auto_1fr] md:content-start md:gap-6 md:px-20 md:py-8"
    >
      <div className="flex items-center justify-between py-2 pr-2 pl-5 md:col-span-2 md:p-0">
        <span className="text-[14px] text-text-deep-muted">{position}</span>
        <a ref={closeRef} href={closeHref} aria-label={closeLabel} onClick={interceptClick(onClose)} className={`${btn} max-md:border-0`}>
          <Icon d={icons.close} />
        </a>
      </div>
      <div
        data-lightbox-stage=""
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={() => (start.current = null)}
        className="relative touch-pan-y md:h-[640px]"
      >
        <div className="flex h-[300px] w-full items-center justify-center bg-bg-lightbox-stage md:h-full">{image}</div>
        <div className="flex justify-between px-5 py-3 md:contents">
          <a
            href={prevHref}
            aria-label={prevLabel}
            onClick={interceptClick(onPrev)}
            className={`${btn} md:absolute md:top-1/2 md:left-3 md:-translate-y-1/2 md:bg-overlay-lightbox-button`}
          >
            <Icon d={icons.prev} />
          </a>
          {swipeHint ? <span className="self-center text-[13px] text-text-deep-muted md:hidden">{swipeHint}</span> : null}
          <a
            href={nextHref}
            aria-label={nextLabel}
            onClick={interceptClick(onNext)}
            className={`${btn} md:absolute md:top-1/2 md:right-3 md:-translate-y-1/2 md:bg-overlay-lightbox-button`}
          >
            <Icon d={icons.next} />
          </a>
        </div>
      </div>
      <aside className="flex flex-col gap-3 border-t border-border-on-dark-soft px-5 pt-4 pb-8 md:gap-4 md:border-t-0 md:p-0">{children}</aside>
    </div>
  )
}

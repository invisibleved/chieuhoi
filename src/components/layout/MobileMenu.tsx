'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState, type KeyboardEvent } from 'react'

import { LanguageSwitch } from './LanguageSwitch'
import { CONNECT_HREF, isCurrent, NAV_ITEMS } from './nav'

const MENU_ID = 'menu-mobile'

export function MobileMenu({ tagline }: { tagline: string | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const show = () => {
    setOpen(true)
    // Đợi overlay hiện rồi mới chuyển focus vào trong.
    requestAnimationFrame(() => closeRef.current?.focus())
  }
  const hide = (restoreFocus: boolean) => {
    setOpen(false)
    if (restoreFocus) toggleRef.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      hide(true)
      return
    }
    if (e.key !== 'Tab') return
    const items = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
    )
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-label="Mở menu"
        aria-expanded={open}
        aria-controls={MENU_ID}
        onClick={show}
        className="inline-flex h-12 w-12 items-center justify-center text-text-primary lg:hidden"
      >
        <svg aria-hidden="true" width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M0 1h24M0 8h24M6 15h18" />
        </svg>
      </button>

      <div
        ref={dialogRef}
        id={MENU_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        onKeyDown={onKeyDown}
        className="fixed inset-0 z-50 overflow-y-auto bg-bg-primary text-text-primary lg:!hidden"
      >
        <div className="flex min-h-full flex-col">
          <div className="flex items-center justify-between border-b border-border-subtle py-2 pr-2 pl-5">
            <Link
              href="/"
              onClick={() => hide(false)}
              className="inline-flex min-h-11 items-center font-display text-[18px] tracking-[.28em] text-text-primary no-underline"
            >
              CHIẾU HỚI
            </Link>
            <button
              ref={closeRef}
              type="button"
              aria-label="Đóng menu"
              onClick={() => hide(true)}
              className="inline-flex h-12 w-12 items-center justify-center text-text-primary"
            >
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3l14 14M17 3L3 17" />
              </svg>
            </button>
          </div>

          <nav aria-label="Điều hướng chính" className="flex flex-col px-5 pt-5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => hide(false)}
                aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
                className="group flex min-h-15 items-baseline gap-4 border-b border-border-subtle py-2.5 text-text-primary no-underline"
              >
                <span className="w-[22px] text-[13px] text-text-meta">{item.n}</span>
                <span className="font-display text-[30px] leading-[1.15] group-hover:text-accent group-aria-[current=page]:text-accent">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-1 px-5 pt-7">
            <Link
              href={CONNECT_HREF}
              onClick={() => hide(false)}
              className="flex min-h-[52px] items-center justify-center bg-accent text-[15px] font-medium text-on-accent no-underline hover:bg-accent-hover"
            >
              Kết nối với làng
            </Link>
            <Link
              href="/"
              onClick={() => hide(false)}
              className="flex min-h-12 items-center justify-center text-[15px] font-medium text-text-primary underline"
            >
              Tìm kiếm
            </Link>
          </div>

          <div className="mt-auto flex flex-col gap-4 px-5 pt-6 pb-8">
            <div className="threads" aria-hidden="true" />
            <div className="flex items-center justify-between">
              {tagline ? (
                <p className="m-0 font-serif text-[14px] italic text-text-secondary">{tagline}</p>
              ) : (
                <span />
              )}
              <LanguageSwitch />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

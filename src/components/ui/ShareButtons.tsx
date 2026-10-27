'use client'

import { useState } from 'react'
import type { Variant } from '@/lib/content'

type ShareCopy = {
  label: string | null
  copy: Variant
  facebook: Variant
  zalo: Variant
  copied: string
  zaloFallback: string
}

const square =
  'inline-flex cursor-pointer items-center justify-center border border-text-primary text-text-primary transition-colors duration-[var(--dur-micro)] ease-[var(--ease-weave)] hover:bg-text-primary hover:text-bg-primary max-md:min-h-12 max-md:flex-1 max-md:px-3 max-md:text-[14px] md:size-11 md:flex-none md:text-[14px]'

// Chia sẻ bài. Desktop: ba nút vuông 44 (biểu tượng / "Fb" / "Zl"); mobile: ba nút có chữ. Kết quả báo trong vùng aria-live.
export function ShareButtons({ copy }: { copy: ShareCopy }) {
  const [message, setMessage] = useState('')

  const copyLink = async (ok: string) => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setMessage(ok)
    } catch {
      setMessage('')
    }
  }
  const facebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }
  const zalo = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ url: window.location.href })
      } catch {
        // người dùng đóng hộp chia sẻ: không báo gì
      }
      return
    }
    await copyLink(copy.zaloFallback)
  }

  // Tên truy cập lấy từ chữ đang hiện: mobile là chữ của nút; desktop là biểu tượng/chữ tắt (ẩn khỏi trình đọc) kèm tên đầy đủ sr-only.
  const label = (v: Variant, glyph: React.ReactNode) => (
    <>
      <span className="md:hidden">{v.mobile ?? v.desktop}</span>
      <span className="max-md:hidden">
        <span aria-hidden="true">{glyph}</span>
        <span className="sr-only">{v.desktop ?? v.mobile}</span>
      </span>
    </>
  )

  return (
    <div className="flex flex-col gap-3">
      {copy.label ? <span className="text-[12px] font-semibold tracking-label text-text-muted">{copy.label}</span> : null}
      <div className="flex gap-2">
        <button type="button" className={square} onClick={() => copyLink(copy.copied)}>
          {label(
            copy.copy,
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7.5 10.5a3 3 0 0 0 4.2 0l3-3a3 3 0 0 0-4.2-4.2l-1 1M10.5 7.5a3 3 0 0 0-4.2 0l-3 3a3 3 0 0 0 4.2 4.2l1-1" />
            </svg>,
          )}
        </button>
        <button type="button" className={square} onClick={facebook}>
          {label(copy.facebook, 'Fb')}
        </button>
        <button type="button" className={square} onClick={zalo}>
          {label(copy.zalo, 'Zl')}
        </button>
      </div>
      <p role="status" aria-live="polite" className="min-h-[1em] text-[12px] text-text-secondary">
        {message}
      </p>
    </div>
  )
}

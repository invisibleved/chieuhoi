'use client'

import { useEffect, useState } from 'react'

// Thanh tiến độ đọc: dính đầu trang, theo vị trí cuộn của phần tử #targetId (từ lúc đỉnh bài chạm đỉnh khung nhìn đến lúc đáy bài chạm đáy khung nhìn).
export function ReadingProgress({ label, targetId }: { label: string; targetId: string }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let frame = 0
    const compute = () => {
      frame = 0
      const el = document.getElementById(targetId)
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrolled = -rect.top // quãng đã cuộn qua đỉnh bài
      const span = rect.height - window.innerHeight
      const p = span <= 0 ? (scrolled >= 0 ? 1 : 0) : scrolled / span
      setValue(Math.round(Math.min(1, Math.max(0, p)) * 100))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [targetId])

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className="sticky top-0 z-30 -mb-[3px] h-[3px] bg-transparent"
    >
      <div className="h-full bg-accent" style={{ width: `${value}%` }} />
    </div>
  )
}

'use client'

import { useId, useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'

// Tab theo mẫu APG "tabs with automatic activation": mũi tên vòng quanh, Home/End, roving tabindex.
type TabsProps<K extends string> = {
  label: string
  tabs: { key: K; label: ReactNode; panel: ReactNode }[]
  value: K
  onChange: (k: K) => void
  variant?: 'underline' | 'segmented' | 'responsive'
}

const listClass = {
  underline: 'flex gap-7 border-b border-border-subtle',
  segmented: 'flex border border-border-strong',
  // Dưới 768px: segmented; từ 768px: underline.
  responsive:
    'flex border border-border-strong md:gap-7 md:border-0 md:border-b md:border-border-subtle',
}

const tabBase =
  'cursor-pointer min-h-11 transition-colors duration-[var(--dur-micro)] ease-[var(--ease-weave)]'

const tabClass = {
  underline: {
    on: 'py-3 text-[15px] font-semibold border-b-[3px] border-accent -mb-px',
    off: 'py-3 text-[15px] text-text-secondary',
  },
  segmented: {
    on: 'flex-1 text-[14px] font-medium bg-text-primary text-bg-primary',
    off: 'flex-1 text-[14px] font-medium',
  },
  responsive: {
    on: 'flex-1 text-[14px] font-medium bg-text-primary text-bg-primary md:flex-none md:bg-transparent md:text-text-primary md:py-3 md:text-[15px] md:font-semibold md:border-b-[3px] md:border-accent md:-mb-px',
    off: 'flex-1 text-[14px] font-medium md:flex-none md:py-3 md:text-[15px] md:font-normal md:text-text-secondary',
  },
}

export function Tabs<K extends string>({
  label,
  tabs,
  value,
  onChange,
  variant = 'responsive',
}: TabsProps<K>) {
  const uid = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const idx = Math.max(
    0,
    tabs.findIndex((t) => t.key === value),
  )

  if (tabs.length === 0) return null

  function select(i: number) {
    onChange(tabs[i].key)
    refs.current[i]?.focus()
  }

  function onKeyDown(e: KeyboardEvent) {
    const n = tabs.length
    let next: number
    if (e.key === 'ArrowRight') next = (idx + 1) % n
    else if (e.key === 'ArrowLeft') next = (idx - 1 + n) % n
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = n - 1
    else return
    e.preventDefault()
    select(next)
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className={listClass[variant]} onKeyDown={onKeyDown}>
        {tabs.map((t, i) => {
          const on = i === idx
          return (
            <button
              key={t.key}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${t.key}`}
              aria-selected={on}
              aria-controls={`${uid}-panel-${t.key}`}
              tabIndex={on ? 0 : -1}
              onClick={() => select(i)}
              className={`${tabBase} ${on ? tabClass[variant].on : tabClass[variant].off}`}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={`${uid}-panel-${tabs[idx].key}`}
        aria-labelledby={`${uid}-tab-${tabs[idx].key}`}
        tabIndex={0}
      >
        {tabs[idx].panel}
      </div>
    </div>
  )
}

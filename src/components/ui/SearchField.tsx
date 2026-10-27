'use client'

import type { Variant } from '@/lib/content'
import { useVariantString } from './useVariant'

// Ô tìm kiếm: <label for> thật + input type="search". Biểu tượng kính lúp chỉ có từ md (theo artboard).
export function SearchField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string
  label: string
  placeholder: Variant
  value: string
  onChange: (v: string) => void
}) {
  const ph = useVariantString(placeholder)
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[14px] font-medium">
        {label}
      </label>
      <div className="flex min-h-12 items-center gap-2.5 border border-text-muted bg-bg-raised px-3.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-light">
        <svg aria-hidden="true" className="max-md:hidden" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6" />
          <path d="M12.5 12.5L17 17" />
        </svg>
        <input
          id={id}
          type="search"
          value={value}
          placeholder={ph}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-11 min-w-0 flex-1 bg-transparent text-[15px] text-text-primary outline-none placeholder:text-text-muted"
        />
      </div>
    </div>
  )
}

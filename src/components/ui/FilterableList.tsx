'use client'

import { useMemo, useState, type ReactNode } from 'react'
import type { Variant } from '@/lib/content'
import { normalizeSearch } from '@/lib/search'
import { FilterChips } from './FilterChips'
import { SearchField } from './SearchField'
import { useVariantString } from './useVariant'
import { VariantText } from './VariantText'

// Danh sách lọc theo chip + tìm kiếm trên trình duyệt + "Xem thêm". Server render mọi mục của trang đầu với chip "Tất cả".
// `status` nhận toàn bộ mục khớp bộ lọc/tìm kiếm (không chỉ trang đang hiện), để đếm đúng kết quả.
export function FilterableList<T>({
  items,
  getKey,
  getCategory,
  getSearchText,
  filters,
  filterLabel,
  search,
  pageSize,
  more,
  status,
  empty,
  renderItem,
  listClassName,
}: {
  items: T[]
  getKey: (t: T) => string
  getCategory: (t: T) => string | null
  getSearchText?: (t: T) => string
  filters: { key: string; label: string }[]
  filterLabel: Variant
  search?: { id: string; label: string; placeholder: Variant }
  pageSize?: number
  more?: { label: string; done: string }
  status: (matches: T[]) => Variant
  empty: ReactNode
  renderItem: (t: T, index: number) => ReactNode
  listClassName?: string
}) {
  const [category, setCategory] = useState(filters[0]?.key ?? 'all')
  const [query, setQuery] = useState('')
  const [pages, setPages] = useState(1)
  const chipsLabel = useVariantString(filterLabel)

  const matches = useMemo(() => {
    const q = normalizeSearch(query)
    return items.filter((t) => {
      if (category !== 'all' && getCategory(t) !== category) return false
      if (q && getSearchText && !normalizeSearch(getSearchText(t)).includes(q)) return false
      return true
    })
  }, [items, category, query, getCategory, getSearchText])

  const limit = pageSize ? pageSize * pages : matches.length
  const shown = matches.slice(0, limit)
  const exhausted = shown.length >= matches.length

  return (
    <div className="flex flex-col gap-6">
      {search ? (
        <SearchField
          id={search.id}
          label={search.label}
          placeholder={search.placeholder}
          value={query}
          onChange={(v) => {
            setQuery(v)
            setPages(1)
          }}
        />
      ) : null}
      <FilterChips
        label={chipsLabel}
        options={filters}
        value={category}
        onChange={(k) => {
          setCategory(k)
          setPages(1)
        }}
      />
      <p role="status" className="m-0 text-[14px] text-text-muted">
        <VariantText value={status(matches)} />
      </p>
      {shown.length === 0 ? (
        empty
      ) : (
        <div className={listClassName}>
          {shown.map((t, i) => (
            <div key={getKey(t)} className="contents">
              {renderItem(t, i)}
            </div>
          ))}
        </div>
      )}
      {more && pageSize && matches.length > 0 ? (
        <div className="flex flex-col items-start gap-3">
          <button
            type="button"
            aria-disabled={exhausted ? 'true' : undefined}
            onClick={() => {
              if (!exhausted) setPages((p) => p + 1)
            }}
            className={`inline-flex min-h-12 items-center border px-6 text-[15px] font-medium max-md:w-full max-md:justify-center ${exhausted ? 'cursor-default border-border-soft text-text-muted' : 'cursor-pointer border-text-primary text-text-primary hover:bg-text-primary hover:text-bg-primary'}`}
          >
            {more.label}
          </button>
          {exhausted ? <p className="m-0 text-[14px] text-text-muted">{more.done}</p> : null}
        </div>
      ) : null}
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ArchiveItemView } from '@/lib/content'
import { ContentImage } from '@/components/content/ContentImage'
import { FilterChips } from '@/components/ui/FilterChips'
import { LinkArrow } from '@/components/ui/LinkArrow'

type ArchiveTeaserProps = { items: ArchiveItemView[] }

type FilterKey = 'all' | NonNullable<ArchiveItemView['category']>

const OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'village', label: 'Làng quê' },
  { key: 'weaving', label: 'Nghề dệt' },
  { key: 'people', label: 'Con người' },
  { key: 'products', label: 'Sản phẩm' },
  { key: 'memory', label: 'Ký ức' },
  { key: 'history', label: 'Tư liệu lịch sử' },
]

// Vị trí ô trên lưới desktop 4 cột x 2 hàng; mobile: ô 1 rộng 2 cột cao 180, ô 2-3 cao 210, ô 4-5 chỉ hiện từ md.
const SLOTS = [
  'col-span-2 block h-[180px] md:h-auto',
  'block h-[210px] md:row-span-2 md:h-auto',
  'block h-[210px] md:h-auto',
  'hidden md:block',
  'hidden md:block',
] as const

export function ArchiveTeaser({ items }: ArchiveTeaserProps) {
  const [filter, setFilter] = useState<FilterKey>('all')
  if (items.length === 0) return null
  const hasHistory = items.some((i) => i.category === 'history')
  const tiles = items
    .filter((i) => i.image.docNumber !== null)
    .filter((i) => filter === 'all' || i.category === filter)
    .slice(0, 5)

  return (
    <section className="flex flex-col gap-5 bg-bg-deep px-5 py-14 text-text-on-dark md:gap-12 md:px-20 md:py-[120px]">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="flex flex-col gap-5 md:gap-[18px]">
          <span className="text-eyebrow font-semibold tracking-[.22em] text-accent-on-dark md:tracking-[.24em]">THƯ VIỆN</span>
          <h2 className="font-display text-h2 leading-[1.15] font-normal md:leading-[1.1]">Ký ức qua từng khung hình.</h2>
        </div>
        {hasHistory ? null : (
          <p className="hidden max-w-[320px] text-right text-[14px] leading-[1.55] text-text-deep-muted md:block">
            Chưa có ảnh tư liệu lịch sử. Nếu gia đình bạn còn giữ ảnh cũ, hãy góp cùng làng.
          </p>
        )}
      </div>
      <FilterChips tone="dark" label="Lọc theo nhóm ảnh" options={OPTIONS} value={filter} onChange={setFilter} />
      <div className="grid grid-cols-2 gap-2 md:auto-rows-[280px] md:grid-cols-4 md:gap-4">
        {tiles.map((item, i) => {
          const code = item.image.code as string
          const cat = item.categoryLabel
          return (
            <Link key={code} href={`/thu-vien?anh=${code}`} className={`relative overflow-hidden ${SLOTS[i]}`}>
              <ContentImage image={item.image} size="card" sizes="(min-width: 768px) 40vw, 100vw" className="h-full" wrapperClassName="h-full" />
              <span className="absolute top-2 left-2 bg-[rgba(35,42,37,.88)] px-2.5 py-1.5 text-[12px] tracking-[.1em] md:top-3 md:left-3 md:tracking-[.12em]">
                TL · {item.image.docNumber}
                {cat ? <span className="hidden md:inline"> · {cat.toLocaleUpperCase('vi')}</span> : null}
              </span>
            </Link>
          )
        })}
        <div className="col-span-2 flex flex-col items-center justify-center gap-1 border border-dashed border-[rgba(243,235,221,.4)] p-[18px] text-center md:col-span-1 md:gap-2.5 md:p-5">
          <span className="font-display text-[20px] md:text-[24px]">Ảnh xưa của làng</span>
          <span className="text-[13px] text-text-deep-muted md:text-[14px]">Ô chờ tư liệu lịch sử</span>
        </div>
      </div>
      <LinkArrow tone="dark" href="/thu-vien" className="self-start">
        Mở thư viện ảnh
      </LinkArrow>
    </section>
  )
}

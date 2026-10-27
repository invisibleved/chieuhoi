'use client'

import { useCallback, useRef, useState } from 'react'
import type { ArchiveItemView, ArchivePageView } from '@/lib/content'
import { fillTemplate } from '@/lib/template'
import { EmptyState } from '@/components/ui/Feedback'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { FilterChips } from '@/components/ui/FilterChips'
import { Lightbox } from '@/components/ui/Lightbox'
import { isPlainClick } from '@/components/ui/plainClick'
import { Segmented } from '@/components/ui/Segmented'
import { hasVariant, VariantText } from '@/components/ui/VariantText'
import Link from 'next/link'
import { ContentImage } from './ContentImage'
import { ArchiveChip, docCode } from './DocumentLabel'

type EraKey = ArchivePageView['eras'][number]['key']

// Hình dạng ô theo artboard: lặp theo mảng. Lớp Tailwind viết nguyên chữ để bộ quét nhận ra.
// Desktop (4 cột, 14 mẫu): c = rộng 2 cột, r = cao 2 hàng. Mobile (2 cột, 10 mẫu).
const DESKTOP_SPANS = ['cr', '', 'r', '', 'c', 'r', '', 'r', '', 'c', '', 'r', '', 'c'] as const
const MOBILE_SPANS = ['c', '', 'r', '', '', 'c', '', 'r', '', ''] as const

function spanClass(i: number): string {
  const d = DESKTOP_SPANS[i % DESKTOP_SPANS.length]
  const m = MOBILE_SPANS[i % MOBILE_SPANS.length]
  return [
    m === 'c' ? 'col-span-2' : '',
    m === 'r' ? 'row-span-2' : '',
    d.includes('c') ? 'md:col-span-2' : 'md:col-span-1',
    d.includes('r') ? 'md:row-span-2' : 'md:row-span-1',
  ]
    .filter(Boolean)
    .join(' ')
}

const hrefFor = (code: string) => `/thu-vien?anh=${code}`

// Giữ pathname và các tham số khác, chỉ đặt hoặc bỏ `anh`.
function syncUrl(code: string | null) {
  const url = new URL(window.location.href)
  if (code) url.searchParams.set('anh', code)
  else url.searchParams.delete('anh')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
}

export type ArchiveGalleryProps = {
  page: ArchivePageView
  /** Mã `?anh=` từ server; khớp (không phân biệt hoa thường) thì mở sẵn ở lần render đầu. */
  initialCode: string | null
}

// Bộ lọc + lưới + hộp xem ảnh của /thu-vien. Giữ state cat / era / open; URL `?anh=` đồng bộ bằng replaceState.
export function ArchiveGallery({ page, initialCode }: ArchiveGalleryProps) {
  const { copy, items } = page
  const [cat, setCat] = useState('all')
  const [era, setEra] = useState<EraKey>('all')
  const [openCode, setOpenCode] = useState<string | null>(() => {
    if (!initialCode) return null
    const wanted = initialCode.toLowerCase()
    return items.find((i) => i.code.toLowerCase() === wanted)?.code ?? null
  })
  const gridRef = useRef<HTMLDivElement>(null)
  const openerCode = useRef<string | null>(null)
  const returnRef = useRef<HTMLElement | null>(null)

  const shown = items.filter((i) => (cat === 'all' || i.category === cat) && (era === 'all' || i.era === era))
  const index = openCode ? shown.findIndex((i) => i.code === openCode) : -1
  const current: ArchiveItemView | null = index >= 0 ? shown[index] : null

  const open = useCallback((code: string, opener: boolean) => {
    if (opener) openerCode.current = code
    setOpenCode(code)
    syncUrl(code)
  }, [])
  const close = () => {
    const code = openerCode.current ?? openCode
    returnRef.current = code ? (Array.from(gridRef.current?.children ?? []).find((el) => (el as HTMLElement).dataset.code === code) as HTMLElement | undefined) ?? null : null
    openerCode.current = null
    setOpenCode(null)
    syncUrl(null)
  }
  const go = (delta: number) => {
    if (index < 0) return
    open(shown[(index + delta + shown.length) % shown.length].code, false)
  }
  const refilter = (apply: () => void) => {
    returnRef.current = null // đổi bộ lọc: focus đang ở chip, không kéo về ô ảnh
    openerCode.current = null
    apply()
    if (openCode) {
      setOpenCode(null)
      syncUrl(null)
    }
  }

  const t = (s: string | null) => s ?? ''
  const noOld = era === 'old' && !page.hasOld
  const count = fillTemplate(t(copy.count), { n: shown.length }) + (noOld ? t(copy.noOld) : '')
  const lb = copy.lightbox

  const meta: { key: string; label: string | null; node: React.ReactNode; desktopOnly?: boolean }[] = current
    ? [
        { key: 'takenAt', label: lb.meta.takenAt, node: current.takenAt },
        { key: 'photographer', label: lb.meta.photographer, node: current.photographer },
        { key: 'source', label: lb.meta.source, node: current.source, desktopOnly: true },
        { key: 'rights', label: lb.meta.rights, node: hasVariant(current.rights) ? <VariantText value={current.rights} /> : null },
        {
          key: 'related',
          label: lb.meta.related,
          node: current.related ? <Link href={current.related.href} className="text-accent-on-dark hover:underline">{current.related.label}</Link> : null,
          desktopOnly: true,
        },
      ].filter((r) => r.node)
    : []

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="flex flex-col gap-4">
        <FilterChips
          tone="dark"
          label={t(copy.filter.label)}
          options={page.categories}
          value={cat}
          onChange={(k) => refilter(() => setCat(k))}
        />
        <div className="flex items-center justify-between">
          <div className="max-md:hidden">
            <Segmented tone="dark" label={t(copy.filter.eraLabel)} options={page.eras} value={era} onChange={(k) => refilter(() => setEra(k))} />
          </div>
          <p role="status" className="m-0 text-[13px] text-text-deep-muted md:text-[14px]">{count}</p>
        </div>
      </div>

      {shown.length > 0 ? (
        <div ref={gridRef} className="grid grid-flow-dense auto-rows-[160px] grid-cols-2 gap-2 md:auto-rows-[220px] md:grid-cols-4 md:gap-3">
          {shown.map((item, i) => (
            <a
              key={item.code}
              data-code={item.code}
              href={hrefFor(item.code)}
              // Tên đọc chứa cả chữ hiển thị trên chip (mã · chủ đề) để đạt WCAG 2.5.3 / axe label-content-name-mismatch.
              aria-label={[fillTemplate(t(copy.open), { title: item.title ?? item.code }), [docCode(t(copy.docLabel), item.image.docNumber ?? item.code), item.categoryLabel].filter(Boolean).join(' · ')].join(', ')}
              onClick={(e) => {
                if (!isPlainClick(e)) return
                e.preventDefault()
                open(item.code, true)
              }}
              className={`group relative block cursor-zoom-in overflow-hidden ${spanClass(i)}`}
            >
              <ContentImage
                image={{ ...item.image, alt: '' }}
                size="card"
                sizes="(min-width: 768px) 25vw, 50vw"
                className="h-full motion-safe:transition-transform motion-safe:duration-[var(--dur-ui)] motion-safe:group-hover:scale-[1.03]"
                wrapperClassName="h-full"
                notesPosition="top-right"
              />
              <ArchiveChip overlay label={t(copy.docLabel)} code={item.image.docNumber ?? item.code} category={item.categoryLabel} className="absolute bottom-1.5 left-1.5 md:bottom-2.5 md:left-2.5" />
            </a>
          ))}
        </div>
      ) : (
        <EmptyState tone="dark" size="lg" title={t(copy.empty.title)} body={<VariantText value={copy.empty.body} />} action={copy.empty.action.label ? { href: t(copy.empty.action.href), label: copy.empty.action.label } : undefined} />
      )}

      {current ? (
        <Lightbox
          label={t(lb.label)}
          position={
            <>
              {fillTemplate(t(lb.position), { i: index + 1, n: shown.length })}
              <span className="max-md:hidden">{lb.keys}</span>
            </>
          }
          closeHref="/thu-vien"
          prevHref={hrefFor(shown[(index - 1 + shown.length) % shown.length].code)}
          nextHref={hrefFor(shown[(index + 1) % shown.length].code)}
          onClose={close}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
          closeLabel={t(lb.close)}
          prevLabel={t(lb.prev)}
          nextLabel={t(lb.next)}
          swipeHint={t(lb.swipe)}
          returnFocusRef={returnRef}
          image={<ContentImage image={current.image} size="full" sizes="(min-width: 768px) 70vw, 100vw" fit="contain" className="h-full" wrapperClassName="h-full w-full" priority />}
        >
          <Eyebrow tone="dark" tracking="label" uppercase>
            {[docCode(t(copy.docLabel), current.image.docNumber ?? current.code), current.categoryLabel].filter(Boolean).join(' · ')}
          </Eyebrow>
          {current.title ? <h2 className="m-0 font-display text-[26px] leading-[1.2] font-normal md:text-[32px]">{current.title}</h2> : null}
          {current.description ? <p className="m-0 text-[15px] leading-[1.6] text-text-on-dark-muted md:leading-[1.65]">{current.description}</p> : null}
          {meta.length > 0 ? (
            <dl className="m-0 grid grid-cols-[100px_1fr] gap-y-2 text-[14px] leading-[1.5] md:grid-cols-[110px_1fr] md:gap-y-2.5 md:border-t md:border-border-on-dark-soft md:pt-4">
              {meta.map((r) => (
                <div key={r.key} className={`col-span-2 grid grid-cols-subgrid ${r.desktopOnly ? 'max-md:hidden' : ''}`}>
                  <dt className="text-text-deep-muted">{r.label}</dt>
                  <dd className="m-0">{r.node}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Lightbox>
      ) : null}
    </div>
  )
}

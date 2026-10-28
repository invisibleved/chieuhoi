'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ProductPageView, ProductView } from '@/lib/content'
import { fillTemplate } from '@/lib/template'
import { PatternMarker } from '@/components/ui/PatternMarker'
import { Segmented } from '@/components/ui/Segmented'
import { VariantText } from '@/components/ui/VariantText'
import { AnnotationNote } from './AnnotationNote'
import { ContentImage } from './ContentImage'
import { ShotNeeded } from './ShotNeeded'
import { StageHint } from './StageHint'

type PatternExplorerProps = {
  product: ProductView
  copy: ProductPageView['copy']['detail']
  /** Khối tiêu đề của trang: trên cột danh sách ở desktop, sau panel ở mobile. */
  aside?: ReactNode
}

const ZOOM = 2.2

// Sân khấu ảnh hiện vật: ảnh lớn, ảnh nhỏ, điểm hoa văn; chọn điểm thì phóng ảnh quanh điểm và hiện chú thích.
// Điểm chỉ nằm trên ảnh 1. Không có JS: <noscript> liệt kê mọi chú thích.
export function PatternExplorer({ product, copy, aside }: PatternExplorerProps) {
  const { images, annotations, hasPattern, slug } = product
  const { explore } = copy
  const [imgIdx, setImgIdx] = useState(0)
  const [sel, setSel] = useState<number | null>(null)

  const current = annotations.find((a) => a.n === sel) ?? null
  const zoomed = hasPattern && current !== null
  const image = images[imgIdx] ?? images[0] ?? null
  const showMarkers = hasPattern && imgIdx === 0

  // WCAG 2.4.3: đóng chi tiết (nút, Esc) thì trả focus về điểm vừa chọn; điểm không hiện thì về nút trong danh sách.
  const returnN = useRef<number | null>(null)
  const markerEls = useRef(new Map<number, HTMLButtonElement>())
  const listEls = useRef(new Map<number, HTMLButtonElement>())
  const closeZoom = () => {
    returnN.current = sel
    setSel(null)
  }

  useEffect(() => {
    if (!zoomed) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeZoom()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // closeZoom đọc `sel` từ closure: đăng ký lại mỗi khi đổi điểm.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomed, sel])

  useEffect(() => {
    const n = returnN.current
    if (sel !== null || n === null) return
    returnN.current = null
    const shown = (el: HTMLElement | undefined) => (el && el.getClientRects().length > 0 ? el : null)
    ;(shown(markerEls.current.get(n)) ?? shown(listEls.current.get(n)))?.focus()
  }, [sel])

  const pick = (n: number) => {
    setImgIdx(0)
    setSel(sel === n ? null : n)
  }
  const stageStyle = zoomed
    ? { transform: `scale(${ZOOM})`, transformOrigin: `${current.x}% ${current.y}%` }
    : { transform: 'scale(1)', transformOrigin: '50% 50%' }

  return (
    <div className="flex flex-col md:col-span-12 md:grid md:grid-cols-12 md:grid-rows-[auto_auto_1fr] md:gap-x-6 md:gap-y-[18px]">
      {/* Đứng đầu DOM để h1 đọc trước sân khấu; mobile đưa xuống cuối bằng order (ảnh → nút → chú thích → tiêu đề). */}
      {aside ? <div className="mt-8 max-md:order-last md:col-span-3 md:col-start-10 md:row-start-1 md:mt-0">{aside}</div> : null}
      <div className="flex flex-col gap-3.5 md:col-span-8 md:col-start-1 md:row-span-3 md:row-start-1">
        <div className="relative -mx-5 h-[340px] overflow-hidden bg-bg-ink md:mx-0 md:h-[620px]">
          {image ? (
            <ContentImage
              image={image}
              size="full"
              sizes="(min-width: 768px) 66vw, 100vw"
              priority={imgIdx === 0}
              className="block h-full max-md:object-[30%_50%] motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-weave"
              wrapperClassName="h-full"
              imageStyle={stageStyle}
              notesPosition="bottom-right"
            />
          ) : (
            <ShotNeeded tone="dark" className="size-full" />
          )}
          {showMarkers
            ? annotations.map((a) => (
                <PatternMarker
                  key={a.n}
                  n={a.n}
                  x={a.x}
                  y={a.y}
                  pressed={a.n === sel}
                  hidden={zoomed && a.n !== sel}
                  label={a.markerLabel}
                  buttonRef={(el) => {
                    if (el) markerEls.current.set(a.n, el)
                    else markerEls.current.delete(a.n)
                  }}
                  onClick={() => pick(a.n)}
                />
              ))
            : null}
          {image && hasPattern ? <StageHint>{imgIdx === 0 ? explore.hint : explore.hintOther}</StageHint> : null}
          {zoomed ? (
            <button
              type="button"
              onClick={closeZoom}
              className="absolute right-4 top-4 z-10 inline-flex min-h-11 cursor-pointer items-center bg-bg-primary px-4 text-[14px] font-medium text-text-primary focus-visible:outline-focus-dark"
            >
              {explore.close}
            </button>
          ) : null}
        </div>
        {images.length > 1 ? (
          <div role="group" aria-label={copy.imagesLabel ?? undefined} className="grid grid-cols-4 gap-3 max-md:hidden">
            {images.map((im, k) => (
              <button
                key={im.url + k}
                type="button"
                aria-pressed={k === imgIdx}
                aria-label={fillTemplate(copy.thumbLabel ?? '', { n: k + 1 })}
                onClick={() => {
                  setImgIdx(k)
                  setSel(null)
                }}
                className={`block cursor-pointer p-0 ${k === imgIdx ? 'outline outline-2 outline-offset-[3px] outline-accent' : 'opacity-75'}`}
              >
                <ContentImage image={{ ...im, alt: '' }} size="thumb" sizes="16vw" className="block h-[110px]" showNotes={false} />
              </button>
            ))}
          </div>
        ) : null}
        {product.imageCaptions[imgIdx] ? <p className="m-0 text-[13px] text-text-muted max-md:hidden">{product.imageCaptions[imgIdx]}</p> : null}
      </div>

      {hasPattern ? (
        <>
          <div className="md:hidden">
            <Segmented
              label={explore.pickerLabel ?? ''}
              stretch
              value={sel === null ? '' : String(sel)}
              onChange={(k) => pick(Number(k))}
              options={annotations.map((a) => ({
                key: String(a.n),
                label: a.pickerLabel,
              }))}
            />
          </div>
          <div className="flex flex-col gap-1 max-md:hidden md:col-span-3 md:col-start-10 md:row-start-2">
            <span className="text-[12px] font-semibold tracking-label text-text-muted">{explore.title}</span>
            {annotations.map((a) => {
              const on = a.n === sel
              return (
                <button
                  key={a.n}
                  ref={(el) => {
                    if (el) listEls.current.set(a.n, el)
                    else listEls.current.delete(a.n)
                  }}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pick(a.n)}
                  className="flex w-full cursor-pointer items-baseline gap-3.5 border-t border-border-soft py-3.5 text-left"
                >
                  <span className={`w-5 text-[14px] font-semibold ${on ? 'text-accent' : 'text-text-muted'}`}>{a.n}</span>
                  {a.title ? <span className={on ? 'font-display text-[24px] text-accent' : 'text-[16px] text-text-primary'}>{a.title}</span> : null}
                </button>
              )
            })}
          </div>
          <div
            role="region"
            aria-live="polite"
            aria-label={explore.regionLabel ?? undefined}
            className="mt-4 md:col-span-3 md:col-start-10 md:row-start-3 md:mt-0 md:self-start"
          >
            {current ? (
              <AnnotationNote annotation={current} productSlug={slug} variant="panel" />
            ) : explore.idle ? (
              <p className="m-0 text-[14px] leading-[1.6] text-text-secondary">
                <VariantText value={explore.idle} />
              </p>
            ) : null}
          </div>
          <noscript>
            <div className="flex flex-col gap-4 md:col-span-3 md:col-start-10">
              {annotations.map((a) => (
                <AnnotationNote key={a.n} annotation={a} productSlug={slug} variant="panel" />
              ))}
            </div>
          </noscript>
        </>
      ) : null}

    </div>
  )
}

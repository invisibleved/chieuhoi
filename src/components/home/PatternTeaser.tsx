'use client'

import { useState } from 'react'
import type { ProductView } from '@/lib/content'
import { ContentImage } from '@/components/content/ContentImage'
import { FootnoteRef } from '@/components/content/Sources'

// Ảnh sản phẩm có các điểm hoa văn; bấm điểm để đổi chú thích. Trạng thái đầu (annotations[0]) render sẵn ở server.
export function PatternTeaser({ product }: { product: ProductView }) {
  const { annotations, images, slug } = product
  const [openN, setOpenN] = useState(annotations[0]?.n)
  const open = annotations.find((a) => a.n === openN) ?? annotations[0]
  if (!open || images.length === 0) return null

  // Số nguồn theo thứ tự xuất hiện của các sourceId khác nhau; trang hiện vật (Phase 5) phải đánh số giống vậy.
  const sourceIds = [...new Set(annotations.map((a) => a.sourceId).filter((id): id is string => id !== null))]
  const sourceN = open.sourceId ? sourceIds.indexOf(open.sourceId) + 1 : 0
  const label = (n: number, title: string | null) => (title ? `${n} · ${title}` : `${n}`)

  return (
    <>
      <figure className="relative -mx-5 m-0 md:col-span-8 md:mx-0">
        <ContentImage image={images[0]} size="wide" sizes="(min-width: 768px) 66vw, 100vw" className="block h-[300px] md:h-[560px]" />
        {annotations.map((a) => {
          const on = a.n === open.n
          return (
            <button
              key={a.n}
              type="button"
              aria-pressed={on}
              aria-label={a.title ? `Chi tiết ${a.n}: ${a.title.toLocaleLowerCase('vi')}` : `Chi tiết ${a.n}`}
              onClick={() => setOpenN(a.n)}
              style={{ left: `${a.x}%`, top: `${a.y}%` }}
              className={`absolute size-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 font-sans text-[15px] font-semibold motion-safe:transition-transform motion-safe:hover:scale-[1.08] ${
                on ? 'border-bg-primary bg-accent text-bg-primary ring-[6px] ring-[rgba(160,68,53,.35)]' : 'border-accent bg-bg-primary text-accent'
              }`}
            >
              {a.n}
            </button>
          )
        })}
        <figcaption className="absolute left-5 top-5 hidden items-center gap-2.5 bg-[rgba(40,39,36,.82)] px-3.5 py-2.5 text-[13px] text-bg-primary md:flex">
          <span aria-hidden="true" className="check size-2.5" />
          Chạm vào các điểm để xem chi tiết đường dệt
        </figcaption>
      </figure>
      <div className="relative -mt-10 flex flex-col gap-3 md:col-span-3 md:col-start-10 md:mt-0 md:justify-center md:gap-[22px]">
        <p className="m-0 hidden text-[12px] font-semibold tracking-[.2em] text-text-muted-alt md:block">KHÁM PHÁ ĐƯỜNG DỆT</p>
        <div
          aria-live="polite"
          className="flex flex-col gap-2 border-t-[3px] border-accent bg-bg-primary p-[18px] md:gap-2.5 md:border-l-[3px] md:border-t-0 md:bg-transparent md:p-0 md:pl-[18px]"
        >
          <p className="m-0 font-display text-[24px] leading-[1.2] md:text-[30px]">{label(open.n, open.title)}</p>
          <p className="m-0 text-[15px] leading-[1.6] text-text-secondary md:text-[16px] md:leading-[1.65]">
            {open.body}
            {sourceN > 0 ? <FootnoteRef n={sourceN} href={`/san-pham/${slug}#nguon-${sourceN}`} /> : null}
          </p>
        </div>
        {annotations
          .filter((a) => a.n !== open.n)
          .map((a) => (
            <p key={a.n} className="m-0 hidden pl-[21px] text-[16px] text-text-muted-alt md:block">
              {label(a.n, a.title)}
            </p>
          ))}
      </div>
    </>
  )
}

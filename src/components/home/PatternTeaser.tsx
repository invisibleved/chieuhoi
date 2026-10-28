'use client'

import { useState } from 'react'
import type { ProductView } from '@/lib/content'
import { AnnotationNote } from '@/components/content/AnnotationNote'
import { ContentImage } from '@/components/content/ContentImage'
import { StageHint } from '@/components/content/StageHint'
import { PatternMarker } from '@/components/ui/PatternMarker'

// Ảnh sản phẩm có các điểm hoa văn; bấm điểm để đổi chú thích. Trạng thái đầu (annotations[0]) render sẵn ở server.
export function PatternTeaser({ product }: { product: ProductView }) {
  const { annotations, primaryImage, slug } = product
  const [openN, setOpenN] = useState(annotations[0]?.n)
  const open = annotations.find((a) => a.n === openN) ?? annotations[0]
  if (!open || !product.hasPattern || !primaryImage) return null

  return (
    <>
      <figure className="relative -mx-5 m-0 md:col-span-8 md:mx-0">
        <ContentImage image={primaryImage} size="wide" sizes="(min-width: 768px) 66vw, 100vw" className="block h-[300px] md:h-[560px]" />
        {annotations.map((a) => (
          <PatternMarker
            key={a.n}
            n={a.n}
            x={a.x}
            y={a.y}
            pressed={a.n === open.n}
            label={a.markerLabel}
            onClick={() => setOpenN(a.n)}
          />
        ))}
        <StageHint as="figcaption" className="left-5 top-5">Chạm vào các điểm để xem chi tiết đường dệt</StageHint>
      </figure>
      <div className="relative -mt-10 flex flex-col gap-3 md:col-span-3 md:col-start-10 md:mt-0 md:justify-center md:gap-[22px]">
        <p className="m-0 hidden text-[12px] font-semibold tracking-label text-text-muted-alt md:block">KHÁM PHÁ ĐƯỜNG DỆT</p>
        <div aria-live="polite">
          <AnnotationNote annotation={open} productSlug={slug} variant="teaser" />
        </div>
        {annotations
          .filter((a) => a.n !== open.n)
          .map((a) => (
            <p key={a.n} className="m-0 hidden pl-[21px] text-[16px] text-text-muted-alt md:block">
              {a.heading}
            </p>
          ))}
      </div>
    </>
  )
}

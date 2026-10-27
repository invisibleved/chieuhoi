import type { ReactNode } from 'react'
import type { CraftStepView, Variant } from '@/lib/content'
import { ContentImage } from './ContentImage'
import { DocumentLabel, DocumentLine } from './DocumentLabel'
import { ShotNeeded } from './ShotNeeded'

type CraftStageProps = {
  step: CraftStepView
  /** Phóng ảnh quanh điểm nhấn; nơi không có nút phóng (trang chủ) để mặc định false. */
  zoomed?: boolean
  /** Nhãn mã tư liệu: desktop "TƯ LIỆU", mobile "TL" (copy). */
  docLabel: Variant
  /** Tiền tố tác giả ảnh, ví dụ "Ảnh: " (copy). */
  photoPrefix: string | null
  /** journey: sân khấu trang Nghề dệt chiếu (có dòng nhãn mobile); teaser: khối công đoạn trang chủ. */
  size?: 'journey' | 'teaser'
  className?: string
  /** Lớp phủ trong khung (nút phóng trên mobile). */
  children?: ReactNode
}

const sizes = {
  journey: {
    frame: 'h-[300px] md:h-[560px]',
    sizes: '(min-width: 768px) 50vw, 100vw',
    labelPos: 'bottom-4 left-4 max-w-[360px]',
    labelPad: 'gap-[3px] px-3.5 py-2.5',
    line: true,
  },
  teaser: {
    frame: 'h-[280px] md:h-[520px]',
    sizes: '(min-width: 768px) 58vw, 100vw',
    labelPos: 'bottom-5 left-5',
    labelPad: 'gap-1 px-3.5 py-3',
    line: false,
  },
} as const

// Dòng chú thích: tên công đoạn · Ảnh: tác giả.
function captionOf(step: CraftStepView, photoPrefix: string | null) {
  return [step.title, step.image?.photographer ? `${photoPrefix ?? ''}${step.image.photographer}` : null].filter(Boolean).join(' · ')
}

// Sân khấu ảnh của một công đoạn: ảnh phủ khung (phóng quanh điểm nhấn khi zoomed) hoặc khung "ảnh cần chụp".
export function CraftStage({ step, zoomed = false, docLabel, photoPrefix, size = 'journey', className, children }: CraftStageProps) {
  const s = sizes[size]
  const num = step.image?.docNumber ?? null
  const caption = captionOf(step, photoPrefix)
  return (
    <figure className={['relative m-0 flex flex-col gap-4', className].filter(Boolean).join(' ')}>
      <div className={`relative overflow-hidden bg-bg-deep max-md:-mx-5 ${s.frame}`}>
        {step.image ? (
          <div
            data-testid="stage-zoom"
            className="absolute inset-0 transition-transform duration-[250ms] ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none"
            style={{ transformOrigin: `${step.focus[0]}% ${step.focus[1]}%`, transform: `scale(${zoomed ? 1.9 : 1})` }}
          >
            <ContentImage
              image={step.image}
              size="full"
              sizes={s.sizes}
              className="h-full"
              wrapperClassName="h-full"
              objectPosition={`${step.focus[0]}% ${step.focus[1]}%`}
            />
          </div>
        ) : (
          <ShotNeeded tone="dark" description={step.shotNeeded ?? undefined} className="absolute inset-3 md:inset-0 md:p-12" />
        )}
        {children}
      </div>
      {step.image ? (
        <figcaption className={`absolute hidden md:block ${s.labelPos}`}>
          <DocumentLabel variant="overlay" size="sm" label={docLabel.desktop} code={num} title={caption} className={s.labelPad} />
        </figcaption>
      ) : null}
      {step.image && s.line ? <DocumentLine tone="dark" label={docLabel.mobile} code={num} caption={caption} className="-mt-1.5 md:hidden" /> : null}
    </figure>
  )
}

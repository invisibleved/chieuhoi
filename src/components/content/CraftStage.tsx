import type { ReactNode } from 'react'
import type { CraftStepView } from '@/lib/content'
import { ContentImage } from './ContentImage'
import { ShotNeeded } from './ShotNeeded'

type CraftStageProps = {
  step: CraftStepView
  zoomed: boolean
  docLabel: { desktop: string | null; mobile: string | null }
  className?: string
  /** Lớp phủ trong khung (nút phóng trên mobile). */
  children?: ReactNode
}

// Dòng chú thích: tên công đoạn · Ảnh: tác giả (cùng quy tắc với CraftTeaser).
function captionOf(step: CraftStepView) {
  return [step.title, step.image?.photographer ? `Ảnh: ${step.image.photographer}` : null].filter(Boolean).join(' · ')
}

// Sân khấu ảnh của một công đoạn: ảnh phủ khung (phóng quanh điểm nhấn khi zoomed) hoặc khung "ảnh cần chụp".
export function CraftStage({ step, zoomed, docLabel, className, children }: CraftStageProps) {
  const num = step.image?.docNumber ?? null
  const caption = captionOf(step)
  return (
    <figure className={['flex flex-col gap-4', className].filter(Boolean).join(' ')}>
      <div className="relative h-[300px] overflow-hidden bg-bg-deep md:h-[560px]">
        {step.image ? (
          <div
            data-testid="stage-zoom"
            className="absolute inset-0 transition-transform duration-[250ms] ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none"
            style={{ transformOrigin: `${step.focus[0]}% ${step.focus[1]}%`, transform: `scale(${zoomed ? 1.9 : 1})` }}
          >
            <ContentImage
              image={step.image}
              size="full"
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-full"
              wrapperClassName="h-full"
              objectPosition={`${step.focus[0]}% ${step.focus[1]}%`}
            />
          </div>
        ) : (
          <ShotNeeded tone="dark" description={step.shotNeeded ?? undefined} className="absolute inset-3 md:inset-0 md:p-12" />
        )}
        {step.image ? (
          <figcaption className="absolute bottom-4 left-4 hidden max-w-[360px] flex-col gap-[3px] bg-bg-primary px-3.5 py-2.5 text-[13px] leading-[1.45] text-text-primary md:flex">
            {num && docLabel.desktop ? <span className="text-[12px] font-semibold tracking-label text-text-muted">{`${docLabel.desktop} · ${num}`}</span> : null}
            {caption}
          </figcaption>
        ) : null}
        {children}
      </div>
      {step.image ? (
        <p className="-mt-1.5 text-[12px] tracking-[.14em] text-text-on-dark-muted md:hidden">
          {[num && docLabel.mobile ? `${docLabel.mobile} · ${num}` : null, caption].filter(Boolean).join(' · ')}
        </p>
      ) : null}
    </figure>
  )
}

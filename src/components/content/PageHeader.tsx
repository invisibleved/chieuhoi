import type { ReactNode } from 'react'
import type { PageIntroView } from '@/lib/content'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Eyebrow } from '@/components/ui/Eyebrow'

type PageHeaderProps = {
  /** Đường dẫn đã có nhãn (từ copy); mục cuối là trang hiện tại. */
  crumbs: { label: string; href?: string }[]
  intro: PageIntroView
  /** Ghi chú dưới lead (ví dụ khung "sẽ được xác minh"). */
  note?: ReactNode
  /** Cột phải (ảnh chính của trang). */
  aside?: ReactNode
  /** wide: cột 8–12 (Nghề dệt chiếu); narrow: cột 9–12 (Làng Hới). */
  asideSpan?: 'wide' | 'narrow'
  /** Ghi đè cỡ chữ h1 (Làng Hới: 40/76). */
  titleClassName?: string
}

const asideSpans = { wide: 'md:col-span-5 md:col-start-8', narrow: 'md:col-span-4 md:col-start-9' } as const

// Đầu trang con: đường dẫn, eyebrow, h1 nhiều dòng, lead, ghi chú; cột phải tuỳ chọn.
export function PageHeader({ crumbs, intro, note, aside, asideSpan = 'wide', titleClassName = 'text-[38px] md:text-[70px]' }: PageHeaderProps) {
  const lines = (intro.title ?? '').split('\n')
  return (
    <section className="flex flex-col gap-4 px-5 pt-5 pb-10 md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-10 md:px-20 md:pt-10 md:pb-24">
      <div className="-my-1 md:col-span-12 md:my-0">
        <Breadcrumb items={crumbs} />
      </div>
      <div className="flex flex-col gap-[18px] md:col-span-7 md:gap-6 md:pt-6">
        {intro.eyebrow ? (
          <Eyebrow as="p" rule className="mt-2 md:mt-0">
            {intro.eyebrow}
          </Eyebrow>
        ) : null}
        <h1 className={`font-display leading-[1.15] font-normal md:leading-[1.12] ${titleClassName}`}>
          {lines.map((line, i) => (
            <span key={i}>
              {i > 0 ? <br /> : null}
              {line}
            </span>
          ))}
        </h1>
        {intro.lead ? <p className="max-w-[640px] font-serif text-[17px] leading-[1.7] md:text-[22px]">{intro.lead}</p> : null}
        {note}
      </div>
      {aside ? <div className={asideSpans[asideSpan]}>{aside}</div> : null}
    </section>
  )
}

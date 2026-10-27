'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import type { CraftStepView, Mode } from '@/lib/content'
import { ContentImage } from '@/components/content/ContentImage'
import { ShotNeeded } from '@/components/content/ShotNeeded'
import { LinkArrow } from '@/components/ui/LinkArrow'
import { PagerButton } from '@/components/ui/PagerButton'
import { ScrollStrip } from '@/components/ui/ScrollStrip'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { StepProgress } from '@/components/ui/StepProgress'

type CraftTeaserProps = { steps: CraftStepView[]; mode: Mode }

const pad = (n: number) => String(n).padStart(2, '0')
const VERIFY_NOTE = 'Trình tự và tên gọi các công đoạn sẽ được xác minh với nghệ nhân trước khi đăng.'

export function CraftTeaser({ steps, mode }: CraftTeaserProps) {
  const [index, setIndex] = useState(0)
  const pills = useRef<(HTMLButtonElement | null)[]>([])
  if (steps.length === 0) return null
  const total = steps.length
  const step = steps[index]
  const num = step.image?.docNumber ?? null

  // Chọn công đoạn; trên mobile cuộn nút được chọn vào giữa dải (chỉ trong handler, không trong effect).
  const select = (i: number) => {
    setIndex(i)
    pills.current[i]?.scrollIntoView?.({ inline: 'center', block: 'nearest' })
  }

  return (
    <section className="flex flex-col gap-6 bg-bg-inverse px-5 py-14 text-text-on-dark md:gap-14 md:px-20 md:pt-28 md:pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
        <SectionHeading tone="dark" eyebrow="NGHỀ DỆT CHIẾU" title="Một tấm chiếu, muôn công đoạn." />
        {mode === 'preview' ? (
          <p className="hidden max-w-[300px] text-small text-right text-text-on-dark-muted md:block">{VERIFY_NOTE}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-6 md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-0">
        <StepProgress index={index} total={total} unit="Công đoạn" label="Tiến trình công đoạn" className="md:hidden" />

        <figure className="relative -mx-5 md:col-span-7 md:mx-0">
          {step.image ? (
            <ContentImage
              image={step.image}
              size="full"
              sizes="(min-width: 768px) 58vw, 100vw"
              className="h-[280px] md:h-[520px]"
              objectPosition={`${step.focus[0]}% ${step.focus[1]}%`}
            />
          ) : (
            <ShotNeeded tone="dark" description={step.shotNeeded ?? undefined} className="h-[280px] md:h-[520px]" />
          )}
          {step.image ? (
            <figcaption className="absolute bottom-5 left-5 hidden flex-col gap-1 bg-bg-primary px-3.5 py-3 text-[13px] leading-[1.45] text-text-primary md:flex">
              {num ? <span className="text-[12px] font-semibold tracking-[.2em] text-text-muted">{`TƯ LIỆU · ${num}`}</span> : null}
              {[step.title, step.image.photographer ? `Ảnh: ${step.image.photographer}` : null].filter(Boolean).join(' · ')}
            </figcaption>
          ) : null}
        </figure>

        {/* Mobile: số, tên, mô tả của công đoạn đang chọn */}
        <div className="flex flex-col gap-2 md:hidden">
          <p className="text-small text-accent-on-dark">{pad(step.n)}</p>
          <p className="font-display text-[28px]">{step.title}</p>
          {step.body ? <p className="text-[15px] leading-[1.6] text-text-on-dark-muted">{step.body}</p> : null}
        </div>

        {/* Mobile: dải nút chọn công đoạn */}
        <ScrollStrip label="Chọn công đoạn" className="snap-mandatory md:hidden">
          {steps.map((s, i) => {
            const on = i === index
            return (
              <button
                key={s.n}
                ref={(el) => {
                  pills.current[i] = el
                }}
                type="button"
                aria-current={on ? 'step' : undefined}
                onClick={() => select(i)}
                className={`inline-flex min-h-11 shrink-0 snap-start items-center px-4 text-[14px] whitespace-nowrap ${
                  on ? 'bg-bg-primary font-semibold text-bg-inverse' : 'border border-border-on-dark-strong text-text-on-dark'
                }`}
              >
                {[pad(s.n), s.title].filter(Boolean).join(' ')}
              </button>
            )
          })}
        </ScrollStrip>

        {/* Mobile: Trước / Tiếp và link */}
        <div className="flex items-center gap-3 md:hidden">
          <PagerButton direction="prev" label="Công đoạn trước" iconOnly tone="dark" atEnd={index === 0} onClick={() => select(index - 1)} />
          <PagerButton
            direction="next"
            label="Công đoạn tiếp"
            iconOnly
            tone="dark"
            variant="solid"
            atEnd={index === total - 1}
            onClick={() => select(index + 1)}
          />
          <LinkArrow href="/nghe-det-chieu" tone="dark" className="ml-auto min-h-12">
            Xem cả hành trình
          </LinkArrow>
        </div>

        {/* Desktop: bộ đếm và danh sách công đoạn */}
        <div className="hidden flex-col justify-center gap-5 md:col-span-4 md:col-start-9 md:flex">
          <StepProgress index={index} total={total} unit="Công đoạn" label="Tiến trình công đoạn" />
          <ol className="flex flex-col border-b border-border-on-dark">
            {steps.map((s, i) => {
              const on = i === index
              return (
                <li key={s.n}>
                  <button
                    type="button"
                    aria-current={on ? 'step' : undefined}
                    onClick={() => select(i)}
                    className={`group flex w-full cursor-pointer gap-[18px] border-t border-border-on-dark py-4 text-left ${
                      on
                        ? 'items-center border-l-[3px] border-l-accent-on-dark bg-[rgba(243,235,221,.06)] pl-[14px] text-text-on-dark'
                        : 'items-baseline text-text-on-dark-muted hover:text-text-on-dark'
                    }`}
                  >
                    <span className={`w-6 text-small ${on ? 'text-accent-on-dark' : 'group-hover:text-accent-on-dark'}`}>{pad(s.n)}</span>
                    <span className={on ? 'font-display text-[28px]' : 'text-[18px]'}>{s.title}</span>
                    {on ? <span aria-hidden="true" className="check mr-[14px] ml-auto size-3" /> : null}
                  </button>
                </li>
              )
            })}
          </ol>
          <p className="text-small text-text-on-dark-muted">Chọn một công đoạn để xem ảnh và mô tả.</p>
        </div>
      </div>

      {/* Desktop: hàng thumbnail */}
      <div
        data-thumbs
        className="hidden gap-4 md:grid"
        style={{ gridTemplateColumns: `repeat(${Math.min(total, 7)}, minmax(0, 1fr))` }}
      >
        {steps.map((s, i) => {
          const on = i === index
          return (
            <button
              key={s.n}
              type="button"
              aria-current={on ? 'step' : undefined}
              onClick={() => select(i)}
              className="group flex cursor-pointer flex-col gap-2.5 text-left"
            >
              {s.image ? (
                <Image
                  src={s.image.sizes.thumb ?? s.image.url}
                  alt=""
                  width={s.image.width}
                  height={s.image.height}
                  sizes="12vw"
                  unoptimized={s.image.flags.length > 0}
                  className={`h-[150px] w-full object-cover transition-opacity group-hover:opacity-100 ${
                    on ? 'opacity-100 outline-2 outline-offset-4 outline-accent-on-dark' : 'opacity-70'
                  }`}
                />
              ) : (
                <span aria-hidden="true" className={`weave block h-[150px] w-full ${on ? 'outline-2 outline-offset-4 outline-accent-on-dark' : 'opacity-70'}`} />
              )}
              <span className={`text-small ${on ? 'font-semibold text-text-on-dark' : 'text-text-on-dark-muted'}`}>
                {[pad(s.n), s.title].filter(Boolean).join(' · ')}
              </span>
            </button>
          )
        })}
      </div>

      <LinkArrow href="/nghe-det-chieu" tone="dark" className="max-md:hidden self-start md:inline-flex">
        Đi theo hành trình một tấm chiếu
      </LinkArrow>
    </section>
  )
}

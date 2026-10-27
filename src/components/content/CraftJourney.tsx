'use client'

import { useId, useRef, useState } from 'react'
import type { CraftPageView, CraftStepView } from '@/lib/content'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PagerButton } from '@/components/ui/PagerButton'
import { PillButton } from '@/components/ui/PillButton'
import { centreInStrip, ScrollStrip } from '@/components/ui/ScrollStrip'
import { StepProgress } from '@/components/ui/StepProgress'
import { CraftStage } from './CraftStage'

type CraftJourneyProps = { steps: CraftStepView[]; copy: CraftPageView['copy']['journey'] }

const pad = (n: number) => String(n).padStart(2, '0')

function ZoomIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <path d="M12.5 12.5L17 17M8 5.5v5M5.5 8h5" />
    </svg>
  )
}

type ZoomButtonProps = { zoomed: boolean; disabled: boolean; onToggle: () => void; label: string | null; ariaLabel: string | null; iconOnly?: boolean; className: string }

// Nút phóng ảnh: aria-pressed; aria-disabled (giữ focus) khi công đoạn chưa có ảnh.
function ZoomButton({ zoomed, disabled, onToggle, label, ariaLabel, iconOnly = false, className }: ZoomButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={zoomed}
      aria-label={iconOnly ? (ariaLabel ?? undefined) : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      onClick={() => {
        if (!disabled) onToggle()
      }}
      className={`inline-flex min-h-12 items-center justify-center gap-2.5 text-[15px] font-medium ${disabled ? 'cursor-default opacity-40' : 'cursor-pointer'} ${className}`}
    >
      <ZoomIcon />
      {iconOnly ? null : label}
    </button>
  )
}

// "Hành trình một tấm chiếu": chọn công đoạn, xem ảnh (phóng được) và mô tả. Desktop 3 cột, mobile xếp dọc.
export function CraftJourney({ steps, copy }: CraftJourneyProps) {
  const [index, setIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const pills = useRef<(HTMLButtonElement | null)[]>([])
  const headingId = useId()
  if (steps.length === 0) return null
  const total = steps.length
  const current = Math.min(index, total - 1)
  const step = steps[current]
  const noImage = !step.image

  // Đổi công đoạn: thu ảnh về cỡ thường; cuộn dải để nút được chọn vào giữa (chỉ trong handler, trang không nhảy).
  const select = (i: number) => {
    setIndex(i)
    setZoomed(false)
    centreInStrip(pills.current[i])
  }

  const zoomLabelDesktop = zoomed ? copy.zoomOff.desktop : copy.zoomOn
  const zoomLabelMobile = zoomed ? copy.zoomOff.mobile : copy.zoomOn
  const zoomActive = zoomed && !noImage

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-[18px] bg-bg-inverse px-5 pt-10 pb-12 text-text-on-dark md:gap-12 md:px-20 md:py-24">
      <div className="flex flex-col gap-[18px] md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="flex flex-col gap-3.5">
          <Eyebrow as="p" tone="dark">
            {copy.eyebrow}
          </Eyebrow>
          <h2 id={headingId} className="font-display text-h2-section leading-[1.1] font-normal max-md:sr-only">
            {copy.title}
          </h2>
        </div>
        <StepProgress index={current} total={total} unit={copy.stepLabel ?? ''} label={copy.progressLabel ?? ''} className="md:w-80" />
      </div>

      <div className="flex flex-col gap-[18px] md:grid md:grid-cols-12 md:items-start md:gap-x-6 md:gap-y-0">
        {/* Desktop: danh sách công đoạn */}
        <ol aria-label={copy.listLabel ?? undefined} className="flex-col border-t border-border-on-dark max-md:hidden md:col-span-3 md:row-span-2 md:row-start-1 md:flex">
          {steps.map((s, i) => {
            const on = i === current
            return (
              <li key={s.n} className="border-b border-border-on-dark">
                <button
                  type="button"
                  aria-current={on ? 'step' : undefined}
                  onClick={() => select(i)}
                  className={`flex min-h-[52px] w-full cursor-pointer items-baseline gap-4 px-3 py-3.5 text-left transition-colors motion-reduce:transition-none ${
                    on
                      ? 'bg-surface-on-dark-active text-[17px] font-semibold text-text-on-dark shadow-[inset_3px_0_0_var(--accent-on-dark)]'
                      : 'text-[16px] text-text-on-dark-muted hover:bg-surface-on-dark-hover'
                  }`}
                >
                  <span className={`w-6 text-[13px] ${on ? 'text-accent-on-dark' : ''}`}>{pad(s.n)}</span>
                  <span>{s.title}</span>
                </button>
              </li>
            )
          })}
        </ol>

        {/* Mobile: dải nút chọn công đoạn */}
        <ScrollStrip label={copy.railLabel ?? undefined} className="snap-mandatory gap-2 md:hidden">
          {steps.map((s, i) => {
            const on = i === current
            return (
              <PillButton
                key={s.n}
                ref={(el) => {
                  pills.current[i] = el
                }}
                tone="dark"
                active={on}
                aria-current={on ? 'step' : undefined}
                onClick={() => select(i)}
              >
                {[pad(s.n), s.shortTitle ?? s.title].filter(Boolean).join(' ')}
              </PillButton>
            )
          })}
        </ScrollStrip>

        <CraftStage step={step} zoomed={zoomed} docLabel={copy.docLabel} photoPrefix={copy.photoPrefix} className="md:col-span-6 md:col-start-4 md:row-start-1">
          <ZoomButton
            iconOnly
            zoomed={zoomed}
            disabled={noImage}
            onToggle={() => setZoomed((z) => !z)}
            label={zoomLabelMobile}
            ariaLabel={zoomLabelMobile}
            className="absolute top-3 right-3 size-12 bg-[rgba(35,42,37,.85)] text-text-on-dark md:hidden"
          />
        </CraftStage>

        {/* Chi tiết công đoạn đang chọn */}
        <div className="flex flex-col gap-[18px] md:col-span-3 md:col-start-10 md:row-span-2 md:row-start-1">
          <span aria-hidden="true" className="font-display text-[80px] leading-none text-accent-on-dark max-md:hidden">
            {pad(step.n)}
          </span>
          <h3 className="font-display text-[30px] leading-[1.2] font-normal md:text-[34px]">{step.title}</h3>
          {step.subtitle ? <p className="text-small text-text-on-dark-muted max-md:hidden">{step.subtitle}</p> : null}
          {step.body ? <p className="text-[16px] leading-[1.65] md:text-[17px] md:leading-[1.7]">{step.body}</p> : null}
          {step.tools ? (
            <div className="flex flex-col gap-1.5 border-t border-border-on-dark pt-3.5 md:pt-4">
              <Eyebrow tone="dark" tracking="label">
                {copy.toolsLabel}
              </Eyebrow>
              <span className="text-[14px] leading-[1.6] text-text-on-dark-muted md:text-[15px]">{step.tools}</span>
            </div>
          ) : null}
          {step.toRecord && copy.preview ? (
            <div className="flex flex-col gap-1.5">
              <Eyebrow tone="dark" tracking="label">
                {copy.preview.toRecordLabel}
              </Eyebrow>
              <span className="text-[14px] leading-[1.6] text-text-on-dark-muted md:text-[15px]">{step.toRecord}</span>
            </div>
          ) : null}
        </div>

        {/* Trước / Tiếp (và phóng ảnh trên desktop); cột hẹp ở 768 thì xuống dòng thay vì tràn cột (RF5) */}
        <div className="mt-1.5 grid grid-cols-2 gap-2 md:col-span-6 md:col-start-4 md:row-start-2 md:mt-4 md:flex md:flex-wrap md:items-center md:gap-3">
          <PagerButton direction="prev" label={copy.prev ?? ''} ariaLabel={copy.prevAria ?? undefined} tone="dark" atEnd={current === 0} onClick={() => select(current - 1)} />
          <PagerButton
            direction="next"
            label={copy.next ?? ''}
            ariaLabel={copy.nextAria ?? undefined}
            tone="dark"
            variant="solid"
            atEnd={current === total - 1}
            onClick={() => select(current + 1)}
          />
          <ZoomButton
            zoomed={zoomed}
            disabled={noImage}
            onToggle={() => setZoomed((z) => !z)}
            label={zoomLabelDesktop}
            ariaLabel={zoomLabelDesktop}
            className={`border px-5 max-md:hidden ${
              zoomActive ? 'border-accent-on-dark bg-[rgba(227,205,156,.1)] text-accent-on-dark' : 'border-border-on-dark-strong text-text-on-dark'
            }`}
          />
        </div>
      </div>

      {copy.hint.desktop ? <p className="text-small text-text-on-dark-muted max-md:hidden">{copy.hint.desktop}</p> : null}
      {copy.hint.mobile ? <p className="text-small text-text-on-dark-muted md:hidden">{copy.hint.mobile}</p> : null}
    </section>
  )
}

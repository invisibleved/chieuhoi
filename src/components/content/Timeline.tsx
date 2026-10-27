'use client'

import Link from 'next/link'
import { useId, useState } from 'react'
import type { TimelineEventView, VillagePageView } from '@/lib/content'
import { PagerButton } from '@/components/ui/PagerButton'
import { ConfidenceBadge, ConfidenceMark } from './Confidence'

type TimelineCopy = VillagePageView['copy']['timeline']

type Props = { events: TimelineEventView[]; copy: TimelineCopy }

const LINK = 'inline-flex min-h-11 items-center text-accent-on-dark underline underline-offset-4 hover:decoration-2'

// Nội dung dòng nguồn: mốc có sourceHref thì là liên kết nội bộ.
function SourceText({ event }: { event: TimelineEventView }) {
  if (!event.sourceHref) return <>{event.sourceLine}</>
  return <Link href={event.sourceHref} className={LINK}>{event.sourceLine}</Link>
}

// Dòng thời gian: trục ngang từ lg, accordion bên dưới; hai bố cục dùng chung `index`.
export function Timeline({ events, copy }: Props) {
  const [index, setIndex] = useState(0)
  const uid = useId()
  if (events.length === 0) return null
  const last = events.length - 1
  const cur = events[Math.min(Math.max(index, 0), last)]
  const labels = copy.confidence

  return (
    <div className="flex flex-col gap-12">
      {/* Desktop */}
      <div className="hidden flex-col gap-12 lg:flex" data-layout="desktop">
        <div className="relative">
          <div aria-hidden="true" className="absolute inset-x-0 top-[52px] h-px bg-border-on-dark" />
          <ol
            aria-label={copy.listLabel ?? undefined}
            className="relative m-0 grid list-none gap-2 p-0"
            style={{ gridTemplateColumns: `repeat(${events.length}, minmax(0, 1fr))` }}
          >
            {events.map((e, k) => {
              const on = k === index
              return (
                <li key={k}>
                  <button
                    type="button"
                    aria-current={on ? 'true' : undefined}
                    onClick={() => setIndex(k)}
                    className="flex min-h-11 w-full cursor-pointer flex-col items-center gap-3 px-1 text-center"
                  >
                    <span className={`flex h-[30px] items-center font-display ${on ? 'text-[24px] text-accent-on-dark' : 'text-[20px] text-text-on-dark-muted'}`}>{e.label}</span>
                    <span className="flex h-6 items-center"><ConfidenceMark level={e.confidence} active={on} /></span>
                    <span className={on ? 'text-[15px] leading-[1.4] font-semibold text-text-on-dark' : 'text-small leading-[1.4] text-text-on-dark-muted'}>{e.title}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
        <div className="grid grid-cols-12 gap-x-6 border-t border-border-on-dark pt-10">
          <div className="col-span-4 flex flex-col gap-3.5">
            <span className="font-display text-[88px] leading-none text-accent-on-dark">{cur.label}</span>
            <ConfidenceBadge level={cur.confidence} labels={labels} />
          </div>
          <div className="col-span-7 col-start-6 flex flex-col gap-4">
            <h3 className="m-0 font-display text-[36px] leading-[1.2] font-normal text-text-on-dark">{cur.title}</h3>
            <p className="m-0 text-lg leading-[1.7] text-text-on-dark">{cur.body}</p>
            {cur.sourceLine ? (
              <p className="m-0 text-small leading-[1.6] text-text-on-dark-muted">
                <span className="text-eyebrow font-semibold tracking-label text-accent-on-dark">{copy.sourceLabel.desktop}</span>
                <SourceText event={cur} />
              </p>
            ) : null}
            <div className="mt-2 flex gap-3">
              <PagerButton tone="dark" direction="prev" label={copy.prev ?? ''} atEnd={index <= 0} onClick={() => setIndex(Math.max(0, index - 1))} />
              <PagerButton tone="dark" variant="solid" direction="next" label={copy.next ?? ''} atEnd={index >= last} onClick={() => setIndex(Math.min(last, index + 1))} />
            </div>
          </div>
        </div>
        {copy.hint.desktop ? <p className="m-0 text-small text-text-on-dark-muted">{copy.hint.desktop}</p> : null}
      </div>

      {/* Mobile: accordion, mở một mốc một lúc */}
      <ol aria-label={copy.listLabel ?? undefined} data-layout="mobile" className="m-0 mt-2 list-none border-t border-border-on-dark p-0 lg:hidden">
        {events.map((e, k) => {
          const on = k === index
          const panelId = `${uid}-p${k}`
          return (
            <li key={k} className="border-b border-border-on-dark">
              <button
                type="button"
                aria-expanded={on}
                aria-controls={panelId}
                onClick={() => setIndex(on ? -1 : k)}
                className="grid min-h-14 w-full cursor-pointer grid-cols-[28px_86px_1fr_20px] items-center gap-2 py-2.5 text-left"
              >
                <span className="flex justify-center"><ConfidenceMark level={e.confidence} size="sm" /></span>
                <span className={`whitespace-nowrap font-serif text-lg ${on ? 'text-accent-on-dark' : 'text-text-on-dark-muted'}`}>{e.label}</span>
                <span className={`text-[15px] text-text-on-dark ${on ? 'font-semibold' : ''}`}>{e.title}</span>
                <span aria-hidden="true" className="text-lg text-accent-on-dark">{on ? '−' : '+'}</span>
              </button>
              <div id={panelId} hidden={!on} className="flex-col gap-2.5 pb-[18px] pl-9 [&:not([hidden])]:flex">
                <ConfidenceBadge level={e.confidence} labels={labels} />
                <p className="m-0 text-[15px] leading-[1.65] text-text-on-dark">{e.body}</p>
                {e.sourceLine ? (
                  <p className="m-0 text-[13px] leading-[1.55] text-text-on-dark-muted">
                    {copy.sourceLabel.mobile}
                    <SourceText event={e} />
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

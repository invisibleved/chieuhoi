'use client'

import { useState } from 'react'
import { Lab } from '@/components/styleguide/Lab'
import { FilterChips } from '@/components/ui/FilterChips'
import { PagerButton } from '@/components/ui/PagerButton'
import { ScrollStrip } from '@/components/ui/ScrollStrip'
import { StepProgress } from '@/components/ui/StepProgress'
import { Tabs } from '@/components/ui/Tabs'

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'history', label: 'Lịch sử' },
  { key: 'craft', label: 'Nghề truyền thống' },
  { key: 'people', label: 'Con người' },
  { key: 'today', label: 'Đời sống hôm nay' },
] as const
type FilterKey = (typeof FILTERS)[number]['key']

const TABS = ['hand', 'machine', 'compare'] as const
type TabKey = (typeof TABS)[number]
const TAB_LABELS: Record<TabKey, string> = { hand: 'Dệt thủ công', machine: 'Dệt bằng máy', compare: 'So sánh' }

export function FilterDemos() {
  const [light, setLight] = useState<FilterKey>('all')
  const [dark, setDark] = useState<FilterKey>('all')
  return (
    <>
      <div className="flex min-w-0 flex-col gap-3">
        <Lab>BỘ LỌC · NỀN SÁNG</Lab>
        <FilterChips label="Lọc câu chuyện (nền sáng)" options={[...FILTERS]} value={light} onChange={setLight} />
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <Lab>BỘ LỌC · NỀN TỐI</Lab>
        <div className="bg-bg-deep p-4">
          <FilterChips label="Lọc câu chuyện (nền tối)" options={[...FILTERS]} value={dark} onChange={setDark} tone="dark" />
        </div>
      </div>
    </>
  )
}

export function TabDemo() {
  const [value, setValue] = useState<TabKey>('hand')
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Lab>TAB · NỀN SÁNG</Lab>
      <Tabs
        label="Mẫu tab"
        variant="underline"
        value={value}
        onChange={setValue}
        tabs={TABS.map((k) => ({
          key: k,
          label: TAB_LABELS[k],
          panel: <p className="py-4 text-[14px] text-text-secondary">{TAB_LABELS[k]}</p>,
        }))}
      />
    </div>
  )
}

const STEPS = ['Chọn cói', 'Chẻ cói', 'Phơi cói', 'Nhuộm', 'Dệt', 'Hoàn thiện']

// Bộ đếm, dải cuộn và nút Trước/Tiếp dùng chung một trạng thái, ở cả nền sáng và nền tối.
export function StepperDemos() {
  const [i, setI] = useState(1)
  const last = STEPS.length - 1
  return (
    <>
      {(['light', 'dark'] as const).map((tone) => {
        const dark = tone === 'dark'
        return (
          <div key={tone} className={`flex min-w-0 flex-col gap-4 p-4 ${dark ? 'bg-bg-inverse text-text-on-dark' : ''}`}>
            <Lab tone={tone}>{dark ? 'TIẾN TRÌNH · DẢI CUỘN · TRƯỚC/SAU · NỀN TỐI' : 'TIẾN TRÌNH · DẢI CUỘN · TRƯỚC/SAU · NỀN SÁNG'}</Lab>
            <StepProgress index={i} total={STEPS.length} unit="Công đoạn" label={`Tiến trình công đoạn (nền ${dark ? 'tối' : 'sáng'})`} tone={tone} />
            <ScrollStrip label={`Chọn công đoạn (nền ${dark ? 'tối' : 'sáng'})`} className="max-w-full">
              {STEPS.map((t, k) => (
                <button
                  key={t}
                  type="button"
                  aria-current={k === i ? 'step' : undefined}
                  onClick={() => setI(k)}
                  className={`inline-flex min-h-11 shrink-0 snap-start items-center px-4 text-[14px] whitespace-nowrap ${
                    k === i
                      ? dark ? 'bg-bg-primary font-semibold text-bg-inverse' : 'bg-text-primary font-semibold text-bg-primary'
                      : dark ? 'border border-border-on-dark-strong' : 'border border-border-strong'
                  }`}
                >
                  {String(k + 1).padStart(2, '0')} {t}
                </button>
              ))}
            </ScrollStrip>
            <div className="flex gap-3">
              <PagerButton direction="prev" label="Công đoạn trước" iconOnly tone={dark ? 'dark' : undefined} atEnd={i === 0} onClick={() => setI(i - 1)} />
              <PagerButton direction="next" label="Công đoạn tiếp" iconOnly variant="solid" tone={dark ? 'dark' : undefined} atEnd={i === last} onClick={() => setI(i + 1)} />
              <PagerButton direction="next" label="Tiếp theo" variant="outline" tone={dark ? 'dark' : undefined} atEnd onClick={() => setI(i + 1)} />
            </div>
          </div>
        )
      })}
    </>
  )
}

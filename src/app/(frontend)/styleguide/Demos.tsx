'use client'

import { useState } from 'react'
import { Lab } from '@/components/styleguide/Lab'
import { FilterChips } from '@/components/ui/FilterChips'
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

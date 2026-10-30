'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import type { CraftPageView, Variant } from '@/lib/content'
import { Tabs } from '@/components/ui/Tabs'
import { hasVariant, VariantText } from '@/components/ui/VariantText'
import { ContentImage } from './ContentImage'
import { ShotNeeded } from './ShotNeeded'
import { Cite } from './Sources'

type Way = CraftPageView['compare']['hand']
type TabKey = 'hand' | 'machine' | 'compare'

type ComparisonTabsProps = {
  hand: Way
  machine: Way
  rows: CraftPageView['compare']['rows']
  /** Ghi chú dưới bảng (chỉ preview). */
  rowsNote: Variant | null
  labels: CraftPageView['copy']['compare']
  /** Số thứ tự nguồn (từ sourceNumbers). Không có thì không hiện chú thích. */
  numbers?: Map<string, number>
}

const noNumbers = new Map<string, number>()

// Panel "một cách dệt": ảnh 7 cột + chữ 4 cột trên desktop; mobile xếp dọc, ảnh 230px.
function WayPanel({ way, numbers }: { way: Way; numbers: Map<string, number> }) {
  return (
    <div className="flex flex-col gap-3 pt-4 md:grid md:grid-cols-12 md:items-center md:gap-x-6 md:gap-y-0 md:pt-10">
      <div className="md:col-span-7">
        {way.image ? (
          <ContentImage image={way.image} size="wide" sizes="(min-width: 768px) 58vw, 100vw" className="block h-[230px] md:h-[480px]" />
        ) : (
          <ShotNeeded className="h-[230px] md:h-[480px]" />
        )}
      </div>
      <div className="flex flex-col gap-3 md:col-span-4 md:col-start-9 md:gap-4">
        {way.title ? <h3 className="font-display text-[34px] leading-[1.2] font-normal max-md:hidden">{way.title}</h3> : null}
        {hasVariant(way.text) ? (
          <p className="text-[16px] leading-[1.65] md:text-[17px] md:leading-[1.7]">
            <VariantText value={way.text} />
            <Cite ids={way.textCite} numbers={numbers} variant="bracket" />
          </p>
        ) : null}
        {hasVariant(way.note) ? (
          <p className="text-[14px] leading-[1.6] text-text-secondary md:text-[15px]">
            <VariantText value={way.note} />
            <Cite ids={way.noteCite} numbers={numbers} variant="bracket" />
          </p>
        ) : null}
      </div>
    </div>
  )
}

const th = 'text-left text-[12px] font-semibold tracking-label text-text-muted md:border-b md:border-border-strong md:py-3.5 md:pr-8'
const td = 'md:border-b md:border-border-subtle md:py-4 md:pr-8 max-md:hidden'

// Bảng so sánh: một <table> thật; dưới md mỗi hàng thành khối (tiêu đề + các dòng mobile nguyên văn).
function CompareTable({ rows, note, labels, numbers }: { rows: ComparisonTabsProps['rows']; note: Variant | null; labels: ComparisonTabsProps['labels']; numbers: Map<string, number> }) {
  const rowCite = (r: ComparisonTabsProps['rows'][number]) => <Cite ids={r.cite} numbers={numbers} variant="bracket" />
  return (
    <div className="flex flex-col gap-6 pt-4 md:pt-10">
      <table className="w-full text-[15px] leading-[1.6] max-md:block">
        <thead className="max-md:sr-only">
          <tr>
            <th scope="col" className={`${th} md:w-60`}>{labels.columns.aspect}</th>
            <th scope="col" className={th}>{labels.columns.hand}</th>
            <th scope="col" className={th}>{labels.columns.machine}</th>
          </tr>
        </thead>
        <tbody className="max-md:block">
          {rows.map((r) => (
            <tr key={r.aspect} className="max-md:flex max-md:flex-col max-md:gap-1.5 max-md:border-t max-md:border-border-subtle max-md:py-3.5 max-md:first:border-border-strong max-md:last:border-b">
              <th scope="row" className="text-left text-[15px] font-semibold md:border-b md:border-border-subtle md:py-4 md:pr-8 md:font-medium">
                {r.aspect}
              </th>
              <td className={`${td} ${r.muted.hand ? 'text-text-muted' : ''}`}>{r.hand}{r.machine === null ? rowCite(r) : null}</td>
              <td className={`${td} ${r.muted.machine ? 'text-text-muted' : ''}`}>{r.machine}{r.machine !== null ? rowCite(r) : null}</td>
              {r.mobile.map((line, i) => (
                <td key={i} className={`text-[14px] leading-[1.55] md:hidden ${r.muted.mobile[i] ? 'text-text-muted' : ''}`}>
                  {line}
                  {i === r.mobile.length - 1 ? <Cite ids={r.cite} numbers={numbers} variant="bracket" /> : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {hasVariant(note) ? (
        <p className="text-small text-text-muted">
          <VariantText value={note} />
        </p>
      ) : null}
    </div>
  )
}

// Ba tab "Dệt thủ công / Dệt bằng máy / So sánh" (mobile: "Thủ công / Bằng máy / So sánh"). Không có hàng so sánh thì bỏ tab thứ ba (R7).
export function ComparisonTabs({ hand, machine, rows, rowsNote, labels, numbers = noNumbers }: ComparisonTabsProps) {
  const [tab, setTab] = useState<TabKey>('hand')
  const tabs: { key: TabKey; label: ReactNode; panel: ReactNode }[] = [
    { key: 'hand', label: <VariantText value={{ desktop: labels.tabs.hand, mobile: labels.panels.hand.mobile }} />, panel: <WayPanel way={hand} numbers={numbers} /> },
    { key: 'machine', label: <VariantText value={{ desktop: labels.tabs.machine, mobile: labels.panels.machine.mobile }} />, panel: <WayPanel way={machine} numbers={numbers} /> },
  ]
  if (rows.length > 0) {
    tabs.push({ key: 'compare', label: labels.tabs.compare, panel: <CompareTable rows={rows} note={rowsNote} labels={labels} numbers={numbers} /> })
  }
  return <Tabs label={labels.tablistLabel ?? undefined} tabs={tabs} value={tab} onChange={setTab} variant="responsive" />
}

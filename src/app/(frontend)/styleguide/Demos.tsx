'use client'

import { useState } from 'react'
import { Lab } from '@/components/styleguide/Lab'
import { PatternExplorer } from '@/components/content/PatternExplorer'
import { applyMode } from '@/lib/content/copy/applyMode'
import { productsCopy } from '@/lib/content/copy/products'
import type { ImageView, ProductView } from '@/lib/content'
import { FilterChips } from '@/components/ui/FilterChips'
import { FilterableList } from '@/components/ui/FilterableList'
import { ReadingProgress } from '@/components/ui/ReadingProgress'
import { ShareButtons } from '@/components/ui/ShareButtons'
import { TableOfContents } from '@/components/ui/TableOfContents'
import { SearchField } from '@/components/ui/SearchField'
import { PagerButton } from '@/components/ui/PagerButton'
import { Segmented } from '@/components/ui/Segmented'
import { SuccessState } from '@/components/ui/Feedback'
import { PillButton } from '@/components/ui/PillButton'
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

type EraKey = 'all' | 'old' | 'now'
const ERAS: { key: EraKey; label: string }[] = [
  { key: 'all', label: 'Mọi thời kỳ' },
  { key: 'old', label: 'Xưa' },
  { key: 'now', label: 'Nay' },
]

export function SegmentedDemos() {
  const [a, setA] = useState<EraKey>('all')
  const [b, setB] = useState<EraKey>('old')
  const [c, setC] = useState<EraKey>('now')
  return (
    <>
      <div className="flex min-w-0 flex-col gap-3">
        <Lab>NHÓM CHỌN MỘT · NỀN SÁNG</Lab>
        <Segmented label="Thời kỳ (nền sáng)" options={ERAS} value={a} onChange={setA} />
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <Lab>NHÓM CHỌN MỘT · NỀN TỐI</Lab>
        <div className="bg-bg-deep p-4">
          <Segmented label="Thời kỳ (nền tối)" options={ERAS} value={b} onChange={setB} tone="dark" />
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <Lab>NHÓM CHỌN MỘT · STRETCH (mobile, cao 48)</Lab>
        <Segmented label="Thời kỳ (stretch)" options={ERAS} value={c} onChange={setC} stretch />
      </div>
    </>
  )
}

export function SuccessActionDemo() {
  const [n, setN] = useState(0)
  return (
    <div className="flex flex-col gap-3">
      <Lab>THÀNH CÔNG · LỚN, TIÊU ĐỀ h3, CÓ NÚT (size=lg)</Lab>
      <SuccessState size="lg" headingLevel="h3" title="Cảm ơn bạn." body="Chúng tôi sẽ liên hệ để xác minh trước khi đăng. (Màn hình minh hoạ: chưa có dữ liệu nào thực sự được gửi.)" action={{ label: n ? `Góp thêm một ký ức (${n})` : 'Góp thêm một ký ức', onClick: () => setN(n + 1) }} />
    </div>
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
            <Lab tone={tone}>{dark ? 'TIẾN TRÌNH · DẢI CUỘN · NÚT VIÊN · TRƯỚC/SAU · NỀN TỐI' : 'TIẾN TRÌNH · DẢI CUỘN · NÚT VIÊN · TRƯỚC/SAU · NỀN SÁNG'}</Lab>
            <StepProgress index={i} total={STEPS.length} unit="Công đoạn" label={`Tiến trình công đoạn (nền ${dark ? 'tối' : 'sáng'})`} tone={tone} />
            <ScrollStrip label={`Chọn công đoạn (nền ${dark ? 'tối' : 'sáng'})`} className="max-w-full gap-3">
              {STEPS.map((t, k) => (
                <PillButton key={t} tone={tone} active={k === i} aria-current={k === i ? 'step' : undefined} onClick={() => setI(k)}>
                  {String(k + 1).padStart(2, '0')} {t}
                </PillButton>
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

const SHARE_COPY = {
  label: 'CHIA SẺ',
  copy: { desktop: 'Sao chép đường dẫn', mobile: 'Sao chép link' },
  facebook: { desktop: 'Chia sẻ qua Facebook', mobile: 'Facebook' },
  zalo: { desktop: 'Chia sẻ qua Zalo', mobile: 'Zalo' },
  copied: 'Đã sao chép đường dẫn',
  zaloFallback: 'Đã sao chép đường dẫn, dán vào Zalo để chia sẻ',
}

const LIST_ITEMS = [
  { id: 'a', cat: 'history', title: 'Chuyện về Trạng Chiếu' },
  { id: 'b', cat: 'craft', title: 'Khung dệt và người thợ' },
  { id: 'c', cat: 'history', title: 'Làng Hới qua các thời' },
  { id: 'd', cat: 'craft', title: 'Cói, sợi và mùa vụ' },
  { id: 'e', cat: 'today', title: 'Đời sống hôm nay' },
]
type ListItem = (typeof LIST_ITEMS)[number]
const LIST_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'history', label: 'Lịch sử' },
  { key: 'craft', label: 'Nghề truyền thống' },
  { key: 'today', label: 'Đời sống hôm nay' },
]
const TOC_ITEMS = [
  { id: 'sg-toc-1', title: 'Một Tam nguyên của làng' },
  { id: 'sg-toc-2', title: 'Khung dệt từ phương Bắc' },
  { id: 'sg-toc-3', title: 'Truyền khẩu và sử liệu' },
]

// Danh sách lọc điều khiển từ ngoài: ô tìm thứ nhất ở trên (từ md), ô thứ hai trong danh sách (chỉ mobile); chung một từ khoá.
function ControlledListDemo() {
  const [q, setQ] = useState('')
  const ph = { desktop: 'Ví dụ: Trạng Chiếu', mobile: 'Ví dụ: Trạng Chiếu' }
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Lab>DANH SÁCH LỌC · Ô TÌM ĐIỀU KHIỂN TỪ NGOÀI</Lab>
      <SearchField id="sg-ctl-search" label="Tìm (ô ngoài, từ md)" placeholder={ph} value={q} onChange={setQ} className="max-w-[360px] max-md:hidden" />
      <FilterableList<ListItem>
        items={LIST_ITEMS}
        getKey={(t) => t.id}
        getCategory={(t) => t.cat}
        getSearchText={(t) => t.title}
        filters={LIST_FILTERS}
        filterLabel={{ desktop: 'Lọc (ô tìm ngoài)', mobile: 'Lọc (ô tìm ngoài)' }}
        search={{ id: 'sg-ctl-inner', label: 'Tìm (ô trong, chỉ mobile)', placeholder: ph, className: 'md:hidden' }}
        query={q}
        onQueryChange={setQ}
        status={(m) => ({ desktop: `${m.length} bài`, mobile: `${m.length} bài` })}
        empty={<p className="border border-dashed border-border-dashed p-6 text-[14px] text-text-secondary">Chưa có bài trong chủ đề này</p>}
        renderItem={(t) => <p className="border border-border-soft p-4 text-[15px]">{t.title}</p>}
        listClassName="grid gap-3 md:grid-cols-3"
        className="flex flex-col gap-4"
        toolbarClassName="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      />
    </div>
  )
}

export function InteractiveDemos() {
  const [q, setQ] = useState('')
  return (
    <>
      <div className="flex min-w-0 flex-col gap-3">
        <Lab>Ô TÌM KIẾM</Lab>
        <div className="max-w-[560px]">
          <SearchField id="sg-search" label="Tìm trong câu chuyện" placeholder={{ desktop: 'Ví dụ: khung dệt, Trạng Chiếu', mobile: 'Ví dụ: Trạng Chiếu' }} value={q} onChange={setQ} />
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <Lab>DANH SÁCH LỌC · TÌM KIẾM · XEM THÊM</Lab>
        <FilterableList<ListItem>
          items={LIST_ITEMS}
          getKey={(t) => t.id}
          getCategory={(t) => t.cat}
          getSearchText={(t) => t.title}
          filters={LIST_FILTERS}
          filterLabel={{ desktop: 'Lọc theo chủ đề (mẫu)', mobile: 'Lọc (mẫu)' }}
          search={{ id: 'sg-list-search', label: 'Tìm trong danh sách mẫu', placeholder: { desktop: 'Ví dụ: Trạng Chiếu', mobile: 'Ví dụ: Trạng Chiếu' } }}
          pageSize={3}
          more={{ label: 'Xem thêm câu chuyện', done: 'Đã hiện hết các bài hiện có' }}
          status={(m) => ({ desktop: `${m.length} bài`, mobile: `${m.length} bài` })}
          empty={<p className="border border-dashed border-border-dashed p-6 text-[14px] text-text-secondary">Chưa có bài trong chủ đề này</p>}
          renderItem={(t) => <p className="border border-border-soft p-4 text-[15px]">{t.title}</p>}
          listClassName="grid gap-3 md:grid-cols-3"
        />
      </div>
      <ControlledListDemo />
      <div className="flex min-w-0 flex-col gap-3">
        <Lab>NÚT CHIA SẺ</Lab>
        <div className="max-w-[360px]">
          <ShareButtons copy={SHARE_COPY} />
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <Lab>THANH TIẾN ĐỘ ĐỌC · MỤC LỤC</Lab>
        <ReadingProgress label="Tiến độ đọc (mẫu)" targetId="sg-reading" />
        <div className="grid gap-8 md:grid-cols-[200px_1fr]">
          {/* Mobile không có mục lục (R5) */}
          <div className="max-md:hidden">
            <TableOfContents label="Mục lục (mẫu)" title="TRONG BÀI" items={TOC_ITEMS} />
          </div>
          <div id="sg-reading" className="flex flex-col gap-6 text-[15px] leading-[1.7] text-text-secondary">
            {TOC_ITEMS.map((i) => (
              <section key={i.id} className="flex flex-col gap-2">
                <h3 id={i.id} className="m-0 font-display text-[24px] text-text-primary">{i.title}</h3>
                <p className="m-0">Đoạn mẫu để thử thanh tiến độ và mục lục. Nội dung thật lấy từ bài viết.</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

const sgImg = (code: string, alt: string): ImageView => ({
  url: `/images/reference/${code}.webp`, alt, width: 1200, height: 800, sizes: {}, photographer: null, code: null, docNumber: null, flags: [],
})
const SG_IMAGES = [sgImg('kn8', 'Tấm chiếu hoa văn đỏ (mẫu)'), sgImg('kn2', 'Ảnh mẫu 2'), sgImg('hc9', 'Ảnh mẫu 3'), sgImg('kn1', 'Ảnh mẫu 4')]
const SG_PRODUCT: ProductView = {
  slug: 'mau', code: null, name: 'Hiện vật mẫu', group: null, groupLabel: null, summary: null, image: SG_IMAGES[0], typeConfirmed: false, tag: null, flags: [],
  images: SG_IMAGES, primaryImage: SG_IMAGES[0], hasPattern: true, material: null, technique: null, size: null, care: null, maker: null, context: null, pattern: null, typeNote: null,
  imageCaptions: ['Ảnh 1/4 (mẫu)', 'Ảnh 2/4 (mẫu)', 'Ảnh 3/4 (mẫu)', 'Ảnh 4/4 (mẫu)'],
  sources: [],
  annotations: [
    { n: 1, title: 'Viền chiếu', shortTitle: 'Viền', x: 30, y: 72, body: 'Chú thích mẫu cho điểm thứ nhất.', sourceId: null, sourceN: null, sourceLine: 'Quan sát từ ảnh · chưa xác minh' },
    { n: 2, title: 'Hoa văn in', shortTitle: 'Hoa văn', x: 52, y: 60, body: 'Chú thích mẫu có số nguồn.', sourceId: 'mau', sourceN: 1, sourceLine: 'Nguồn mẫu' },
    { n: 3, title: 'Mặt cói dệt', shortTitle: 'Mặt cói', x: 70, y: 82, body: 'Chú thích mẫu cho điểm thứ ba.', sourceId: null, sourceN: null, sourceLine: null },
  ],
}

export function PatternExplorerDemo() {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Lab>KHÁM PHÁ ĐƯỜNG DỆT · SÂN KHẤU, ẢNH NHỎ, ĐIỂM, CHÚ THÍCH (ảnh dev)</Lab>
      <PatternExplorer product={SG_PRODUCT} copy={applyMode(productsCopy, 'preview').detail} aside={<p className="m-0 text-[14px] text-text-muted">Khối tiêu đề (aside)</p>} />
    </div>
  )
}

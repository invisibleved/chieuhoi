import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { CraftPageView, ImageView } from '@/lib/content'
import { applyMode } from '@/lib/content/copy/applyMode'
import { craftCopy, craftReadNext } from '@/lib/content/copy/craft'
import { CraftView } from '@/components/craft/CraftView'
import { craftToolSamples, craftWaySamples, compareRows as sampleRows, sources as sampleSources } from '@/components/styleguide/fixtures'
import { ComparisonTabs } from '@/components/content/ComparisonTabs'
import { Cite, sourceNumbers } from '@/components/content/Sources'
import { FigureCard } from '@/components/content/FigureCard'
import { ReadNext } from '@/components/content/ReadNext'
import { Tabs } from '@/components/ui/Tabs'
import { VariantText } from '@/components/ui/VariantText'

const img = (name: string): ImageView => ({ url: `/${name}.webp`, alt: name, width: 800, height: 600, sizes: {}, photographer: null, code: null, docNumber: null, flags: [] })
const intro = { eyebrow: '03 — NGHỀ DỆT CHIẾU', title: 'Một tấm chiếu,\nmuôn công đoạn.', lead: 'Lead', heroTitle: null }

function view(mode: 'public' | 'preview'): CraftPageView {
  const pub = mode === 'public'
  const copy = applyMode(craftCopy, mode)
  const way = (c: typeof craftWaySamples.hand) => ({
    ...c, image: pub ? null : img(c.title ?? ''), textCite: [], noteCite: [], text: applyMode(c.text, mode), note: applyMode(c.note, mode),
  })
  return {
    intro, hero: pub ? null : { image: img('hero'), caption: 'Chú thích' },
    steps: pub ? [] : [{
      n: 1, title: 'Nguyên liệu', shortTitle: 'NL', subtitle: null, body: 'Mô tả', tools: null, toRecord: null,
      image: img('s1'), shotNeeded: null, focus: [50, 50], flags: [],
    }],
    tools: craftToolSamples.map((t, i) => ({ n: i + 1, name: t.name, note: applyMode(t.note, mode), cite: [], image: pub ? null : img(`t${i + 1}`) })),
    compare: {
      hand: way(craftWaySamples.hand), machine: way(craftWaySamples.machine),
      rows: pub
        ? [{ aspect: 'Việc của đôi tay', hand: 'Đưa sợi', machine: 'Nạp cói', mobile: ['Thủ công: đưa sợi', 'Bằng máy: nạp cói'], muted: { hand: false, machine: false, mobile: [false, false] }, cite: [] }]
        : [...sampleRows, ...sampleRows.map((r) => ({ ...r, aspect: `${r.aspect} 2` }))].map((r) => ({ ...r, cite: [], muted: { hand: true, machine: true, mobile: r.mobile.map(() => true) } })),
    },
    readNext: craftReadNext.map((r) => ({ href: r.href, eyebrow: r.eyebrow, title: r.title, cta: r.cta, image: pub ? null : img(r.slot) })),
    sources: [],
    copy,
  }
}

afterEach(cleanup)

describe('CraftView', () => {
  it('không có dụng cụ thì không dựng section chỉ còn tiêu đề', () => {
    const page = { ...view('public'), tools: [] }
    const { container } = render(<CraftView page={page} />)
    expect(container.querySelector('#tools-h')).toBeNull()
    expect(container.querySelector('#compare-h')).not.toBeNull()
  })
  it('public tối thiểu: không có hành trình, không có "cần xác minh", h1 có <br>', () => {
    const { container } = render(<CraftView page={view('public')} />)
    expect(container.textContent).not.toContain('HÀNH TRÌNH MỘT TẤM CHIẾU')
    expect(container.textContent).not.toContain('cần xác minh')
    expect(screen.getByRole('heading', { level: 1 }).querySelectorAll('br')).toHaveLength(1)
    expect(screen.getAllByRole('link', { name: /Gặp những người dệt/ })).toHaveLength(1)
  })

  it('preview: tab So sánh có bảng 4 hàng thân, th scope đúng', () => {
    render(<CraftView page={view('preview')} />)
    fireEvent.click(screen.getByRole('tab', { name: /So sánh/ }))
    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('columnheader')).toHaveLength(3)
    const body = table.querySelectorAll('tbody tr')
    expect(body).toHaveLength(4)
    expect(body[0].querySelector('th')?.getAttribute('scope')).toBe('row')
    expect(table.querySelector('thead th')?.getAttribute('scope')).toBe('col')
  })

  it('"Đọc tiếp" có 3 link đúng href', () => {
    render(<CraftView page={view('preview')} />)
    const hrefs = ['/con-nguoi', '/cau-chuyen', '/san-pham'].map((h) => document.querySelector(`a[href="${h}"]`))
    expect(hrefs.every(Boolean)).toBe(true)
  })

  it('không có hàng so sánh thì bỏ tab So sánh (R7)', () => {
    const p = view('public')
    p.compare.rows = []
    render(<CraftView page={p} />)
    expect(screen.queryByRole('tab', { name: /So sánh/ })).toBeNull()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })
})

describe('VariantText / Tabs', () => {
  it('mobile null chỉ render bản desktop từ md; hai bản giống nhau in một lần', () => {
    const { container, rerender } = render(<p><VariantText value={{ desktop: 'A', mobile: null }} /></p>)
    expect(container.querySelector('span')?.className).toContain('max-md:hidden')
    rerender(<p><VariantText value={{ desktop: 'A', mobile: 'A' }} /></p>)
    expect(container.querySelectorAll('span')).toHaveLength(0)
    expect(container.textContent).toBe('A')
  })

  it('Tabs nhận nhãn ReactNode', () => {
    render(<Tabs label="x" tabs={[{ key: 'a', label: <em>Nhãn</em>, panel: 'P' }]} value="a" onChange={() => {}} />)
    expect(screen.getByRole('tab', { name: 'Nhãn' })).toBeTruthy()
  })
})

describe('FigureCard', () => {
  it('không ảnh: khung "Ảnh cần chụp"; caption hai bản; caption rỗng thì bỏ figcaption', () => {
    const { container, rerender } = render(<FigureCard label="DỤNG CỤ · 01" title="Khung dệt" caption={{ desktop: 'D', mobile: 'M' }} image={null} />)
    expect(screen.getByRole('img', { name: 'Ảnh cần chụp' })).toBeTruthy()
    expect(container.querySelectorAll('figcaption span')).toHaveLength(2)
    rerender(<FigureCard label="x" title="Khung dệt" caption={{ desktop: 'D', mobile: null }} image={img('a')} />)
    expect(container.querySelector('figcaption span')?.className).toContain('max-md:hidden')
    expect(container.querySelector('figcaption span.md\\:hidden')).toBeNull()
    rerender(<FigureCard label="x" title="Khung dệt" caption={{ desktop: null, mobile: null }} image={img('a')} />)
    expect(container.querySelector('figcaption')).toBeNull()
  })

  it('public: chú thích dụng cụ chỉ có "[cần xác minh]" thì thành null và không có figcaption', () => {
    const tools = view('public').tools
    expect(tools.every((t) => t.note.desktop === null && t.note.mobile === null)).toBe(true)
    const { container } = render(<FigureCard label="x" title={tools[0].name} caption={tools[0].note} image={null} />)
    expect(container.querySelector('figcaption')).toBeNull()
  })
})

describe('ReadNext', () => {
  it('không ảnh: không có <img>; có ảnh: alt rỗng (trang trí)', () => {
    const items = view('public').readNext
    const { container, rerender } = render(<ReadNext items={items} eyebrow="ĐỌC TIẾP" />)
    expect(container.querySelectorAll('img')).toHaveLength(0)
    expect(container.querySelectorAll('a')).toHaveLength(3)
    rerender(<ReadNext items={view('preview').readNext} eyebrow="ĐỌC TIẾP" />)
    expect(container.querySelectorAll('img[alt=""]')).toHaveLength(3)
  })
})

describe('So sánh: dòng mobile', () => {
  it('public: dòng mobile nguyên văn, không muted; preview: dòng chờ xác minh muted', () => {
    const pub = render(<CraftView page={view('public')} />)
    fireEvent.click(screen.getByRole('tab', { name: /So sánh/ }))
    expect(screen.getByText('Thủ công: đưa sợi').className).not.toContain('text-text-muted')
    pub.unmount()
    render(<CraftView page={view('preview')} />)
    fireEvent.click(screen.getByRole('tab', { name: /So sánh/ }))
    const muted = screen.getAllByText('Thủ công: [cần xác minh] · Máy: [cần xác minh]')
    expect(muted.every((el) => el.className.includes('text-text-muted'))).toBe(true)
  })
})

describe('Chú thích nguồn', () => {
  it('CraftView: không nguồn thì không có "Nguồn tham khảo"; có nguồn thì có', () => {
    const { rerender } = render(<CraftView page={view('public')} />)
    expect(screen.queryByRole('heading', { name: 'Nguồn tham khảo' })).toBeNull()
    rerender(<CraftView page={{ ...view('public'), sources: sampleSources.slice(0, 1) }} />)
    expect(screen.getByRole('heading', { name: 'Nguồn tham khảo' })).toBeTruthy()
  })

  it('FigureCard: có cite thì render trong figcaption, không có thì như cũ', () => {
    const numbers = sourceNumbers(sampleSources)
    const { container, rerender } = render(
      <FigureCard label="x" title="T" caption={{ desktop: 'D', mobile: null }} image={null} cite={<Cite ids={[sampleSources[0].id]} numbers={numbers} variant="bracket" />} />,
    )
    expect(container.querySelector('figcaption')?.textContent).toContain('[1]')
    rerender(<FigureCard label="x" title="T" caption={{ desktop: 'D', mobile: null }} image={null} />)
    expect(container.querySelector('figcaption')?.textContent).toBe('D')
  })

  it('ComparisonTabs: có numbers thì hiện [1] ở ô máy và đoạn mô tả; không có numbers thì không', () => {
    const rows = [{ ...sampleRows[0], cite: [sampleSources[0].id] }]
    const props = { hand: { ...craftWaySamples.hand, textCite: [], noteCite: [] }, machine: craftWaySamples.machine, rows, rowsNote: null, labels: applyMode(craftCopy, 'preview').compare }
    const { container, rerender } = render(<ComparisonTabs {...props} numbers={sourceNumbers(sampleSources)} />)
    fireEvent.click(screen.getByRole('tab', { name: /So sánh/ }))
    expect(container.textContent).toContain('[1]')
    rerender(<ComparisonTabs {...props} />)
    expect(container.textContent).not.toContain('[')
  })

  const base = () => ({ hand: { ...craftWaySamples.hand, textCite: [] as string[], noteCite: [] as string[] }, machine: craftWaySamples.machine, rowsNote: null, labels: applyMode(craftCopy, 'preview').compare })
  const numbers = sourceNumbers(sampleSources)
  const id = sampleSources[0].id

  it('ComparisonTabs: machine null thì [1] đi sau ô thủ công, không nằm trong ô máy trống', () => {
    const rows = [{ ...sampleRows[0], machine: null, cite: [id] }]
    const { container } = render(<ComparisonTabs {...base()} rows={rows} numbers={numbers} />)
    fireEvent.click(screen.getByRole('tab', { name: /So sánh/ }))
    const [handTd, machineTd] = Array.from(container.querySelectorAll('tbody td')).slice(0, 2)
    expect(handTd.textContent).toContain('[1]')
    expect(machineTd.textContent).toBe('')
  })

  it('ComparisonTabs: bình thường [1] ở ô máy, không ở ô thủ công', () => {
    const rows = [{ ...sampleRows[0], cite: [id] }]
    const { container } = render(<ComparisonTabs {...base()} rows={rows} numbers={numbers} />)
    fireEvent.click(screen.getByRole('tab', { name: /So sánh/ }))
    const [handTd, machineTd] = Array.from(container.querySelectorAll('tbody td')).slice(0, 2)
    expect(handTd.textContent).not.toContain('[1]')
    expect(machineTd.textContent).toContain('[1]')
  })

  it('ComparisonTabs: mobile không có dòng thì không có [n] thừa ở ô mobile; có dòng thì [1] sau dòng cuối', () => {
    const none = [{ ...sampleRows[0], mobile: [], muted: { hand: false, machine: false, mobile: [] }, cite: [id] }]
    const { container, rerender } = render(<ComparisonTabs {...base()} rows={none} numbers={numbers} />)
    fireEvent.click(screen.getByRole('tab', { name: /So sánh/ }))
    expect(container.querySelectorAll('td.md\\:hidden')).toHaveLength(0)
    rerender(<ComparisonTabs {...base()} rows={[{ ...sampleRows[0], cite: [id] }]} numbers={numbers} />)
    const lines = Array.from(container.querySelectorAll('td.md\\:hidden'))
    expect(lines[0].textContent).not.toContain('[1]')
    expect(lines[lines.length - 1].textContent).toContain('[1]')
  })

  it('ComparisonTabs: textCite có thì [1] đi sau đoạn mô tả', () => {
    const { container } = render(<ComparisonTabs {...base()} hand={{ ...craftWaySamples.hand, textCite: [id], noteCite: [] }} rows={[]} numbers={numbers} />)
    const [text, note] = Array.from(container.querySelectorAll('p'))
    expect(text.textContent).toMatch(/\[1\]$/)
    expect(note.textContent).not.toContain('[1]')
  })

  it('ComparisonTabs: chỉ ghi chú có nguồn thì [1] đi sau ghi chú, không sau mô tả', () => {
    const { container } = render(<ComparisonTabs {...base()} hand={{ ...craftWaySamples.hand, textCite: [], noteCite: [id] }} rows={[]} numbers={numbers} />)
    const [text, note] = Array.from(container.querySelectorAll('p'))
    expect(text.textContent).not.toContain('[1]')
    expect(note.textContent).toMatch(/\[1\]$/)
  })

  it('ComparisonTabs: mô tả bị ẩn, ghi chú có nguồn vẫn hiện kèm [1]', () => {
    const hand = { ...craftWaySamples.hand, text: { desktop: null, mobile: null }, textCite: [], note: { desktop: '2 lá/ngày', mobile: '2 lá/ngày' }, noteCite: [id] }
    const { container } = render(<ComparisonTabs {...base()} hand={hand} rows={[]} numbers={numbers} />)
    const ps = Array.from(container.querySelectorAll('p'))
    expect(ps).toHaveLength(1)
    expect(ps[0].textContent).toMatch(/2 lá\/ngày.*\[1\]$/)
  })
})

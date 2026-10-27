import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { CraftPageView, ImageView } from '@/lib/content'
import { applyMode } from '@/lib/content/copy/applyMode'
import { craftCompare, craftCopy, craftReadNext, craftTools } from '@/lib/content/copy/craft'
import { CraftView } from '@/components/craft/CraftView'
import { FigureCard } from '@/components/content/FigureCard'
import { ReadNext } from '@/components/content/ReadNext'
import { Tabs } from '@/components/ui/Tabs'
import { VariantText } from '@/components/ui/VariantText'

const img = (name: string): ImageView => ({ url: `/${name}.webp`, alt: name, width: 800, height: 600, sizes: {}, photographer: null, code: null, docNumber: null, flags: [] })
const intro = { eyebrow: '03 — NGHỀ DỆT CHIẾU', title: 'Một tấm chiếu,\nmuôn công đoạn.', lead: 'Lead', heroTitle: null }

function view(mode: 'public' | 'preview'): CraftPageView {
  const pub = mode === 'public'
  const copy = applyMode(craftCopy, mode)
  const way = (c: typeof craftCompare.hand) => ({
    title: c.title, image: pub ? null : img(c.title), text: applyMode(c.text, mode), note: applyMode(c.note, mode),
  })
  return {
    intro, hero: pub ? null : { image: img('hero'), caption: 'Chú thích' },
    steps: pub ? [] : [{
      n: 1, title: 'Nguyên liệu', shortTitle: 'NL', subtitle: null, body: 'Mô tả', tools: null, toRecord: null,
      image: img('s1'), shotNeeded: null, focus: [50, 50], flags: [],
    }],
    tools: craftTools.map((t) => ({ n: t.n, name: t.name, note: applyMode(t.note, mode), image: pub ? null : img(`t${t.n}`) })),
    compare: {
      hand: way(craftCompare.hand), machine: way(craftCompare.machine),
      rows: pub
        ? [{ aspect: 'Việc của đôi tay', hand: 'Đưa sợi', machine: 'Nạp cói', mobile: ['Thủ công: đưa sợi', 'Bằng máy: nạp cói'], muted: { hand: false, machine: false, mobile: [false, false] } }]
        : craftCompare.rows.map((r) => ({ ...r, mobile: [...r.mobile], muted: { hand: true, machine: true, mobile: r.mobile.map(() => true) } })),
    },
    readNext: craftReadNext.map((r) => ({ href: r.href, eyebrow: r.eyebrow, title: r.title, cta: r.cta, image: pub ? null : img(r.slot) })),
    copy,
  }
}

afterEach(cleanup)

describe('CraftView', () => {
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

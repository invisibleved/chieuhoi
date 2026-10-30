import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import type { ImageView, SourceView, VillagePageView } from '@/lib/content'
import { applyMode } from '@/lib/content/copy/applyMode'
import { villageTimelineAdd } from '@/lib/content/copy/village'
import { mergeVillageCopy, seedVillageFacts } from './village-fixture'
import { villageFactsFrom } from '@/lib/content/pageFacts'
import { VillageView } from '@/components/village/VillageView'

const img = (name: string, docNumber: string | null = null): ImageView => ({ url: `/${name}.webp`, alt: name, width: 800, height: 600, sizes: {}, photographer: null, code: null, docNumber, flags: [] })
const src = (id: string, title: string): SourceView => ({ id, publisher: 'NXB', title, url: `https://example.com/${id}`, date: '01/01/2024' }) as SourceView

const all = [src('vietnamplus-2026', 'Một'), src('danviet-2024', 'Hai'), src('daidoanket-2021', 'Ba')]

function view(mode: 'public' | 'preview'): VillagePageView {
  const pub = mode === 'public'
  const sources = pub ? [all[0], all[2]] : all
  const visible = new Set(sources.map((s) => s.id))
  const facts = seedVillageFacts.facts.flatMap((f) => {
    const cite = f.cite.filter((id) => visible.has(id))
    const note = (k: 'desktop' | 'mobile') => (f.note[k] && !pub && f.editorNote ? `${f.note[k]} · ${f.editorNote}` : f.note[k])
    return [{ term: f.term, detail: applyMode(f.detail, mode), note: applyMode({ desktop: note('desktop'), mobile: note('mobile') }, mode), cite }]
  })
  const add = applyMode(villageTimelineAdd, mode)
  return {
    intro: { eyebrow: '01 — LÀNG HỚI', title: 'Có một làng Hới...', lead: 'Lead', heroTitle: null },
    hero: { image: img('hero', '021'), caption: pub ? null : 'Chiếu phơi bên ao làng' },
    facts,
    timeline: [
      { label: '1457', title: 'Sinh', body: 'Nội dung', confidence: 'press', sourceIds: [], sourceLine: 'Nguồn', sourceHref: null, flags: [] },
      { label: add.label, title: add.title, body: add.body, confidence: 'pending', sourceIds: [], sourceLine: add.sourceLine, sourceHref: add.sourceHref, flags: [] },
    ],
    life: pub ? [] : [{ image: img('l1'), caption: 'Một' }, { image: img('l2'), caption: 'Hai' }, { image: img('l3'), caption: 'Ba' }],
    sources,
    copy: applyMode(mergeVillageCopy(), mode),
  } as VillagePageView
}

afterEach(cleanup)

describe('VillageView', () => {
  it('preview: bảng thông tin 3 mục, chú thích trỏ tới nguồn, 3 nguồn', () => {
    const { container } = render(<VillageView page={view('preview')} />)
    for (const id of ['village-facts-desktop', 'village-facts-mobile']) {
      const dts = within(screen.getByTestId(id)).getAllByText(/./, { selector: 'dt' })
      expect(dts.map((d) => d.textContent)).toEqual(['TÊN GỌI', 'ĐỊA GIỚI HIỆN NAY', 'TỔ NGHỀ'])
    }
    expect(screen.getAllByRole('link', { name: 'Nguồn 1' })[0].getAttribute('href')).toBe('#nguon-1')
    const list = screen.getByRole('heading', { name: 'Nguồn tham khảo' }).closest('section')!
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    expect(container.textContent).toContain('Chờ dữ liệu địa lý')
    expect(container.textContent).toContain('Cần đối chiếu với sử liệu khoa bảng')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Có một làng Hới...')
  })

  it('public: nguồn bị lọc thì không còn "Nguồn 3", không có chữ chỉ của preview, không có [] rỗng', () => {
    const { container } = render(<VillageView page={view('public')} />)
    expect(screen.queryByRole('link', { name: 'Nguồn 3' })).toBeNull()
    for (const s of ['cần đối chiếu', 'Cần đối chiếu với sử liệu', 'Chờ dữ liệu địa lý', 'cần xác minh']) expect(container.textContent).not.toContain(s)
    expect(container.textContent).not.toContain('[]')
    const list = screen.getByRole('heading', { name: 'Nguồn tham khảo' }).closest('section')!
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    expect(container.querySelector('#life-h')).toBeNull()
  })

  it('public: câu bị lọc hết chữ nhưng còn cite thì không để lại số chú thích mồ côi hay <p> rỗng', () => {
    const founderRefs = (c: HTMLElement) => c.querySelector('#founder-h')!.closest('section')!.querySelectorAll('a[aria-label^="Nguồn"]').length
    const base = render(<VillageView page={view('public')} />)
    const baseCount = founderRefs(base.container)
    cleanup()
    const page = view('public')
    page.copy.heritage.paragraphs[1] = { ...page.copy.heritage.paragraphs[1], text: { desktop: null, mobile: null }, cite: ['vietnamplus-2026'] }
    page.copy.founder.paragraphs[1].parts[1] = { text: { desktop: null, mobile: null }, cite: ['daidoanket-2021'] }
    const { container } = render(<VillageView page={page} />)
    // Câu bị lọc không để lại số chú thích.
    expect(founderRefs(container)).toBe(baseCount - 1)
    expect(container.querySelector('#heritage-h')!.closest('section')!.querySelectorAll('a[aria-label^="Nguồn"]')).toHaveLength(1)
    for (const p of container.querySelectorAll('p')) expect(p.textContent?.trim()).not.toBe('')
  })

  it('public: Tổ nghề mất hết câu thì chỉ còn dòng "không có chân dung" (desktop): section ẩn dưới md; mất cả dòng đó thì bỏ section', () => {
    const page = view('public')
    const empty = { desktop: null, mobile: null }
    page.copy.founder.paragraphs = page.copy.founder.paragraphs.map((p) => ({ parts: p.parts.map((x) => ({ ...x, text: empty, cite: [] })) }))
    page.copy.founder.conflict.parts = page.copy.founder.conflict.parts.map((x) => ({ ...x, text: empty, cite: [] }))
    const { container, rerender } = render(<VillageView page={page} />)
    const section = container.querySelector('#founder-h')!.closest('section')!
    expect(section.className).toContain('max-md:hidden')
    expect(section.textContent).toContain('Không có chân dung lịch sử')
    rerender(<VillageView page={{ ...page, copy: { ...page.copy, founder: { ...page.copy.founder, noPortrait: empty } } }} />)
    expect(container.querySelector('#founder-h')).toBeNull()
  })

  it('Tổ nghề còn câu mobile thì section hiện ở mọi cỡ', () => {
    const { container } = render(<VillageView page={view('public')} />)
    expect(container.querySelector('#founder-h')!.closest('section')!.className).not.toContain('max-md:hidden')
  })

  it('public: Vị trí không có câu và không có bản đồ thì bỏ section', () => {
    const page = view('public')
    page.copy.location.body = { text: null, cite: [] }
    const { container } = render(<VillageView page={page} />)
    expect(container.querySelector('#location-h')).toBeNull()
  })

  it('Vị trí: không có bản đồ (public) thì chữ rộng 8 cột; có bản đồ (preview) thì 5 cột', () => {
    const pub = render(<VillageView page={view('public')} />)
    expect(pub.container.querySelector('#location-h')!.parentElement!.className).toContain('md:col-span-8')
    cleanup()
    const pre = render(<VillageView page={view('preview')} />)
    expect(pre.container.querySelector('#location-h')!.parentElement!.className).toContain('md:col-span-5')
  })

  it('chú thích dạng [n] (F3); liên kết di sản không lặp mũi tên', () => {
    render(<VillageView page={view('preview')} />)
    expect(screen.getAllByRole('link', { name: 'Nguồn 1' })[0].textContent).toBe('[1]')
    const link = screen.getByRole('link', { name: /Xem quy trình dệt chiếu/ })
    expect(link.textContent!.match(/→/g)?.length ?? 0).toBeLessThanOrEqual(1)
  })

  it('ảnh đầu trang: nhãn tư liệu desktop và dòng TL mobile lấy từ copy', () => {
    const { container } = render(<VillageView page={view('preview')} />)
    expect(container.textContent).toContain('TƯ LIỆU · 021')
    expect(container.querySelector('figcaption')!.textContent).toBe('TL · 021 · Chiếu phơi bên ao làng')
  })

  it('dữ kiện trống (CMS thiếu nhóm): public vẫn render, ẩn bảng thông tin, tổ nghề, vị trí', () => {
    const empty = villageFactsFrom(undefined)
    const page = { ...view('public'), facts: [], sources: [], copy: applyMode(mergeVillageCopy(empty), 'public') } as VillagePageView
    const { container } = render(<VillageView page={page} />)
    expect(container.querySelector('#founder-h')).toBeNull()
    expect(container.querySelector('#location-h')).toBeNull()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Có một làng Hới...')
  })
})

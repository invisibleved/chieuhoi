import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import type { ImageView, SourceView, VillagePageView } from '@/lib/content'
import { applyMode } from '@/lib/content/copy/applyMode'
import { villageCopy, villageFacts, villageTimelineAdd } from '@/lib/content/copy/village'
import { VillageView } from '@/components/village/VillageView'

const img = (name: string, docNumber: string | null = null): ImageView => ({ url: `/${name}.webp`, alt: name, width: 800, height: 600, sizes: {}, photographer: null, code: null, docNumber, flags: [] })
const src = (id: string, title: string): SourceView => ({ id, publisher: 'NXB', title, url: `https://example.com/${id}`, date: '01/01/2024' }) as SourceView

const all = [src('vietnamplus-2026', 'Một'), src('danviet-2024', 'Hai'), src('daidoanket-2021', 'Ba')]

function view(mode: 'public' | 'preview'): VillagePageView {
  const pub = mode === 'public'
  const sources = pub ? [all[0], all[2]] : all
  const visible = new Set(sources.map((s) => s.id))
  const facts = villageFacts.flatMap((f) => {
    const cite = f.cite.filter((id) => visible.has(id))
    const note = (k: 'desktop' | 'mobile') => (f.note[k] && !pub && f.notePreview[k] ? `${f.note[k]} · ${f.notePreview[k]}` : f.note[k])
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
    copy: applyMode(villageCopy, mode),
  } as VillagePageView
}

afterEach(cleanup)

describe('VillageView', () => {
  it('preview: bảng thông tin 3 mục, chú thích trỏ tới nguồn, 3 nguồn', () => {
    const { container } = render(<VillageView page={view('preview')} />)
    const dts = container.querySelectorAll('dl')[0].querySelectorAll('dt')
    expect([...dts].map((d) => d.textContent)).toEqual(['TÊN GỌI', 'ĐỊA GIỚI HIỆN NAY', 'TỔ NGHỀ'])
    expect(screen.getAllByRole('link', { name: 'Nguồn 1' })[0].getAttribute('href')).toBe('#nguon-1')
    const list = screen.getByRole('heading', { name: 'Nguồn tham khảo' }).closest('section')!
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    expect(container.textContent).toContain('Chờ dữ liệu địa lý')
    expect(container.textContent).toContain('cần đối chiếu')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Có một làng Hới...')
  })

  it('public: nguồn bị lọc thì không còn "Nguồn 3", không có chữ chỉ của preview, không có [] rỗng', () => {
    const { container } = render(<VillageView page={view('public')} />)
    expect(screen.queryByRole('link', { name: 'Nguồn 3' })).toBeNull()
    for (const s of ['cần đối chiếu', 'Chờ dữ liệu địa lý', 'cần xác minh']) expect(container.textContent).not.toContain(s)
    expect(container.textContent).not.toContain('[]')
    const list = screen.getByRole('heading', { name: 'Nguồn tham khảo' }).closest('section')!
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    expect(container.querySelector('#life-h')).toBeNull()
  })
})

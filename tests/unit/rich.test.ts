// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { nonEmptyRich, sanitizeRich, splitAtHeading, type RichContext } from '@/lib/content/rich'
import type { ImageView, Mode } from '@/lib/content/types'

const txt = (text: string) => ({ type: 'text', version: 1, text, format: 0, mode: 'normal', style: '', detail: 0 })
const para = (...children: unknown[]) => ({ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, children })
const h = (tag: string, text: string) => ({ type: 'heading', tag, version: 1, direction: 'ltr', format: '', indent: 0, children: [txt(text)] })
const cite = (source: unknown) => ({ type: 'inlineBlock', version: 1, fields: { blockType: 'cite', source } })
const figure = (image: unknown, caption: string | null) => ({
  type: 'block', version: 2, format: '', fields: { id: 'f1', blockName: '', blockType: 'figure', image, caption },
})
const doc = (...children: unknown[]) => ({
  root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children },
})

const img: ImageView = {
  url: '/a.webp', alt: 'Ảnh', width: 10, height: 10, sizes: {}, photographer: null, code: null, docNumber: null, flags: [],
}

// Nguồn id 1..3 trong DB; 9 là nguồn có trong DB nhưng bị ẩn (không nằm trong visibleSourceIds).
const ctx = (mode: Mode, extra: Partial<RichContext> = {}): RichContext => ({
  sources: new Map([[1, 'a'], [2, 'b'], [3, 'c'], [9, 'hidden']]),
  visibleSourceIds: ['a', 'b', 'c'],
  assets: new Map<number, ImageView | null>([[7, img], [8, null]]),
  mode,
  ...extra,
})

type N = { type: string; children?: N[]; [k: string]: unknown }
const rootOf = (r: ReturnType<typeof sanitizeRich>) => r.rich?.root as N
const cites = (n: N): N[] => (n.type === 'cite' ? [n] : (n.children ?? []).flatMap(cites))

describe('sanitizeRich và [cần xác minh]', () => {
  const marked = doc(para(txt('Mở đầu '), txt('[cần  xác minh]')), para(txt('Đoạn khác')))

  it('public: trường có dấu ở bất kỳ nút chữ nào thì ẩn cả trường', () => {
    expect(sanitizeRich(marked, ctx('public')).rich).toBeNull()
  })
  it('public: dấu bị tách qua nhiều nút chữ vẫn bị bắt', () => {
    const split = doc(para(txt('[cần '), txt('xác minh]')))
    expect(sanitizeRich(split, ctx('public')).rich).toBeNull()
  })
  it('public: không có dấu thì giữ', () => {
    expect(sanitizeRich(doc(para(txt('Ổn'))), ctx('public')).rich).not.toBeNull()
  })
  it('preview: giữ nguyên', () => {
    expect(JSON.stringify(sanitizeRich(marked, ctx('preview')).rich)).toContain('[cần  xác minh]')
  })
  it('đầu vào không phải cây Lexical thì trả rỗng', () => {
    expect(sanitizeRich(null, ctx('public'))).toEqual({ rich: null, citedOrder: [], toc: [] })
  })
})

describe('sanitizeRich: lọc nút', () => {
  it('bỏ nút lạ (upload, relationship), liên kết nội bộ chỉ giữ chữ, liên kết ngoài giữ url', () => {
    const r = sanitizeRich(doc(
      para(
        txt('Chữ'),
        { type: 'link', version: 1, fields: { linkType: 'internal', doc: { value: 1 } }, children: [txt('nội bộ')] },
        { type: 'link', version: 1, fields: { linkType: 'custom', url: 'https://a.vn', newTab: true }, children: [txt('ngoài')] },
      ),
      { type: 'upload', version: 1, value: 5 },
      { type: 'relationship', version: 1, value: 6 },
    ), ctx('public'))
    const root = rootOf(r)
    expect(root.children).toHaveLength(1)
    const kids = root.children![0].children!
    expect(kids.map((k) => k.type)).toEqual(['text', 'text', 'link'])
    expect(kids[2].fields).toEqual({ linkType: 'custom', url: 'https://a.vn', newTab: true })
  })
})

describe('sanitizeRich: cite (R4)', () => {
  it('cite thành { type: cite, n } theo thứ tự trích đầu tiên; cùng nguồn cùng số', () => {
    const r = sanitizeRich(doc(para(txt('x'), cite(2), cite(1)), para(txt('y'), cite(2), cite(3))), ctx('public'))
    expect(r.citedOrder).toEqual(['b', 'a', 'c'])
    expect(cites(rootOf(r))).toEqual([{ type: 'cite', n: 1 }, { type: 'cite', n: 2 }, { type: 'cite', n: 1 }, { type: 'cite', n: 3 }])
  })
  it('cite dạng object (depth > 0) cũng được nhận', () => {
    const r = sanitizeRich(doc(para(txt('x'), cite({ id: 3, sourceId: 'c' }))), ctx('public'))
    expect(r.citedOrder).toEqual(['c'])
  })
  it('cite tới nguồn bị ẩn hoặc đã xoá bị bỏ, không để lại nút và không chiếm số', () => {
    const r = sanitizeRich(doc(para(txt('x'), cite(9), cite(42), cite(3))), ctx('public'))
    expect(r.citedOrder).toEqual(['c'])
    expect(cites(rootOf(r))).toEqual([{ type: 'cite', n: 1 }])
    expect(JSON.stringify(r.rich)).not.toContain('hidden')
    expect(JSON.stringify(r.rich)).not.toContain('inlineBlock')
  })
  it('public: đoạn có 2 cite đều bị bỏ thì bỏ cả đoạn; preview: giữ đoạn, bỏ cite', () => {
    const body = doc(para(txt('Giữ')), para(txt('Mất'), cite(9), cite(42)))
    const pub = rootOf(sanitizeRich(body, ctx('public')))
    expect(pub.children).toHaveLength(1)
    expect(JSON.stringify(pub)).not.toContain('Mất')
    const pre = rootOf(sanitizeRich(body, ctx('preview')))
    expect(pre.children).toHaveLength(2)
    expect(JSON.stringify(pre)).toContain('Mất')
    expect(cites(pre)).toEqual([])
  })
  it('cite và heading trong nút bị bỏ (khối lạ) không chiếm số, không vào mục lục', () => {
    const r = sanitizeRich(doc(
      { type: 'unknown-wrapper', version: 1, children: [para(txt('ẩn'), cite(1)), h('h2', 'Ẩn')] },
      para(txt('hiện'), cite(2)),
    ), ctx('public'))
    expect(r.citedOrder).toEqual(['b'])
    expect(cites(rootOf(r))).toEqual([{ type: 'cite', n: 1 }])
    expect(r.toc).toEqual([])
  })
  it('đoạn không có cite không bị ảnh hưởng', () => {
    const r = sanitizeRich(doc(para(txt('Không trích'))), ctx('public'))
    expect(rootOf(r).children).toHaveLength(1)
    expect(r.citedOrder).toEqual([])
  })
})

describe('sanitizeRich: figure (R3)', () => {
  it('asset null (ảnh bị loại ở public) thì bỏ hẳn khối', () => {
    const r = sanitizeRich(doc(para(txt('a')), figure(8, 'Chú thích')), ctx('public'))
    expect(rootOf(r).children!.map((c) => c.type)).toEqual(['paragraph'])
  })
  it('asset không có trong map thì bỏ khối', () => {
    const r = sanitizeRich(doc(figure(99, 'Chú thích')), ctx('preview'))
    expect(rootOf(r).children).toEqual([])
  })
  it('có ImageView thì ra { type: figure, image, caption }', () => {
    const r = sanitizeRich(doc(figure(7, 'Đôi tay')), ctx('public'))
    expect(rootOf(r).children).toEqual([{ type: 'figure', image: img, caption: 'Đôi tay' }])
  })
  it('image dạng object (depth > 0) dùng id để tra map', () => {
    const r = sanitizeRich(doc(figure({ id: 7, url: '/x' }, 'Đôi tay')), ctx('public'))
    expect(rootOf(r).children![0]).toMatchObject({ type: 'figure', image: img })
  })
  it('caption chưa xác minh: public null, preview giữ nguyên văn', () => {
    const cap = 'Đôi tay. Ảnh: [tác giả — cần xác minh]'
    expect(rootOf(sanitizeRich(doc(figure(7, cap)), ctx('public'))).children![0].caption).toBeNull()
    expect(rootOf(sanitizeRich(doc(figure(7, cap)), ctx('preview'))).children![0].caption).toBe(cap)
  })
  it('khối block khác figure bị bỏ', () => {
    const r = sanitizeRich(doc({ type: 'block', version: 2, fields: { blockType: 'other' } }), ctx('preview'))
    expect(rootOf(r).children).toEqual([])
  })
})

describe('sanitizeRich: mục lục (R5)', () => {
  it('h2 có anchor slug không dấu; h3 không có', () => {
    const r = sanitizeRich(doc(h('h2', 'Một Tam nguyên của làng Hải Triều'), h('h3', 'Phụ')), ctx('public'))
    const [h2, h3] = rootOf(r).children!
    expect(h2.anchor).toBe('mot-tam-nguyen-cua-lang-hai-trieu')
    expect(h3.anchor).toBeUndefined()
    expect(r.toc).toEqual([{ id: 'mot-tam-nguyen-cua-lang-hai-trieu', title: 'Một Tam nguyên của làng Hải Triều' }])
  })
  it('hai h2 trùng chữ ra x và x-2; toc đúng thứ tự', () => {
    const r = sanitizeRich(doc(h('h2', 'Đời sống'), para(txt('a')), h('h2', 'Khác'), h('h2', 'Đời sống')), ctx('public'))
    expect(r.toc).toEqual([
      { id: 'doi-song', title: 'Đời sống' },
      { id: 'khac', title: 'Khác' },
      { id: 'doi-song-2', title: 'Đời sống' },
    ])
  })
  it('slug sinh ra không trùng slug đã có: "A", "A", "A 2" ra a, a-2, a-2-2', () => {
    const r = sanitizeRich(doc(h('h2', 'A'), h('h2', 'A'), h('h2', 'A 2')), ctx('public'))
    expect(r.toc.map((t) => t.id)).toEqual(['a', 'a-2', 'a-2-2'])
  })
  it('anchors: false thì không gắn anchor, toc rỗng', () => {
    const r = sanitizeRich(doc(h('h2', 'A')), ctx('public', { anchors: false }))
    expect(rootOf(r).children![0].anchor).toBeUndefined()
    expect(r.toc).toEqual([])
  })
})

describe('sanitizeRich: khung rỗng', () => {
  const list = (...items: unknown[]) => ({ type: 'list', listType: 'bullet', version: 1, children: items })
  const li = (...children: unknown[]) => ({ type: 'listitem', version: 1, value: 1, children })
  const quote = (...children: unknown[]) => ({ type: 'quote', version: 1, children })

  it('danh sách và trích dẫn mà mọi con đều bị bỏ thì bỏ luôn', () => {
    const r = sanitizeRich(doc(
      list(li({ type: 'upload', version: 1, value: 5 })),
      quote({ type: 'relationship', version: 1, value: 6 }),
      para(txt('còn')),
    ), ctx('preview'))
    expect(rootOf(r).children!.map((c) => c.type)).toEqual(['paragraph'])
  })
  it('public: danh sách có mục duy nhất mất hết cite thì bỏ cả danh sách', () => {
    const r = sanitizeRich(doc(list(li(txt('x'), cite(9)))), ctx('public'))
    expect(rootOf(r).children).toEqual([])
  })
  it('danh sách còn mục thì giữ', () => {
    const r = sanitizeRich(doc(list(li(txt('x')), li({ type: 'upload', version: 1 }))), ctx('public'))
    expect(rootOf(r).children![0].children).toHaveLength(1)
  })
})

describe('splitAtHeading (R15)', () => {
  const tree = doc(para(txt('mở')), h('h3', 'A'), para(txt('a')), h('h3', 'B'), para(txt('b')), h('h3', 'C'), para(txt('c')))
  const texts = (r: unknown) => ((r as { root: N } | null)?.root.children ?? []).map((c) => (c.children?.[0] as N | undefined)?.text)

  it('ba heading: phần trước heading thứ hai và phần từ heading thứ hai trở đi', () => {
    const [a, b] = splitAtHeading(tree as never, 2)
    expect(texts(a)).toEqual(['mở', 'A', 'a'])
    expect(texts(b)).toEqual(['B', 'b', 'C', 'c'])
    expect((a as { root: N }).root.type).toBe('root')
    expect((b as { root: N }).root.type).toBe('root')
  })
  it('không có heading thứ hai: [rich, null]', () => {
    const one = doc(h('h3', 'A'), para(txt('a')))
    const [a, b] = splitAtHeading(one as never, 2)
    expect(a).toBe(one)
    expect(b).toBeNull()
  })
  it('null: [null, null]', () => {
    expect(splitAtHeading(null, 2)).toEqual([null, null])
  })
})

describe('nonEmptyRich', () => {
  it('cây chỉ có đoạn rỗng hoặc khoảng trắng: null', () => {
    expect(nonEmptyRich(doc(para(), para(txt('  ')), h('h3', ' ')) as never)).toBeNull()
    expect(nonEmptyRich(null)).toBeNull()
  })
  it('public lọc hết nội dung (đoạn mất hết cite): null', () => {
    const r = sanitizeRich(doc(para(txt('x'), cite(9))), ctx('public')).rich
    expect(r).not.toBeNull()
    expect(nonEmptyRich(r)).toBeNull()
  })
  it('còn chữ hoặc còn ảnh: giữ nguyên', () => {
    const withText = doc(para(txt('có chữ')))
    expect(nonEmptyRich(withText as never)).toBe(withText)
    const withFigure = sanitizeRich(doc(figure(7, null)), ctx('public')).rich
    expect(nonEmptyRich(withFigure)).toBe(withFigure)
  })
})

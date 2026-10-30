import { describe, expect, it } from 'vitest'
import {
  compareMobileLines, craftFactsFrom, orderSources, sourceIdsOf, toCited, villageFactsFrom,
} from '@/lib/content/pageFacts'

describe('toCited', () => {
  it('uses text for both variants', () => {
    expect(toCited({ text: 'A' }).text).toEqual({ desktop: 'A', mobile: 'A' })
  })
  it('prefers mobileText on mobile', () => {
    expect(toCited({ text: 'A', mobileText: 'a' }).text).toEqual({ desktop: 'A', mobile: 'a' })
  })
  it('hides on mobile', () => {
    expect(toCited({ text: 'A', hideOnMobile: true }).text.mobile).toBeNull()
  })
  it('takes cite from sourceId', () => {
    expect(toCited({ text: 'A', sources: [{ sourceId: 's1' }, 3] }).cite).toEqual(['s1'])
  })
  it('tolerates null', () => {
    expect(toCited(null)).toEqual({ text: { desktop: null, mobile: null }, cite: [] })
  })
})

describe('helpers', () => {
  it('sourceIdsOf ignores unpopulated or missing relations', () => {
    expect(sourceIdsOf([{ sourceId: 'x' }, 7, null, {}])).toEqual(['x'])
  })
  it('orderSources appends cited ids not listed', () => {
    expect(orderSources(['b', 'a'], ['a', 'c', 'b', 'd', 'c'])).toEqual(['b', 'a', 'c', 'd'])
  })
  it('compareMobileLines splits by newline and auto-composes when empty', () => {
    expect(compareMobileLines({ mobile: 'Thủ công: x\n\nBằng máy: y' })).toEqual(['Thủ công: x', 'Bằng máy: y'])
    expect(compareMobileLines({ hand: '[cần xác minh]', machine: '[cần xác minh]' })).toEqual([
      'Thủ công: [cần xác minh] · Máy: [cần xác minh]',
    ])
  })
})

describe('villageFactsFrom', () => {
  it('handles undefined', () => {
    const v = villageFactsFrom(undefined)
    expect(v.facts).toEqual([])
    expect(v.founder.paragraphs).toEqual([])
    expect(v.founder.conflict.parts).toEqual([])
    expect(v.location.body).toEqual({ text: '', cite: [] })
    expect(v.heritage.paragraphs).toEqual([])
    expect(v.sourceOrder).toEqual([])
  })
  it('appends new cited ids to sourceOrder', () => {
    const ids = ['vietnamplus-2026', 'danviet-2024', 'daidoanket-2021', 'nq-1666-2025', 'nq-202-2025']
    const v = villageFactsFrom({
      pageSources: ids.map((sourceId) => ({ sourceId })),
      heritage: { sentences: [{ text: 'h', sources: [{ sourceId: 'x-moi' }] }] },
    })
    expect(v.sourceOrder).toEqual([...ids, 'x-moi'])
  })
  it('maps facts and desktop-only notes', () => {
    const v = villageFactsFrom({
      facts: [{ term: 'T', detail: 'D', note: 'N', editorNote: 'E', sources: [{ sourceId: 'a' }] }],
      founder: { noPortrait: 'np', conflictEditorNote: 'c', paragraphs: [{ sentences: [{ text: 'p' }] }] },
    })
    expect(v.facts[0]).toEqual({
      term: 'T', detail: { desktop: 'D', mobile: 'D' }, note: { desktop: 'N', mobile: 'N' },
      editorNote: 'E', cite: ['a'],
    })
    expect(v.founder.noPortrait).toEqual({ desktop: 'np', mobile: null })
    expect(v.founder.conflict.closing).toEqual({ desktop: 'c', mobile: null })
    expect(v.founder.paragraphs[0].parts[0].text.desktop).toBe('p')
  })
})

describe('craftFactsFrom', () => {
  it('handles undefined', () => {
    const c = craftFactsFrom(undefined)
    expect(c.tools).toEqual([])
    expect(c.rows).toEqual([])
    const empty = { text: { desktop: null, mobile: null }, cite: [] }
    expect(c.hand).toEqual({ title: '', text: empty, note: empty })
    expect(c.sourceOrder).toEqual([])
  })
  it('maps tools, ways and rows', () => {
    const c = craftFactsFrom({
      tools: [{ name: 'Khung', note: { text: 'n', sources: [{ sourceId: 'a' }] } }],
      hand: { title: 'H', text: { text: 't', sources: [{ sourceId: 'a' }] }, note: { text: 'n', sources: [{ sourceId: 'b' }, { sourceId: 'a' }] } },
      compareRows: [{ aspect: 'A', hand: 'h' }],
    })
    expect(c.tools[0]).toMatchObject({ n: 1, name: 'Khung', cite: ['a'] })
    // Mỗi câu của thẻ giữ nguồn riêng (I1).
    expect(c.hand.text.cite).toEqual(['a'])
    expect(c.hand.note.cite).toEqual(['b', 'a'])
    expect(c.rows[0]).toEqual({ aspect: 'A', hand: 'h', machine: '', mobile: ['Thủ công: h · Máy: '], mobileAuto: true, cite: [] })
    expect(c.sourceOrder).toEqual(['a', 'b'])
  })
  it('rows: dòng điện thoại do biên tập viên viết thì mobileAuto false', () => {
    const c = craftFactsFrom({ compareRows: [{ aspect: 'A', hand: 'h', machine: 'm', mobile: 'Thủ công: h' }] })
    expect(c.rows[0]).toMatchObject({ mobile: ['Thủ công: h'], mobileAuto: false })
  })
})

describe('sourceOrder: nguồn không có trong danh sách nối theo thứ tự trên trang', () => {
  const s = (id: string) => [{ sourceId: id }]
  it('Làng Hới: bảng thông tin → đoạn tổ nghề → hộp chưa thống nhất → vị trí → di sản', () => {
    const v = villageFactsFrom({
      pageSources: s('listed'),
      heritage: { sentences: [{ text: 'h', sources: s('heritage') }] },
      location: { text: 'l', sources: s('location') },
      founder: {
        conflict: [{ text: 'c', sources: s('conflict') }],
        paragraphs: [{ sentences: [{ text: 'p', sources: s('para') }] }],
      },
      facts: [{ term: 'T', detail: 'D', sources: s('fact') }],
    })
    expect(v.sourceOrder).toEqual(['listed', 'fact', 'para', 'conflict', 'location', 'heritage'])
  })
  it('Nghề dệt: dụng cụ → mô tả thủ công → ghi chú thủ công → thẻ máy → hàng so sánh', () => {
    const c = craftFactsFrom({
      pageSources: s('listed'),
      compareRows: [{ aspect: 'A', hand: 'h', sources: s('row') }],
      machine: { text: { text: 'mt', sources: s('machine-text') }, note: { text: 'mn', sources: s('machine-note') } },
      hand: { text: { text: 't', sources: s('hand-text') }, note: { text: 'n', sources: s('hand-note') } },
      tools: [{ name: 'K', note: { text: 'n', sources: s('tool') } }],
    })
    expect(c.sourceOrder).toEqual(['listed', 'tool', 'hand-text', 'hand-note', 'machine-text', 'machine-note', 'row'])
  })
})

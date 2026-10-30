import { describe, expect, it } from 'vitest'
import { villageCopy } from '@/lib/content/copy/village'
import type { VillageFacts } from '@/lib/content/pageFacts'
import { villageFactsFrom } from '@/lib/content/pageFacts'
import { mergeVillageCopy, villageFactRows } from '@/lib/content/villageMerge'

type Fact = VillageFacts['facts'][number]
const fact = (term: string, cite: string[], over: Partial<Fact> = {}): Fact => ({
  term, detail: { desktop: `${term} d`, mobile: `${term} m` }, note: { desktop: null, mobile: null }, editorNote: null, cite, ...over,
})

describe('villageFactRows', () => {
  it('public: dòng không có nguồn vẫn giữ (I4)', () => {
    const out = villageFactRows([fact('KHÔNG NGUỒN', [])], 'public', new Set())
    expect(out).toEqual([{ term: 'KHÔNG NGUỒN', detail: { desktop: 'KHÔNG NGUỒN d', mobile: 'KHÔNG NGUỒN m' }, note: { desktop: null, mobile: null }, cite: [] }])
  })
  it('public: dòng có nguồn mà mọi nguồn bị ẩn thì bỏ; còn một nguồn thì giữ với nguồn đó', () => {
    const out = villageFactRows([fact('A', ['x']), fact('B', ['x', 'y'])], 'public', new Set(['y']))
    expect(out.map((r) => [r.term, r.cite])).toEqual([['B', ['y']]])
  })
  it('preview: giữ dòng hết nguồn, nối ghi chú biên tập sau "·"', () => {
    const out = villageFactRows([fact('A', ['x'], { note: { desktop: 'N', mobile: 'n' }, editorNote: 'E' })], 'preview', new Set())
    expect(out).toEqual([{ term: 'A', detail: { desktop: 'A d', mobile: 'A m' }, note: { desktop: 'N · E', mobile: 'n · E' }, cite: [] }])
  })
  it('public: ghi chú biên tập không bao giờ hiện', () => {
    const [r] = villageFactRows([fact('A', [], { note: { desktop: 'N', mobile: 'n' }, editorNote: 'E' })], 'public', new Set())
    expect(r.note).toEqual({ desktop: 'N', mobile: 'n' })
  })
  it('Mục qua luật hiển thị (I3): public bỏ dòng có Mục trống/chờ xác minh; preview hiện [cần xác minh]', () => {
    const rows = [fact('[cần xác minh]', []), fact('', [])]
    expect(villageFactRows(rows, 'public', new Set())).toEqual([])
    expect(villageFactRows(rows, 'preview', new Set()).map((r) => r.term)).toEqual(['[cần xác minh]', '[cần xác minh]'])
  })
})

describe('mergeVillageCopy', () => {
  it('lấp dữ kiện vào khung copy, giữ phần chữ cố định', () => {
    const f = villageFactsFrom({
      founder: {
        paragraphs: [{ sentences: [{ text: 'p', sources: [{ sourceId: 'a' }] }] }],
        conflict: [{ text: 'c' }], conflictEditorNote: 'ce', noPortrait: 'np',
      },
      location: { text: 'l', sources: [{ sourceId: 'b' }], editorNote: 'le' },
      heritage: { sentences: [{ text: 'h' }], editorNote: 'he' },
    })
    const m = mergeVillageCopy(villageCopy, f)
    expect(m.founder.paragraphs).toEqual([{ parts: [{ text: { desktop: 'p', mobile: 'p' }, cite: ['a'] }] }])
    expect(m.founder.conflict.parts).toEqual([{ text: { desktop: 'c', mobile: 'c' }, cite: [] }])
    expect(m.founder.conflict.preview).toEqual({ closing: { desktop: 'ce', mobile: null } })
    expect(m.founder.noPortrait).toEqual({ desktop: 'np', mobile: null })
    expect(m.location.body).toEqual({ text: 'l', cite: ['b'] })
    expect(m.location.preview.note).toEqual({ desktop: 'le', mobile: null })
    expect(m.heritage.paragraphs).toEqual([{ text: { desktop: 'h', mobile: 'h' }, cite: [] }])
    expect(m.heritage.preview).toEqual({ note: { desktop: 'he', mobile: null } })
    // Chữ cố định của khung vẫn từ villageCopy.
    expect(m.founder.conflict).toMatchObject({ ...villageCopy.founder.conflict, parts: m.founder.conflict.parts, preview: m.founder.conflict.preview })
    expect(m.timeline).toBe(villageCopy.timeline)
  })
})

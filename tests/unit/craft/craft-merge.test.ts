import { describe, expect, it } from 'vitest'
import { craftCompareRows, craftToolCards, craftWayCard } from '@/lib/content/craftMerge'
import type { CraftFacts } from '@/lib/content/pageFacts'

type Row = CraftFacts['rows'][number]
const row = (aspect: string, hand: string, cite: string[]): Row => ({ aspect, hand, machine: 'M', mobile: [`${aspect} mobile`], mobileAuto: false, cite })
const rows = [row('A', 'a', []), row('B', 'b', ['s1']), row('C', 'c', ['s1', 's2'])]
const auto = (hand: string, machine: string, cite: string[] = []): Row => ({
  aspect: 'Thời gian một tấm', hand, machine, mobile: [`Thủ công: ${hand} · Máy: ${machine}`], mobileAuto: true, cite,
})

describe('craftCompareRows', () => {
  it('public: hàng có nguồn mà mọi nguồn bị ẩn thì bị bỏ; hàng không nguồn và hàng còn một nguồn giữ nguyên', () => {
    const out = craftCompareRows(rows, 'public', new Set(['s2']))
    expect(out.map((r) => [r.aspect, r.cite])).toEqual([['A', []], ['C', ['s2']]])
  })
  it('preview: giữ hàng, cite vẫn lọc theo nguồn nhìn thấy', () => {
    const out = craftCompareRows(rows, 'preview', new Set())
    expect(out.map((r) => [r.aspect, r.cite])).toEqual([['A', []], ['B', []], ['C', []]])
  })

  describe('dòng điện thoại tự ghép (I2)', () => {
    it('public: ô máy chờ xác minh thì dòng chỉ còn phần thủ công', () => {
      const [r] = craftCompareRows([auto('2 lá/ngày', '[cần xác minh]', ['s1'])], 'public', new Set(['s1']))
      expect(r.hand).toBe('2 lá/ngày')
      expect(r.machine).toBeNull()
      expect(r.mobile).toEqual(['Thủ công: 2 lá/ngày'])
      expect(r.muted.mobile).toEqual([false])
      expect(r.cite).toEqual(['s1'])
    })
    it('public: ô thủ công trống thì dòng chỉ còn phần máy', () => {
      const [r] = craftCompareRows([auto('', '25 lá/ngày')], 'public', new Set())
      expect(r.mobile).toEqual(['Máy: 25 lá/ngày'])
    })
    it('public: một ô trống không bao giờ để lại "· Máy: " cụt', () => {
      const [r] = craftCompareRows([auto('h', '')], 'public', new Set())
      expect(r.mobile).toEqual(['Thủ công: h'])
    })
    it('public: cả hai ô có chữ thì dòng như cũ', () => {
      const [r] = craftCompareRows([auto('a', 'b')], 'public', new Set())
      expect(r.mobile).toEqual(['Thủ công: a · Máy: b'])
      expect(r.muted.mobile).toEqual([false])
    })
    it('preview: giữ nguyên dòng ghép (kể cả dấu chờ xác minh), đánh dấu mờ', () => {
      const [r] = craftCompareRows([auto('2 lá/ngày', '[cần xác minh]')], 'preview', new Set())
      expect(r.mobile).toEqual(['Thủ công: 2 lá/ngày · Máy: [cần xác minh]'])
      expect(r.muted.mobile).toEqual([true])
    })
    it('dòng do biên tập viên viết: lọc như cũ (dòng có dấu bị bỏ ở public)', () => {
      const r0: Row = { ...auto('2 lá/ngày', '[cần xác minh]'), mobile: ['Thủ công: 2 lá/ngày · Máy: [cần xác minh]'], mobileAuto: false }
      const [r] = craftCompareRows([r0], 'public', new Set())
      expect(r.mobile).toEqual([])
    })
  })

  describe('Khía cạnh qua luật hiển thị (I3)', () => {
    it('public: khía cạnh trống hoặc chờ xác minh thì bỏ hàng', () => {
      const out = craftCompareRows([{ ...row('A', 'a', []), aspect: '[cần xác minh]' }, { ...row('B', 'b', []), aspect: '' }], 'public', new Set())
      expect(out).toEqual([])
    })
    it('preview: hiện khía cạnh (trống thành [cần xác minh])', () => {
      const out = craftCompareRows([{ ...row('A', 'a', []), aspect: '' }], 'preview', new Set())
      expect(out.map((r) => r.aspect)).toEqual(['[cần xác minh]'])
    })
  })
})

describe('craftToolCards (I3)', () => {
  const tool = (n: number, name: string, cite: string[] = [], image: unknown = null): CraftFacts['tools'][number] =>
    ({ n, name, note: { desktop: 'ghi chú', mobile: null }, cite, image })
  const asset = (rights: string) => ({ id: 7, url: '/a.webp', alt: 'Khung', rights, subjectConsent: 'not_applicable' })
  it('public: tên dụng cụ chờ xác minh hoặc trống thì bỏ dụng cụ, giữ số n theo ô ảnh', () => {
    const out = craftToolCards([tool(1, '[cần xác minh]'), tool(2, 'Khuôn'), tool(3, '')], 'public', new Set())
    expect(out.map((t) => [t.n, t.name])).toEqual([[2, 'Khuôn']])
  })
  it('preview: giữ dụng cụ, tên trống thành [cần xác minh]', () => {
    const out = craftToolCards([tool(1, '')], 'preview', new Set())
    expect(out.map((t) => t.name)).toEqual(['[cần xác minh]'])
  })
  it('cite lọc theo nguồn nhìn thấy; ghi chú hết nguồn thì ẩn ở public', () => {
    const [t] = craftToolCards([tool(1, 'Khung', ['a'])], 'public', new Set())
    expect(t.cite).toEqual([])
    expect(t.note).toEqual({ desktop: null, mobile: null })
  })
  it('ảnh lấy từ chính dòng dụng cụ, qua luật hiển thị ảnh', () => {
    const [pub] = craftToolCards([tool(1, 'Khung', [], asset('permitted'))], 'public', new Set())
    expect(pub.image?.url).toBe('/a.webp')
    expect(craftToolCards([tool(1, 'Khung', [], asset('unknown'))], 'public', new Set())[0].image).toBeNull()
    expect(craftToolCards([tool(1, 'Khung', [], asset('unknown'))], 'preview', new Set())[0].image?.flags).toContain('rights-not-permitted')
    // Chưa nạp quan hệ (chỉ có id) hoặc trống thì không có ảnh.
    expect(craftToolCards([tool(1, 'Khung', [], 7), tool(2, 'Go')], 'preview', new Set()).map((t) => t.image)).toEqual([null, null])
  })
})

describe('craftWayCard: mỗi câu của thẻ có nguồn riêng (I1)', () => {
  const cited = (text: string, cite: string[] = []) => ({ text: { desktop: text, mobile: text }, cite })
  it('chỉ ghi chú có nguồn: noteCite có, textCite rỗng', () => {
    const c = craftWayCard({ title: 'T', text: cited('mô tả'), note: cited('ghi chú', ['b']) }, 'public', new Set(['b']), null)
    expect(c.textCite).toEqual([])
    expect(c.noteCite).toEqual(['b'])
    expect(c.text.desktop).toBe('mô tả')
  })
  it('mô tả chờ xác minh bị ẩn, ghi chú có nguồn vẫn hiện kèm nguồn', () => {
    const c = craftWayCard({ title: 'T', text: cited('[cần xác minh]'), note: cited('2 lá/ngày', ['b']) }, 'public', new Set(['b']), null)
    expect(c.text).toEqual({ desktop: null, mobile: null })
    expect(c.note.desktop).toBe('2 lá/ngày')
    expect(c.noteCite).toEqual(['b'])
  })
  it('mô tả trích nguồn A bị ẩn, ghi chú trích B: public ẩn mô tả, ghi chú hiện [B]', () => {
    const c = craftWayCard({ title: 'T', text: cited('mô tả', ['a']), note: cited('ghi chú', ['b']) }, 'public', new Set(['b']), null)
    expect(c.text).toEqual({ desktop: null, mobile: null })
    expect(c.textCite).toEqual([])
    expect(c.note.desktop).toBe('ghi chú')
    expect(c.noteCite).toEqual(['b'])
  })
  it('preview: giữ mô tả dù nguồn bị ẩn', () => {
    const c = craftWayCard({ title: '', text: cited('mô tả', ['a']), note: cited('ghi chú') }, 'preview', new Set(), null)
    expect(c.text.desktop).toBe('mô tả')
    expect(c.title).toBe('[cần xác minh]')
  })
})

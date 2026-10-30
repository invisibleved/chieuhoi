import { describe, expect, it } from 'vitest'

import {
  craftStepDocs,
  productDocs,
  readSeedJson,
  stripFigureParagraphs,
  timelineDocs,
} from '@/seed/content'

const ids = Object.fromEntries(
  readSeedJson<{ id: string }[]>('sources.json').map((s, i) => [s.id, i + 100]),
)

describe('timelineDocs', () => {
  const docs = timelineDocs(ids, 'draft')
  it('đủ 7 mốc, key là order', () => {
    expect(docs).toHaveLength(7)
    expect(docs.map((d) => d.key)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })
  it('giữ nội dung và mức tin cậy', () => {
    expect(docs[2].data.title).toBe('Khung dệt về làng')
    expect(docs[2].data.confidence).toBe('oral')
  })
  it('đổi nguồn sang id', () => {
    const json = readSeedJson<{ sources: string[] }[]>('timeline.json')
    expect(docs[0].data.sources).toEqual(json[0].sources.map((s) => ids[s]))
  })
  it('workflow theo tham số', () => {
    expect(docs.every((d) => d.data.workflow === 'draft')).toBe(true)
  })
})

describe('craftStepDocs', () => {
  it('asset null thì không có image', () => {
    const docs = craftStepDocs(null, 'draft')
    expect(docs).toHaveLength(7)
    expect(docs.some((d) => 'image' in d.data)).toBe(false)
    expect(docs[0].data.shortTitle).toBe('Nguyên liệu')
    const json = readSeedJson<{ shotNeeded?: string; focus: [number, number] }[]>('craftSteps.json')
    expect(docs[0].data.shotNeeded).toBe(json[0].shotNeeded)
    expect(docs[0].data.focusX).toBe(json[0].focus[0])
  })
  it('có asset thì gắn image', () => {
    const json = readSeedJson<{ image: string | null }[]>('craftSteps.json')
    const docs = craftStepDocs(() => 9, 'draft')
    json.forEach((s, i) => {
      if (s.image) expect(docs[i].data.image).toBe(9)
    })
  })
})

describe('productDocs', () => {
  const docs = productDocs(ids, null, 'draft')
  it('đủ 7 sản phẩm, không có images', () => {
    expect(docs).toHaveLength(7)
    expect(docs.some((d) => 'images' in d.data)).toBe(false)
  })
  it('annotations đổi nguồn sang id', () => {
    const p = docs.find((d) => d.key === 'chieu-cap-dieu')!
    const ann = p.data.annotations as { source: number | null }[]
    expect(ann).toHaveLength(3)
    const json = readSeedJson<{ slug: string; annotations: { source: string | null }[] }[]>('products.json')
    const raw = json.find((x) => x.slug === 'chieu-cap-dieu')!.annotations
    raw.forEach((a, i) => expect(ann[i].source).toBe(a.source ? ids[a.source] : null))
  })
})

describe('stripFigureParagraphs', () => {
  it('bỏ dòng figure, giữ cite và đoạn khác', () => {
    const md = 'Đoạn một [[cite:a]].\n\n[[figure:nkc14.webp|Đôi tay…]]\n\nĐoạn hai.\n'
    const out = stripFigureParagraphs(md)
    expect(out).not.toContain('[[figure:')
    expect(out).toContain('[[cite:a]]')
    expect(out).toContain('Đoạn một')
    expect(out).toContain('Đoạn hai.')
  })
})

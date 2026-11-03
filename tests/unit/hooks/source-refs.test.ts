import { describe, expect, it } from 'vitest'

import { citedSourceIds } from '@/hooks/sourceRefs'

const ids = (doc: unknown) => [...citedSourceIds(doc)].sort((a, b) => a - b)

describe('citedSourceIds', () => {
  it('đọc sources là số hoặc object có id', () => {
    expect(ids({ sources: [3, { id: 5 }] })).toEqual([3, 5])
  })
  it('đọc annotations[].source', () => {
    expect(ids({ annotations: [{ source: 7 }] })).toEqual([7])
  })
  it('đọc quoteSource', () => {
    expect(ids({ quoteSource: { id: 9 } })).toEqual([9])
  })
  it('đọc pageSources', () => {
    expect(ids({ pageSources: [2] })).toEqual([2])
  })
  it('đọc khối cite trong Lexical', () => {
    const doc = {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'inlineBlock', fields: { blockType: 'cite', source: 4 } }],
          },
        ],
      },
    }
    expect(ids(doc)).toEqual([4])
  })
  it('bỏ qua trường chữ', () => {
    expect(ids({ source: 'Ảnh của ông A' })).toEqual([])
  })
  it('đọc lồng sâu', () => {
    const doc = { 'lang-hoi': { founder: { paragraphs: [{ sentences: [{ sources: [11] }] }] } } }
    expect(ids(doc)).toEqual([11])
  })
})

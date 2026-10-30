import { describe, expect, it } from 'vitest'
import { craftCompareRows } from '@/lib/content/craftMerge'

const row = (aspect: string, hand: string, cite: string[]) => ({ aspect, hand, machine: 'M', mobile: [`${aspect} mobile`], cite })
const rows = [row('A', 'a', []), row('B', 'b', ['s1']), row('C', 'c', ['s1', 's2'])]

describe('craftCompareRows', () => {
  it('public: hàng có nguồn mà mọi nguồn bị ẩn thì bị bỏ; hàng không nguồn và hàng còn một nguồn giữ nguyên', () => {
    const out = craftCompareRows(rows, 'public', new Set(['s2']))
    expect(out.map((r) => [r.aspect, r.cite])).toEqual([['A', []], ['C', ['s2']]])
  })
  it('preview: giữ hàng, cite vẫn lọc theo nguồn nhìn thấy', () => {
    const out = craftCompareRows(rows, 'preview', new Set())
    expect(out.map((r) => [r.aspect, r.cite])).toEqual([['A', []], ['B', []], ['C', []]])
  })
})

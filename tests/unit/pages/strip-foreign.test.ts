import { describe, expect, it } from 'vitest'

import { ALL_PAGE_ONLY_FIELDS, PAGE_ONLY_FIELDS } from '@/collections/pages/fields'
import { stripForeignFields } from '@/collections/pages/stripForeign'

describe('stripForeignFields', () => {
  it('home: xoá dữ kiện Làng Hới, giữ trường của home và trường chung', () => {
    const out = stripForeignFields('home', { title: 'x', facts: [{ term: 'a' }], heroTitle: 'h' })
    expect(out.facts).toEqual([])
    expect(out.heroTitle).toBe('h')
    expect(out.title).toBe('x')
  })

  it('lang-hoi: xoá dụng cụ, giữ dữ kiện', () => {
    const facts = [{}]
    const out = stripForeignFields('lang-hoi', { tools: [{}], facts })
    expect(out.tools).toEqual([])
    expect(out.facts).toBe(facts)
  })

  it('upload lạ thành null; nhóm lạ giữ dạng đối tượng, giá trị con bị xoá; không sửa đối tượng gốc', () => {
    const data = {
      founder: { noPortrait: 'x', paragraphs: [{}], conflict: undefined },
      hand: { title: 't', text: { text: 'a', sources: [1] } },
      heroImage: 3,
    }
    const out = stripForeignFields('ket-noi', data)
    expect(out.founder).toStrictEqual({ noPortrait: null, paragraphs: [], conflict: undefined })
    expect(out.hand).toEqual({ title: null, text: { text: null, sources: [] } })
    expect(out.location).toEqual({})
    expect(out.heroImage).toBeNull()
    expect(data.heroImage).toBe(3)
  })

  it('pageSources thuộc cả lang-hoi lẫn nghe-det-chieu', () => {
    expect(PAGE_ONLY_FIELDS['lang-hoi']).toContain('pageSources')
    expect(PAGE_ONLY_FIELDS['nghe-det-chieu']).toContain('pageSources')
    expect(stripForeignFields('nghe-det-chieu', { pageSources: [1] }).pageSources).toEqual([1])
    expect(stripForeignFields('san-pham', { pageSources: [1] }).pageSources).toEqual([])
  })

  it('ALL_PAGE_ONLY_FIELDS là hợp, không trùng', () => {
    expect(new Set(ALL_PAGE_ONLY_FIELDS).size).toBe(ALL_PAGE_ONLY_FIELDS.length)
    for (const f of ['heroTitle', 'media', 'facts', 'tools', 'compareRows', 'pageSources']) {
      expect(ALL_PAGE_ONLY_FIELDS).toContain(f)
    }
  })
})

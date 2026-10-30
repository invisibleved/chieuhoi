import { describe, expect, it } from 'vitest'

import { PageIntros } from '@/globals/PageIntros'

const group = (k: string) =>
  PageIntros.fields.find((f) => 'name' in f && f.name === k) as {
    fields: { name?: string; label?: string; maxRows?: number }[]
  }
const names = (k: string) => group(k).fields.map((f) => f.name)

describe('page-intros: dữ kiện trang', () => {
  it('Làng Hới có các nhóm dữ kiện', () => {
    expect(names('lang-hoi')).toEqual(
      expect.arrayContaining(['facts', 'founder', 'location', 'heritage', 'pageSources']),
    )
  })
  it('Nghề dệt có dụng cụ tối đa 3 dòng và bảng so sánh', () => {
    expect(names('nghe-det-chieu')).toEqual(
      expect.arrayContaining(['tools', 'hand', 'machine', 'compareRows', 'pageSources']),
    )
    expect(group('nghe-det-chieu').fields.find((f) => f.name === 'tools')?.maxRows).toBe(3)
  })
  it('các trang khác không có nhóm dữ kiện', () => {
    expect(names('home')).not.toContain('pageSources')
  })
  it('nhãn admin không có từ kỹ thuật', () => {
    const labels: string[] = []
    const walk = (fs: unknown[]) =>
      fs.forEach((f) => {
        const x = f as { label?: unknown; fields?: unknown[] }
        if (typeof x.label === 'string') labels.push(x.label)
        if (x.fields) walk(x.fields)
      })
    walk([...group('lang-hoi').fields, ...group('nghe-det-chieu').fields])
    for (const l of labels) expect(l).not.toMatch(/sourceId|desktop|mobile|JSON/i)
  })
})

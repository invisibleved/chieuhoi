import { describe, expect, it } from 'vitest'

import { ROUTE_PATHS } from '@/collections/pages/routeKeys'
import { craftFactsFields, villageFactsFields } from '@/globals/pageFacts'
import { PAGE_MEDIA_SLOTS, PAGES_MEDIA_SLOTS } from '@/globals/pageMedia'
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

describe('khoá trang và tuỳ chọn trường dữ kiện', () => {
  type F = { name?: string; dbName?: string; type?: string; relationTo?: string; fields?: F[] }
  const find = (fs: F[], name: string): F | undefined => fs.find((f) => f.name === name)
  const founder = (fs: F[]) => find(find(fs as F[], 'founder')!.fields!, 'paragraphs')!
  it('dbName mặc định và có tiền tố', () => {
    const v = villageFactsFields() as F[]
    expect(founder(v).dbName).toBe('lh_founder_paras')
    expect(find(founder(v).fields!, 'sentences')?.dbName).toBe('lh_founder_sents')
    expect(founder(villageFactsFields({ dbPrefix: 'pg_' }) as F[]).dbName).toBe('pg_lh_founder_paras')
  })
  it('toolImage thêm trường ảnh vào dòng dụng cụ', () => {
    const img = (fs: F[]) => find(find(fs, 'tools')!.fields!, 'image')
    expect(img(craftFactsFields({ toolImage: true }) as F[])).toMatchObject({ type: 'upload', relationTo: 'archive-assets' })
    expect(img(craftFactsFields() as F[])).toBeUndefined()
  })
  it('ô ảnh và đường dẫn', () => {
    expect(PAGES_MEDIA_SLOTS['nghe-det-chieu']).not.toContain('tool-1')
    expect(PAGE_MEDIA_SLOTS['nghe-det-chieu']).toContain('tool-1')
    expect(ROUTE_PATHS['lang-hoi']).toBe('/lang-hoi')
  })
})

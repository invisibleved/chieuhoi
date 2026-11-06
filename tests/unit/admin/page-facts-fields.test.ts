import { describe, expect, it } from 'vitest'

import { Pages } from '@/collections/Pages'
import { ROUTE_PATHS } from '@/lib/routeKeys'
import { isPageField } from '@/collections/pages/fields'
import { craftFactsFields, villageFactsFields } from '@/globals/pageFacts'
import { PAGES_MEDIA_SLOTS } from '@/globals/pageMedia'

type F = { name?: string; dbName?: string; type?: string; relationTo?: string; label?: unknown; maxRows?: number; fields?: F[] }
const field = (name: string) => (Pages.fields as F[]).find((f) => f.name === name)

describe('pages: dữ kiện trang', () => {
  it('Làng Hới có các nhóm dữ kiện', () => {
    for (const k of ['facts', 'founder', 'location', 'heritage', 'pageSources']) {
      expect(field(k), k).toBeTruthy()
      expect(isPageField('lang-hoi', k), k).toBe(true)
    }
  })
  it('Nghề dệt có dụng cụ tối đa 3 dòng và bảng so sánh', () => {
    for (const k of ['tools', 'hand', 'machine', 'compareRows', 'pageSources']) {
      expect(isPageField('nghe-det-chieu', k), k).toBe(true)
    }
    expect(field('tools')?.maxRows).toBe(3)
  })
  it('các trang khác không có nhóm dữ kiện', () => {
    expect(isPageField('home', 'pageSources')).toBe(false)
  })
  it('nhãn admin không có từ kỹ thuật', () => {
    const labels: string[] = []
    const walk = (fs: F[]) =>
      fs.forEach((f) => {
        if (typeof f.label === 'string') labels.push(f.label)
        if (f.fields) walk(f.fields)
      })
    walk([...villageFactsFields(), ...craftFactsFields()] as F[])
    for (const l of labels) expect(l).not.toMatch(/sourceId|desktop|mobile|JSON/i)
  })
})

describe('khoá trang và trường dữ kiện', () => {
  const find = (fs: F[], name: string): F | undefined => fs.find((f) => f.name === name)
  const founder = (fs: F[]) => find(find(fs, 'founder')!.fields!, 'paragraphs')!
  it('dbName có tiền tố pg_', () => {
    const v = villageFactsFields() as F[]
    expect(founder(v).dbName).toBe('pg_lh_founder_paras')
    expect(find(founder(v).fields!, 'sentences')?.dbName).toBe('pg_lh_founder_sents')
    expect(find(craftFactsFields() as F[], 'compareRows')?.dbName).toBe('pg_ndc_compare')
  })
  it('dòng dụng cụ có trường ảnh', () => {
    const img = find(find(craftFactsFields() as F[], 'tools')!.fields!, 'image')
    expect(img).toMatchObject({ type: 'upload', relationTo: 'archive-assets' })
  })
  it('ô ảnh và đường dẫn', () => {
    expect(PAGES_MEDIA_SLOTS['nghe-det-chieu']).not.toContain('tool-1')
    expect(ROUTE_PATHS['lang-hoi']).toBe('/lang-hoi')
  })
})

// @vitest-environment node
import type { CollectionConfig, Field, GlobalConfig } from 'payload'
import { describe, expect, it } from 'vitest'

import { ADMIN_GROUPS, CONTROL_FIELD_NOTE, controlFieldAdmin, reviewerOnlyField } from '@/access/roles'
import { revalidateAfterChange, revalidateAfterDelete, revalidateGlobalAfterChange } from '@/hooks/revalidate'
import { ArchiveAssets } from '@/collections/ArchiveAssets'
import { CraftSteps } from '@/collections/CraftSteps'
import { Makers } from '@/collections/Makers'
import { People } from '@/collections/People'
import { Products } from '@/collections/Products'
import { Sources } from '@/collections/Sources'
import { Stories } from '@/collections/Stories'
import { TimelineEvents } from '@/collections/TimelineEvents'
import { Users } from '@/collections/Users'
import { PageIntros } from '@/globals/PageIntros'
import { SiteSettings } from '@/globals/SiteSettings'

export const collections: CollectionConfig[] = [
  Users, Sources, TimelineEvents, ArchiveAssets, CraftSteps, Products, Stories, People, Makers,
]
export const globals: GlobalConfig[] = [SiteSettings, PageIntros]

/** Duyệt đệ quy mọi trường, kể cả trong group, array, row, collapsible, tabs và blocks. */
function walk(fields: Field[], visit: (f: Field, path: string) => void, prefix = ''): void {
  for (const f of fields) {
    const name = 'name' in f && f.name ? f.name : ''
    const path = name ? `${prefix}${name}` : prefix
    visit(f, path)
    if ('fields' in f && Array.isArray(f.fields)) walk(f.fields, visit, name ? `${path}.` : prefix)
    if (f.type === 'tabs') for (const t of f.tabs) walk(t.fields, visit, 'name' in t && t.name ? `${prefix}${t.name}.` : prefix)
    if (f.type === 'blocks') for (const b of f.blocks) walk(b.fields, visit, `${path}.${b.slug}.`)
  }
}

const GROUPS = {
  stories: 'Nội dung',
  people: 'Nội dung',
  'craft-steps': 'Nội dung',
  'timeline-events': 'Nội dung',
  products: 'Nội dung',
  makers: 'Nội dung',
  'archive-assets': 'Tư liệu',
  sources: 'Tư liệu',
  'site-settings': 'Trang',
  'page-intros': 'Trang',
  users: 'Quản trị',
}

describe('cấu hình admin', () => {
  it('mọi collection có labels singular/plural tiếng Việt', () => {
    for (const c of collections) {
      const l = c.labels as { singular: string; plural: string }
      expect(l?.singular, c.slug).toBeTruthy()
      expect(l?.plural, c.slug).toBeTruthy()
      expect(l.singular).not.toBe(c.slug)
      expect(l.plural).not.toBe(c.slug)
    }
    expect(Users.labels).toEqual({ singular: 'Người dùng', plural: 'Người dùng' })
  })

  it('mọi global có label', () => {
    for (const g of globals) {
      expect(typeof g.label, g.slug).toBe('string')
      expect(g.label).not.toBe(g.slug)
    }
    expect(PageIntros.label).toBe('Phần mở đầu trang')
  })

  it('mọi collection và global có admin.group thuộc ADMIN_GROUPS', () => {
    const all = [...collections, ...globals]
    const map = Object.fromEntries(all.map((c) => [c.slug, c.admin?.group]))
    expect(map).toEqual(GROUPS)
    for (const g of Object.values(map)) expect(Object.values(ADMIN_GROUPS)).toContain(g)
  })

  it('mọi trường có name đều có label', () => {
    const missing: string[] = []
    for (const c of [...collections, ...globals]) {
      walk(c.fields, (f, path) => {
        if (!('name' in f) || !f.name || f.name.startsWith('_')) return
        if (!('label' in f) || !f.label) missing.push(`${c.slug}.${path}`)
        if (f.type === 'select' || f.type === 'radio') {
          for (const o of f.options) {
            if (typeof o !== 'object' || !o.label) missing.push(`${c.slug}.${path} option ${JSON.stringify(o)}`)
          }
        }
      })
    }
    expect(missing).toEqual([])
  })

  it('trường chỉ người duyệt sửa có mô tả kiểm soát', () => {
    const found: string[] = []
    const bad: string[] = []
    for (const c of [...collections, ...globals]) {
      walk(c.fields, (f, path) => {
        if (!('access' in f) || f.access?.update !== reviewerOnlyField) return
        found.push(`${c.slug}.${path}`)
        const d = (f as { admin?: { description?: unknown } }).admin?.description
        if (!String(d).endsWith(CONTROL_FIELD_NOTE)) bad.push(`${c.slug}.${path}`)
      })
    }
    expect(bad).toEqual([])
    expect(found).toEqual(expect.arrayContaining([
      'people.consent.name', 'people.consent.photo', 'people.consent.quote', 'people.reviewedBySubject',
      'archive-assets.rights', 'archive-assets.subjectConsent', 'timeline-events.confidence',
      'products.typeConfirmed', 'craft-steps.verifiedBy', 'makers.verified', 'makers.publicConsent', 'users.role',
    ]))
    expect(found.length).toBeGreaterThanOrEqual(12)
  })

  it('controlFieldAdmin nối mô tả sẵn có', () => {
    expect(controlFieldAdmin()).toEqual({ description: CONTROL_FIELD_NOTE })
    expect(controlFieldAdmin('A.')).toEqual({ description: `A. ${CONTROL_FIELD_NOTE}` })
  })
})

describe('xem trước', () => {
  const previewable = ['stories', 'people', 'products', 'craft-steps', 'timeline-events', 'makers', 'archive-assets', 'site-settings', 'page-intros']

  it('admin.preview là hàm ở collection nội dung, archive-assets và 2 global', () => {
    const all = [...collections, ...globals]
    for (const slug of previewable) {
      const c = all.find((x) => x.slug === slug)
      expect(typeof c?.admin?.preview, slug).toBe('function')
    }
  })

  it('sources và users không có admin.preview', () => {
    expect(Sources.admin?.preview).toBeUndefined()
    expect(Users.admin?.preview).toBeUndefined()
  })

  it('Stories trả URL qua /preview', async () => {
    const preview = Stories.admin?.preview as (d: Record<string, unknown>, o: never) => unknown
    expect(await preview({ slug: 'a', workflow: 'draft' }, {} as never)).toBe('/preview?path=%2Fcau-chuyen%2Fa')
  })
})

describe('revalidate', () => {
  const withHooks = collections.filter((c) => c.slug !== 'users')
  it('8 collection (7 nội dung + sources, archive-assets) có hook revalidate khi lưu và xoá', () => {
    expect(withHooks).toHaveLength(8)
    for (const c of withHooks) {
      expect(c.hooks?.afterChange, c.slug).toContain(revalidateAfterChange)
      expect(c.hooks?.afterDelete, c.slug).toContain(revalidateAfterDelete)
    }
  })
  it('2 global có revalidateGlobalAfterChange', () => {
    for (const g of globals) expect(g.hooks?.afterChange, g.slug).toContain(revalidateGlobalAfterChange)
  })
  it('users không có', () => {
    expect(Users.hooks?.afterChange ?? []).not.toContain(revalidateAfterChange)
    expect(Users.hooks?.afterDelete ?? []).not.toContain(revalidateAfterDelete)
  })
})

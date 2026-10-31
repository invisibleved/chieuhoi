// @vitest-environment node
import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { ROUTE_KEYS } from '@/globals/PageIntros'
import { importContent } from '@/seed/importContent'
import { pageIntros, siteSettings } from '@/seed/data/site'
import { getTestPayload, makeUser, resetDb } from './helpers'

type Rec = Record<string, unknown>
type Coll = 'timeline-events' | 'craft-steps' | 'products' | 'stories'
const COLLECTIONS: Coll[] = ['timeline-events', 'craft-steps', 'products', 'stories']

let payload: Payload

const reviewer = async () => ({ ...(await makeUser(payload, 'reviewer')), collection: 'users' as const })

const EMPTY_VILLAGE = {
  facts: [],
  founder: { paragraphs: [], conflict: [], conflictEditorNote: null, noPortrait: null },
  location: { text: null, sources: [], editorNote: null },
  heritage: { sentences: [], editorNote: null },
  pageSources: [],
}
const EMPTY_CRAFT = {
  tools: [],
  hand: { title: null, text: { text: null, mobileText: null, sources: [] }, note: { text: null, mobileText: null, sources: [] } },
  machine: { title: null, text: { text: null, mobileText: null, sources: [] }, note: { text: null, mobileText: null, sources: [] } },
  compareRows: [],
  pageSources: [],
}

/** Globals không bị resetDb xoá: đăng bản có mọi trường lệnh nhập điền đều trống. */
async function publishEmptyGlobals() {
  const user = await reviewer()
  const intros: Rec = {}
  for (const key of ROUTE_KEYS) {
    intros[key] = {
      eyebrow: null, title: null, lead: null,
      ...(key === 'home' ? { heroTitle: null } : {}),
      ...(key === 'lang-hoi' ? EMPTY_VILLAGE : {}),
      ...(key === 'nghe-det-chieu' ? EMPTY_CRAFT : {}),
    }
  }
  await payload.updateGlobal({
    slug: 'page-intros', data: { ...intros, _status: 'published' }, overrideAccess: true, user,
  } as never)
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      tagline: null, description: null, address: null, addressNote: null, email: null, phone: null,
      visitInfo: null, copyright: null, _status: 'published',
    },
    overrideAccess: true,
    user,
  } as never)
}

const findAll = async (collection: Coll | 'archive-assets', draft: boolean, where?: object) =>
  (await payload.find({
    collection: collection as 'stories', draft, where: where as never, pagination: false, depth: 0, overrideAccess: true,
  })).docs as unknown as Rec[]

const publishedDocs = (collection: Coll) => findAll(collection, false, { _status: { equals: 'published' } })

const readGlobal = async (slug: 'page-intros' | 'site-settings', draft: boolean) =>
  (await payload.findGlobal({ slug, draft, depth: 0, overrideAccess: true })) as unknown as Rec

type Node = Rec & { children?: Node[] }
const collectNodes = (n: Node, out: Node[] = []): Node[] => {
  out.push(n)
  for (const c of n.children ?? []) collectNodes(c, out)
  return out
}

describe('importContent', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  }, 60_000)
  beforeEach(async () => {
    await resetDb(payload)
    await publishEmptyGlobals()
  }, 60_000)

  it('DB trắng: tạo đủ, tất cả là nháp', async () => {
    const report = await importContent(payload)
    const createdIn = (c: Coll) => report.created.filter((x) => x.collection === c).map((x) => x.key)
    expect(createdIn('timeline-events')).toHaveLength(7)
    expect(createdIn('craft-steps')).toHaveLength(7)
    expect(createdIn('products')).toHaveLength(7)
    expect(createdIn('stories')).toEqual(['chuyen-ve-trang-chieu'])
    expect(report.existing).toEqual([])
    expect(report.sourcesCreated).toHaveLength(5)

    for (const c of COLLECTIONS) {
      expect(await publishedDocs(c)).toHaveLength(0)
      // Bản chính (không đọc version) cũng là nháp.
      expect((await findAll(c, false)).map((d) => d._status).every((s) => s === 'draft')).toBe(true)
      for (const d of await findAll(c, true)) {
        expect(d._status).toBe('draft')
        expect(d.workflow).toBe('draft')
        for (const f of ['image', 'cover']) expect(d[f] ?? null).toBeNull()
        expect((d.images as unknown[] | undefined) ?? []).toEqual([])
      }
    }
    expect((await payload.count({ collection: 'archive-assets', overrideAccess: true })).totalDocs).toBe(0)

    const g = Object.fromEntries(report.globals.map((x) => [x.slug, x]))
    expect(g['page-intros'].saved).toBe('draft')
    expect(g['page-intros'].filled).toEqual(expect.arrayContaining(['lang-hoi.title', 'lang-hoi.facts', 'home.heroTitle']))
    expect(g['page-intros'].warning).toBeUndefined()
    expect(g['site-settings'].saved).toBe('draft')
    expect(g['site-settings'].filled).toEqual(expect.arrayContaining(['tagline', 'copyright']))

    // Bản công khai của global không đổi.
    expect((await readGlobal('page-intros', false))['lang-hoi']).toMatchObject({ title: null })
    expect((await readGlobal('site-settings', false)).tagline ?? null).toBeNull()
  }, 120_000)

  it('bài Trạng Chiếu không có figure, còn cite', async () => {
    await importContent(payload)
    const [story] = await findAll('stories', true, { slug: { equals: 'chuyen-ve-trang-chieu' } })
    const nodes = collectNodes((story.body as { root: Node }).root)
    const blockTypes = nodes.map((n) => (n.fields as Rec | undefined)?.blockType)
    expect(blockTypes).not.toContain('figure')
    expect(nodes.filter((n) => n.type === 'inlineBlock' && (n.fields as Rec).blockType === 'cite').length)
      .toBeGreaterThanOrEqual(1)
  }, 120_000)

  it('chạy lần hai không tạo gì', async () => {
    await importContent(payload)
    const second = await importContent(payload)
    expect(second.created).toEqual([])
    expect(second.existing).toHaveLength(22)
    expect(second.sourcesCreated).toEqual([])
    expect(second.sourcesSkipped).toHaveLength(5)
    expect(second.globals.map((g) => g.saved)).toEqual(['none', 'none'])
    expect(second.globals.every((g) => g.filled.length === 0)).toBe(true)
  }, 120_000)

  it('không ghi đè bản ghi đã có', async () => {
    await importContent(payload)
    const [ev] = await findAll('timeline-events', true, { order: { equals: 3 } })
    await payload.update({
      collection: 'timeline-events', id: ev.id as number, data: { title: 'Sửa tay' }, draft: true, overrideAccess: true,
    })
    const second = await importContent(payload)
    expect(second.existing).toContainEqual({ collection: 'timeline-events', key: '3' })
    const [after] = await findAll('timeline-events', true, { order: { equals: 3 } })
    expect(after.title).toBe('Sửa tay')
    expect(await findAll('timeline-events', true)).toHaveLength(7)
  }, 120_000)

  it('global chỉ điền trường trống', async () => {
    const user = await reviewer()
    await payload.updateGlobal({
      slug: 'page-intros', data: { 'lang-hoi': { title: 'Tiêu đề riêng' }, _status: 'published' }, overrideAccess: true, user,
    } as never)
    const report = await importContent(payload)
    const intros = report.globals.find((g) => g.slug === 'page-intros')!
    expect(intros.filled).not.toContain('lang-hoi.title')
    expect(intros.filled).toContain('lang-hoi.lead')

    const draft = (await readGlobal('page-intros', true))['lang-hoi'] as Rec
    expect(draft.title).toBe('Tiêu đề riêng')
    expect(draft.lead).toBe(pageIntros['lang-hoi'].lead)
    expect((draft.facts as unknown[]).length).toBeGreaterThan(0)
    const live = (await readGlobal('page-intros', false))['lang-hoi'] as Rec
    expect(live.title).toBe('Tiêu đề riêng')
    expect(live.lead ?? null).toBeNull()
  }, 120_000)

  it('global có nháp chờ duyệt', async () => {
    await payload.updateGlobal({
      slug: 'site-settings', data: { tagline: 'Nháp' }, draft: true, overrideAccess: true,
    } as never)
    const report = await importContent(payload)
    const s = report.globals.find((g) => g.slug === 'site-settings')!
    expect(s.saved).toBe('draft')
    expect(s.warning).toContain('Cài đặt chung')
    expect(s.filled).not.toContain('tagline')
    expect(report.globals.find((g) => g.slug === 'page-intros')!.warning).toBeUndefined()

    const draft = await readGlobal('site-settings', true)
    expect(draft.tagline).toBe('Nháp')
    expect(draft.description).toBe(siteSettings.description)
  }, 120_000)

  it('người duyệt đăng được', async () => {
    await importContent(payload)
    const user = await reviewer()
    const targets: [Coll, object][] = [
      ['stories', { slug: { equals: 'chuyen-ve-trang-chieu' } }],
      ['timeline-events', { order: { equals: 1 } }],
      ['craft-steps', { n: { equals: 1 } }],
      ['products', { slug: { equals: 'chieu-cap-dieu' } }],
    ]
    for (const [collection, where] of targets) {
      const [d] = await findAll(collection, true, where)
      await payload.update({
        collection: collection as 'stories', id: d.id as number,
        data: { _status: 'published', workflow: 'published' }, overrideAccess: true, user,
      } as never)
      const pub = await findAll(collection, false, { and: [where, { _status: { equals: 'published' } }] })
      expect(pub, collection).toHaveLength(1)
    }
    for (const slug of ['page-intros', 'site-settings'] as const) {
      await payload.updateGlobal({ slug, data: { _status: 'published' }, overrideAccess: true, user } as never)
    }
    const intros = await readGlobal('page-intros', false)
    expect(intros._status).toBe('published')
    expect((intros['lang-hoi'] as Rec).title).toBe(pageIntros['lang-hoi'].title)
    expect((await readGlobal('site-settings', false)).tagline).toBe(siteSettings.tagline)
  }, 120_000)

  it('nguồn không có trong sources.json thì báo lỗi, không tạo gì', async () => {
    const { assertSourcesKnown } = await import('@/seed/importContent')
    expect(() => assertSourcesKnown(new Set(['a']), [{ where: 'mốc 1', ids: ['a', 'khong-co'] }]))
      .toThrow(/khong-co/)
  })
})

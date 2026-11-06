// @vitest-environment node
import type { Payload } from 'payload'
import { sql } from 'drizzle-orm'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { ROUTE_KEYS } from '@/lib/routeKeys'
import { importContent } from '@/seed/importContent'
import { pendingDraftWarning } from '@/seed/pageFacts'
import { pageIntros, siteSettings } from '@/seed/data/site'
import { getTestPayload, makeUser, readPage, resetDb, upsertPage } from './helpers'

type Rec = Record<string, unknown>
type Coll = 'timeline-events' | 'craft-steps' | 'products' | 'stories'
const COLLECTIONS: Coll[] = ['timeline-events', 'craft-steps', 'products', 'stories']

let payload: Payload

const reviewer = async () => ({ ...(await makeUser(payload, 'reviewer')), collection: 'users' as const })

/** Globals không bị resetDb xoá: đăng bản có mọi trường lệnh nhập điền đều trống. Trang thì resetDb xoá hết. */
async function publishEmptyGlobals() {
  const user = await reviewer()
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

const readGlobal = async (slug: 'site-settings', draft: boolean) =>
  (await payload.findGlobal({ slug, draft, depth: 0, overrideAccess: true })) as unknown as Rec

/** Mọi tài liệu `pages`: bản chính (`draft: false`) hoặc nháp mới nhất. */
const allPages = async (draft: boolean) =>
  (await payload.find({ collection: 'pages', draft, pagination: false, depth: 0, overrideAccess: true }))
    .docs as unknown as Rec[]

const pageReport = (report: Awaited<ReturnType<typeof importContent>>, slug: string) =>
  report.pages.find((p) => p.slug === slug)

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
    const ddk = await payload.find({ collection: 'sources', where: { sourceId: { equals: 'daidoanket-2021' } }, overrideAccess: true })
    expect(ddk.docs[0]?.author).toBe('Vương Tâm')

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

    // 8 trang, đều là nháp, có đúng các nhóm như trước.
    expect(report.pages.map((p) => p.slug).sort()).toEqual([...ROUTE_KEYS].sort())
    for (const p of report.pages) {
      expect(p.saved, p.slug).toBe('draft')
      expect(p.warning, p.slug).toBeUndefined()
    }
    expect(pageReport(report, 'lang-hoi')!.filled).toEqual(expect.arrayContaining(['title', 'lead', 'facts', 'pageSources']))
    expect(pageReport(report, 'home')!.filled).toEqual(expect.arrayContaining(['eyebrow', 'title', 'heroTitle']))
    expect(pageReport(report, 'nghe-det-chieu')!.filled).toEqual(expect.arrayContaining(['tools', 'compareRows']))
    expect(pageReport(report, 'nghe-det-chieu')!.filled).not.toContain('pageSources')
    const main = await allPages(false)
    expect(main).toHaveLength(8)
    expect(main.every((d) => d._status === 'draft')).toBe(true)
    const drafts = await allPages(true)
    for (const d of drafts) {
      expect(d._status).toBe('draft')
      expect(d.title, String(d.slug)).toBe(pageIntros[d.slug as string].title)
    }
    const village = await readPage(payload, 'lang-hoi', true)
    expect((village.facts as unknown[]).length).toBe(3)
    expect((village.pageSources as unknown[]).length).toBe(5)
    expect((await readPage(payload, 'nghe-det-chieu', true)).tools as unknown[]).toHaveLength(3)
    expect((await readPage(payload, 'home', true)).heroTitle).toBe(pageIntros.home.heroTitle)

    const g = Object.fromEntries(report.globals.map((x) => [x.slug, x]))
    expect(Object.keys(g)).toEqual(['site-settings'])
    expect(g['site-settings'].saved).toBe('draft')
    expect(g['site-settings'].filled).toEqual(expect.arrayContaining(['tagline', 'copyright']))

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
    expect(second.globals.map((g) => g.saved)).toEqual(['none'])
    expect(second.globals.every((g) => g.filled.length === 0)).toBe(true)
    expect(second.pages).toEqual([])
    expect(await allPages(false)).toHaveLength(8)
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

  it('trang chỉ điền trường trống, bản đã đăng giữ nguyên', async () => {
    await upsertPage(payload, 'lang-hoi', { title: 'Tiêu đề riêng' })
    const report = await importContent(payload)
    const village = pageReport(report, 'lang-hoi')!
    expect(village.filled).not.toContain('title')
    expect(village.filled).toContain('lead')
    expect(village.warning).toBeUndefined()

    const draft = await readPage(payload, 'lang-hoi', true)
    expect(draft.title).toBe('Tiêu đề riêng')
    expect(draft.lead).toBe(pageIntros['lang-hoi'].lead)
    expect((draft.facts as unknown[]).length).toBeGreaterThan(0)
    const live = await readPage(payload, 'lang-hoi', false)
    expect(live._status).toBe('published')
    expect(live.title).toBe('Tiêu đề riêng')
    expect(live.lead ?? null).toBeNull()
    expect((live.facts as unknown[] | undefined) ?? []).toEqual([])
  }, 120_000)

  it('global chưa từng lưu (production mới): public vẫn trống, nháp có nội dung, chạy lại không đổi', async () => {
    const db = (payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<unknown> } }).drizzle
    await db.execute(sql`TRUNCATE TABLE "site_settings", "_site_settings_v" CASCADE`)

    const first = await importContent(payload)
    expect(first.globals.map((g) => g.saved)).toEqual(['draft'])
    expect(first.pages).toHaveLength(8)

    expect((await allPages(false)).some((d) => d._status === 'published')).toBe(false)
    expect((await readGlobal('site-settings', false)).tagline ?? null).toBeNull()

    expect((await readPage(payload, 'lang-hoi', true)).title).toBe(pageIntros['lang-hoi'].title)
    expect((await readGlobal('site-settings', true)).tagline).toBe(siteSettings.tagline)

    const second = await importContent(payload)
    expect(second.globals.map((g) => g.saved)).toEqual(['none'])
    expect(second.pages).toEqual([])
    expect(second.created).toEqual([])
  }, 120_000)

  it('global có nháp chờ duyệt', async () => {
    await payload.updateGlobal({
      slug: 'site-settings', data: { tagline: 'Nháp' }, draft: true, overrideAccess: true,
    } as never)
    const report = await importContent(payload)
    const s = report.globals.find((g) => g.slug === 'site-settings')!
    expect(s.saved).toBe('draft')
    expect(s.warning).toContain('Thông tin site')
    expect(s.filled).not.toContain('tagline')
    expect(report.pages.every((p) => p.warning === undefined)).toBe(true)

    const draft = await readGlobal('site-settings', true)
    expect(draft.tagline).toBe('Nháp')
    expect(draft.description).toBe(siteSettings.description)
  }, 120_000)

  it('trang có nháp chờ duyệt: vẫn lưu nháp, kèm cảnh báo của đúng trang đó', async () => {
    await upsertPage(payload, 'lang-hoi', { title: 'Đã đăng' })
    await upsertPage(payload, 'lang-hoi', { title: 'Nháp' }, { publish: false })
    const report = await importContent(payload)
    const village = pageReport(report, 'lang-hoi')!
    expect(village.saved).toBe('draft')
    expect(village.warning).toBe(pendingDraftWarning('Trang Làng Hới'))
    expect(village.filled).not.toContain('title')
    expect(report.pages.filter((p) => p.warning)).toHaveLength(1)

    const draft = await readPage(payload, 'lang-hoi', true)
    expect(draft.title).toBe('Nháp')
    expect(draft.lead).toBe(pageIntros['lang-hoi'].lead)
    expect((await readPage(payload, 'lang-hoi', false)).title).toBe('Đã đăng')
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
    await payload.updateGlobal({ slug: 'site-settings', data: { _status: 'published' }, overrideAccess: true, user } as never)
    // Mọi trang đăng được, kể cả kiểm nguồn của trang Làng Hới và Nghề dệt chiếu.
    for (const d of await allPages(true)) {
      await payload.update({
        collection: 'pages', id: d.id as number,
        data: { _status: 'published', workflow: 'published' }, overrideAccess: true, user,
        context: { disableRevalidate: true },
      } as never)
    }
    const live = await allPages(false)
    expect(live.every((d) => d._status === 'published')).toBe(true)
    expect((await readPage(payload, 'lang-hoi', false)).title).toBe(pageIntros['lang-hoi'].title)
    expect(((await readPage(payload, 'lang-hoi', false)).facts as unknown[]).length).toBe(3)
    expect((await readGlobal('site-settings', false)).tagline).toBe(siteSettings.tagline)
  }, 120_000)

  it('nguồn không có trong sources.json thì báo lỗi, không tạo gì', async () => {
    const { assertSourcesKnown } = await import('@/seed/importContent')
    expect(() => assertSourcesKnown(new Set(['a']), [{ where: 'mốc 1', ids: ['a', 'khong-co'] }]))
      .toThrow(/khong-co/)
  })
})

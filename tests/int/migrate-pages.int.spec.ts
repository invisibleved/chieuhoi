// @vitest-environment node
import path from 'path'
import { sql } from 'drizzle-orm'
import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { ROUTE_KEYS } from '@/collections/pages/routeKeys'
import type { User } from '@/payload-types'
import { checkPages, migratePages } from '@/seed/migratePages'

import { getTestPayload, makeUser, resetDb } from './helpers'

type Rec = Record<string, unknown>
type PageDoc = Rec & { id: number; slug: string; _status?: string; lead?: string | null }

const fixture = path.resolve(__dirname, '../fixtures/tiny.webp')
const CTX = { disableRevalidate: true }

let payload: Payload
let reviewer: User

/** Nội dung global mẫu: mỗi trang có tiêu đề riêng. */
const intros = (extra: Rec = {}): Rec => {
  const data: Rec = {}
  for (const key of ROUTE_KEYS) data[key] = { eyebrow: `Dòng nhỏ ${key}`, title: `Tiêu đề ${key}`, lead: `Dẫn ${key}` }
  for (const [key, v] of Object.entries(extra)) data[key] = { ...(data[key] as Rec), ...(v as Rec) }
  return data
}

const publishGlobal = (data: Rec) =>
  payload.updateGlobal({
    slug: 'page-intros', data: { ...data, _status: 'published' }, user: reviewer, overrideAccess: true, context: CTX,
  } as never)

const saveGlobalDraft = (data: Rec) =>
  payload.updateGlobal({
    slug: 'page-intros', data, draft: true, user: reviewer, overrideAccess: true, context: CTX,
  } as never)

/** Nội dung các trang của global (bỏ `_status`, `id`, ngày giờ để ghi lại được). */
const readGlobal = async (): Promise<Rec> => {
  const g = (await payload.findGlobal({ slug: 'page-intros', depth: 0, draft: true, overrideAccess: true })) as unknown as Rec
  return Object.fromEntries(ROUTE_KEYS.map((k) => [k, g[k]]))
}

const pageOf = async (slug: string, draft: boolean): Promise<PageDoc> => {
  const { docs } = await payload.find({
    collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true,
  })
  return (await payload.findByID({
    collection: 'pages', id: docs[0].id, draft, depth: 0, overrideAccess: true,
  })) as unknown as PageDoc
}

const actions = (r: Awaited<ReturnType<typeof migratePages>>) =>
  Object.fromEntries(r.pages.map((p) => [p.slug, p.action]))

describe('migratePages', { timeout: 60_000 }, () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  beforeEach(async () => {
    await resetDb(payload)
    const db = (payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<unknown> } }).drizzle
    await db.execute(sql`TRUNCATE TABLE "page_intros", "_page_intros_v" CASCADE`)
    reviewer = await makeUser(payload, 'reviewer')
  })

  it('global đã đăng, có nháp sửa lang-hoi: lang-hoi đăng bản cũ kèm nháp mới, 7 trang chỉ đăng', async () => {
    await publishGlobal(intros())
    const g = await readGlobal()
    await saveGlobalDraft({ ...g, 'lang-hoi': { ...(g['lang-hoi'] as Rec), lead: 'Dẫn mới' } })

    const report = await migratePages(payload)
    const acts = actions(report)
    expect(acts['lang-hoi']).toBe('created-published+draft')
    for (const slug of ROUTE_KEYS.filter((s) => s !== 'lang-hoi')) expect(acts[slug]).toBe('created-published')

    const live = await pageOf('lang-hoi', false)
    expect(live._status).toBe('published')
    expect(live.workflow).toBe('published')
    expect(live.lead).toBe('Dẫn lang-hoi')
    expect((await pageOf('lang-hoi', true)).lead).toBe('Dẫn mới')
    expect((await pageOf('home', true)).lead).toBe('Dẫn home')
    expect(await checkPages(payload)).toEqual([])
  })

  it('global chưa từng đăng: 8 trang nháp, không trang nào đăng', async () => {
    await saveGlobalDraft(intros())
    const report = await migratePages(payload)
    expect(report.pages.map((p) => p.action)).toEqual(ROUTE_KEYS.map(() => 'created-draft'))

    const live = await payload.find({
      collection: 'pages', draft: false, where: { _status: { equals: 'published' } }, overrideAccess: true,
    })
    expect(live.docs).toHaveLength(0)
    expect((await pageOf('cau-chuyen', true)).title).toBe('Tiêu đề cau-chuyen')
    expect(await checkPages(payload)).toEqual([])
  })

  it('chạy hai lần: lần hai bỏ qua cả 8 trang, --check không thấy khác biệt', async () => {
    await publishGlobal(intros({ 'lang-hoi': { facts: [{ term: 'Diện tích', detail: '1 km²' }] } }))
    await migratePages(payload)
    const second = await migratePages(payload)
    expect(second.pages.map((p) => p.action)).toEqual(ROUTE_KEYS.map(() => 'skipped'))
    expect(second.pages.find((p) => p.slug === 'lang-hoi')?.rows).toBe(1)
    expect(await checkPages(payload)).toEqual([])
    const { totalDocs } = await payload.count({ collection: 'pages', overrideAccess: true })
    expect(totalDocs).toBe(8)
  })

  it('câu trích nguồn ngoài pageSources: trang vẫn đăng, báo cáo nêu chỗ lệch', async () => {
    const src = (sourceId: string) =>
      payload.create({ collection: 'sources', data: { sourceId, title: sourceId }, overrideAccess: true }) as Promise<{ id: number }>
    const a = await src('danviet-2024')
    const b = await src('vnexpress-2023')
    await publishGlobal(intros({
      'lang-hoi': { pageSources: [a.id], facts: [{ term: 'Diện tích', detail: '...', sources: [a.id, b.id] }] },
    }))

    const report = await migratePages(payload)
    expect(actions(report)['lang-hoi']).toBe('created-published')
    expect(report.pages.find((p) => p.slug === 'lang-hoi')?.citations).toBe(2)
    expect(report.sourceIssues).toEqual([
      { slug: 'lang-hoi', missing: [{ where: 'Bảng thông tin đầu trang, dòng "Diện tích"', sourceIds: [b.id] }] },
    ])
    const live = await pageOf('lang-hoi', false)
    expect(live._status).toBe('published')
    expect(live.pageSources).toEqual([a.id])
  })

  it('ảnh ô tool-1 của global nằm trong tools[0].image của trang', async () => {
    const img = (await payload.create({
      collection: 'archive-assets', data: { alt: 'Khung dệt', title: 'Khung', code: 'TL-01' }, filePath: fixture,
      overrideAccess: true,
    } as never)) as { id: number }
    await publishGlobal(intros({
      'nghe-det-chieu': {
        media: [{ slot: 'tool-1', image: img.id }, { slot: 'hero', image: img.id }],
        tools: [{ name: 'Khung dệt' }, { name: 'Go' }],
      },
    }))

    await migratePages(payload)
    const page = await pageOf('nghe-det-chieu', false)
    const tools = page.tools as { name: string; image?: number | null }[]
    expect(tools.map((t) => [t.name, t.image ?? null])).toEqual([['Khung dệt', img.id], ['Go', null]])
    expect((page.media as { slot: string }[]).map((m) => m.slot)).toEqual(['hero'])
    expect(await checkPages(payload)).toEqual([])
  })

  it('sửa global sau khi chép: --check báo khác, --replace chép lại hết', async () => {
    await publishGlobal(intros())
    await migratePages(payload)
    const g = await readGlobal()
    await publishGlobal({ ...g, 'lang-hoi': { ...(g['lang-hoi'] as Rec), title: 'Sửa sau' } })

    expect(await checkPages(payload)).toEqual([
      { slug: 'lang-hoi', state: 'published', reason: 'different' },
      { slug: 'lang-hoi', state: 'draft', reason: 'different' },
    ])

    const again = await migratePages(payload, { replace: true })
    expect(again.pages.map((p) => p.action)).toEqual(ROUTE_KEYS.map(() => 'created-published'))
    expect(await checkPages(payload)).toEqual([])
    expect((await pageOf('lang-hoi', false)).title).toBe('Sửa sau')
  })

  it('lưu nháp global sau khi chép: --check chỉ báo bản nháp khác', async () => {
    await publishGlobal(intros())
    await migratePages(payload)
    const g = await readGlobal()
    await saveGlobalDraft({ ...g, home: { ...(g.home as Rec), heroTitle: 'Nháp sau' } })
    expect(await checkPages(payload)).toEqual([{ slug: 'home', state: 'draft', reason: 'different' }])
  })

  it('chưa chép gì: --check báo thiếu', async () => {
    await publishGlobal(intros())
    const diffs = await checkPages(payload)
    expect(diffs).toHaveLength(16)
    expect(diffs[0]).toEqual({ slug: 'home', state: 'published', reason: 'missing' })
  })
})

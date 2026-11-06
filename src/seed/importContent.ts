// Lệnh nhập nội dung khởi đầu cho production (spec 2026-10-31, phần A):
// tạo nguồn còn thiếu, tạo mốc/công đoạn/sản phẩm/bài dưới dạng bản nháp, không gắn ảnh,
// không ghi đè bản ghi đã có; mỗi trang (`pages`) và global Thông tin site chỉ điền trường trống
// rồi lưu một bản nháp.
// Chạy không cần tài khoản (overrideAccess). Không bao giờ đăng.
import { readFileSync } from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { ROUTE_KEYS, type RouteKey } from '@/lib/routeKeys'

import { craftStepDocs, productDocs, readSeedJson, storyDocs, timelineDocs, type SourceIdMap } from './content'
import { pageIntros, siteSettings } from './data/site'
import {
  ensurePages, ensureSources, hasPendingDraft, isEmptyGroup, pageFactsFill, pageLabel, pendingDraftWarning,
  readPageDraft, savePage, type PageSave,
} from './pageFacts'

type Collection = 'timeline-events' | 'craft-steps' | 'products' | 'stories'
type GlobalSlug = 'site-settings'
type Rec = Record<string, unknown>

export type ContentReport = {
  sourcesCreated: string[]
  sourcesSkipped: string[]
  created: { collection: Collection; key: string }[]
  existing: { collection: Collection; key: string }[]
  /** Các trang đã lưu nháp; trang không có gì để điền thì không có ở đây. */
  pages: PageSave[]
  globals: { slug: GlobalSlug; filled: string[]; saved: 'draft' | 'none'; warning?: string }[]
}

/** Báo lỗi nếu có tham chiếu nguồn không nằm trong `known` (builder đổi id lạ thành undefined mà không báo). */
export function assertSourcesKnown(known: Set<string>, refs: { where: string; ids: (string | null | undefined)[] }[]): void {
  const missing = refs.flatMap(({ where, ids }) =>
    ids.filter((id): id is string => typeof id === 'string' && !known.has(id)).map((id) => `${id} (${where})`),
  )
  if (missing.length) {
    throw new Error(`Nguồn không có trong content/seed/sources.json: ${missing.join(', ')}. Chưa nhập gì.`)
  }
}

/** Mọi sourceId mà dữ liệu nhập sẽ trích dẫn, kèm vị trí để báo lỗi. */
function sourceRefs(): { where: string; ids: (string | null | undefined)[] }[] {
  const timeline = readSeedJson<{ sources: string[] }[]>('timeline.json')
  const products = readSeedJson<{ slug: string; annotations?: { source: string | null }[] }[]>('products.json')
  const stories = readSeedJson<{ slug: string; status?: string; sources?: string[] }[]>('stories.json')
  const markdown = readFileSync(path.resolve(process.cwd(), 'src/seed/data/chuyen-ve-trang-chieu.md'), 'utf8')
  return [
    ...timeline.map((t, i) => ({ where: `mốc ${i + 1}`, ids: t.sources })),
    ...products.map((p) => ({ where: `sản phẩm ${p.slug}`, ids: (p.annotations ?? []).map((a) => a.source) })),
    ...stories.filter((s) => s.status !== 'idea').map((s) => ({ where: `bài ${s.slug}`, ids: s.sources ?? [] })),
    { where: 'thân bài chuyen-ve-trang-chieu', ids: [...markdown.matchAll(/\[\[cite:([^\]]+)\]\]/g)].map((m) => m[1]) },
  ]
}

const KEY_FIELD: Record<Collection, string> = {
  'timeline-events': 'order',
  'craft-steps': 'n',
  products: 'slug',
  stories: 'slug',
}

const INTRO_FIELDS = ['eyebrow', 'title', 'heroTitle', 'lead'] as const

/** Lưu một bản nháp nếu có gì để điền; có nháp chờ duyệt thì vẫn lưu và kèm cảnh báo. */
async function saveGlobalDraft(
  payload: Payload,
  slug: GlobalSlug,
  label: string,
  data: Rec,
  filled: string[],
): Promise<ContentReport['globals'][number]> {
  if (!filled.length) return { slug, filled, saved: 'none' }
  const pending = await hasPendingDraft(payload, { global: slug })
  await payload.updateGlobal({
    slug,
    data: { ...data, _status: 'draft' } as never,
    draft: true,
    overrideAccess: true,
  })
  return { slug, filled, saved: 'draft', ...(pending ? { warning: pendingDraftWarning(label) } : {}) }
}

export async function importContent(payload: Payload): Promise<ContentReport> {
  const report: ContentReport = {
    sourcesCreated: [], sourcesSkipped: [], created: [], existing: [], pages: [], globals: [],
  }

  // Kiểm trước khi ghi bất cứ gì.
  const sourceList = readSeedJson<{ id: string }[]>('sources.json').map((s) => s.id)
  assertSourcesKnown(new Set(sourceList), sourceRefs())

  const sourceIds: SourceIdMap = await ensureSources(payload, sourceList, undefined, report)

  const groups: [Collection, { key: number | string; data: Rec }[]][] = [
    ['timeline-events', timelineDocs(sourceIds, 'draft')],
    ['craft-steps', craftStepDocs(null, 'draft')],
    ['products', productDocs(sourceIds, null, 'draft')],
    ['stories', storyDocs(payload, sourceIds, { asset: null, workflow: 'draft', skipIdeas: true })],
  ]
  for (const [collection, docs] of groups) {
    for (const { key, data } of docs) {
      const found = await payload.find({
        collection,
        where: { [KEY_FIELD[collection]]: { equals: key } },
        draft: true,
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const entry = { collection, key: String(key) }
      if (found.docs.length) {
        report.existing.push(entry)
        continue
      }
      await payload.create({
        collection,
        draft: true,
        data: { ...data, workflow: 'draft' } as never,
        overrideAccess: true,
      })
      report.created.push(entry)
    }
  }

  // Trang: phần mở đầu + dữ kiện trang, mỗi trang một bản nháp.
  const createdPages = await ensurePages(payload)
  const drafts = {} as Record<RouteKey, Rec>
  for (const slug of ROUTE_KEYS) drafts[slug] = await readPageDraft(payload, slug)
  const toId = (sourceId: string) => {
    const id = sourceIds[sourceId]
    if (id === undefined) throw new Error(`Không có nguồn ${sourceId}.`)
    return id
  }
  const facts = pageFactsFill(drafts, toId)
  for (const slug of ROUTE_KEYS) {
    const existing = drafts[slug]
    const seed = (pageIntros[slug] ?? {}) as Rec
    const fill: Rec = {}
    for (const f of INTRO_FIELDS) {
      if (seed[f] !== undefined && isEmptyGroup(existing[f])) fill[f] = seed[f]
    }
    Object.assign(fill, facts.fill[slug as keyof typeof facts.fill] ?? {})
    if (!Object.keys(fill).length) continue
    const pending = !createdPages.includes(slug) && (await hasPendingDraft(payload, { collection: 'pages', slug }))
    await savePage(payload, slug, fill, { publish: false })
    report.pages.push({
      slug,
      filled: Object.keys(fill),
      saved: 'draft',
      ...(pending ? { warning: pendingDraftWarning(pageLabel(slug)) } : {}),
    })
  }

  // Thông tin site.
  const settings = (await payload.findGlobal({
    slug: 'site-settings', draft: true, depth: 0, overrideAccess: true,
  })) as unknown as Rec
  const settingsData: Rec = {}
  for (const [f, v] of Object.entries(siteSettings)) {
    if (isEmptyGroup(settings[f])) settingsData[f] = v
  }
  report.globals.push(
    await saveGlobalDraft(payload, 'site-settings', 'Thông tin site', settingsData, Object.keys(settingsData)),
  )

  return report
}

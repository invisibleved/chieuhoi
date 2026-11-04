// Đợt 1 (spec 6.6): chép global "Phần mở đầu trang" (`page-intros`) sang collection "Trang" (`pages`).
// Chỉ chép, không sửa nội dung. Trang công khai vẫn đọc từ global cho tới đợt 2a.
import type { Payload, TypedUser } from 'payload'

import { missingPageSources, type MissingSource } from '@/collections/pages/checkPageSources'
import { PAGE_ONLY_FIELDS } from '@/collections/pages/fields'
import { ROUTE_KEYS, type RouteKey } from '@/collections/pages/routeKeys'

type Obj = Record<string, unknown>

const COMMON_FIELDS = ['eyebrow', 'title', 'lead'] as const
/** Trường quan hệ: luôn ghi bằng id số. */
const RELATION_FIELDS = new Set(['sources', 'pageSources', 'image', 'heroImage', 'heroInset'])
/** Khoá không phải nội dung, bỏ qua khi so. */
const IGNORED_KEYS = new Set(['id', 'createdAt', 'updatedAt', '_status', 'workflow', 'slug'])

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)

const idOf = (v: unknown): unknown => {
  const raw = isObj(v) ? v.id : v
  const n = typeof raw === 'string' && /^\d+$/.test(raw) ? Number(raw) : raw
  return n
}

/** Bản sao sâu: bỏ `id` của mọi dòng, đưa giá trị quan hệ về id số. */
const clean = (v: unknown, key?: string): unknown => {
  if (key && RELATION_FIELDS.has(key)) {
    if (Array.isArray(v)) return v.map(idOf)
    return v == null ? v : idOf(v)
  }
  if (Array.isArray(v)) return v.map((x) => clean(x))
  if (isObj(v)) {
    return Object.fromEntries(Object.entries(v).filter(([k]) => k !== 'id').map(([k, x]) => [k, clean(x, k)]))
  }
  return v
}

/** Trường chung và trường riêng của trang `slug`, đã làm sạch. Khoá không có trong nguồn thì không tạo. */
const pickPage = (src: Obj | undefined, slug: RouteKey): Obj => {
  const out: Obj = {}
  if (!src) return out
  for (const name of [...COMMON_FIELDS, ...PAGE_ONLY_FIELDS[slug]]) {
    if (Object.hasOwn(src, name)) out[name] = clean(src[name], name)
  }
  return out
}

const TOOL_SLOT = /^tool-(\d+)$/

/** Khoá của nhóm global không có chỗ trong trang `slug` (không phải trường chung, trường riêng hay `id`). */
export function unknownKeys(group: Obj | undefined, slug: RouteKey): string[] {
  if (!group) return []
  const known = new Set<string>([...COMMON_FIELDS, ...PAGE_ONLY_FIELDS[slug], 'id'])
  return Object.keys(group).filter((k) => !known.has(k))
}

const isEmpty = (v: unknown): boolean => v == null || (typeof v === 'string' && v.trim() === '')

/**
 * Như `pageFromGlobal`, kèm danh sách dữ liệu không chép được (lời tiếng Việt cho người duyệt):
 * khoá lạ của nhóm, chú thích của ô `tool-n`, ảnh `tool-n` không có dòng dụng cụ thứ n.
 */
export function convertGlobalPage(group: Obj | undefined, slug: RouteKey): { page: Obj; dropped: string[] } {
  const page = pickPage(group, slug)
  const dropped = unknownKeys(group, slug).map((k) => `Trường "${k}" không có trong Trang`)
  if (slug !== 'nghe-det-chieu' || !Array.isArray(page.media)) return { page, dropped }

  const toolImages = new Map<number, unknown>()
  page.media = (page.media as unknown[]).filter((row) => {
    const m = isObj(row) && typeof row.slot === 'string' ? TOOL_SLOT.exec(row.slot) : null
    if (!m) return true
    const r = row as Obj
    if (!isEmpty(r.caption)) dropped.push(`Chú thích của ô ảnh ${r.slot}: "${String(r.caption)}"`)
    toolImages.set(Number(m[1]) - 1, r.image ?? null)
    return false
  })
  const tools = Array.isArray(page.tools) ? (page.tools as unknown[]) : []
  for (const [i, image] of toolImages) {
    if (image != null && !isObj(tools[i])) dropped.push(`Ảnh ô tool-${i + 1} (id ${String(image)}) không có dòng dụng cụ thứ ${i + 1}`)
  }
  if (Array.isArray(page.tools)) {
    page.tools = tools.map((t, i) => (isObj(t) && toolImages.has(i) ? { ...t, image: toolImages.get(i) } : t))
  }
  return { page, dropped }
}

/**
 * Dữ liệu trang `slug` của collection `pages` lấy từ nhóm cùng tên của global.
 * Với `nghe-det-chieu`: ảnh ô `tool-n` chuyển vào `tools[n-1].image`, ô `tool-n` bỏ khỏi `media`.
 */
export function pageFromGlobal(group: Obj | undefined, slug: RouteKey): Obj {
  return convertGlobalPage(group, slug).page
}

/**
 * Bỏ khoá không phải nội dung và mọi giá trị trống: `null`, thiếu, `false` (ô đánh dấu chưa bật),
 * mảng trống, nhóm trống. `true` vẫn khác `false`.
 */
const comparable = (v: unknown): unknown => {
  if (Array.isArray(v)) {
    const rows = v.map(comparable)
    return rows.length ? rows : undefined
  }
  if (isObj(v)) {
    const entries = Object.entries(v)
      .filter(([k]) => !IGNORED_KEYS.has(k))
      .map(([k, x]) => [k, comparable(x)] as const)
      .filter(([, x]) => x !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return entries.length ? Object.fromEntries(entries) : undefined
  }
  return v === null || v === false ? undefined : v
}

/** So sâu nội dung hai trang, bỏ qua `id`, ngày giờ, trạng thái, `slug` và giá trị trống. */
export function samePageContent(a: Obj, b: Obj): boolean {
  return JSON.stringify(comparable(a) ?? {}) === JSON.stringify(comparable(b) ?? {})
}

export type MigrateAction = 'created-published' | 'created-published+draft' | 'created-draft' | 'skipped'

export type MigrateReport = {
  pages: { slug: RouteKey; action: MigrateAction; rows: number; citations: number }[]
  sourceIssues: { slug: RouteKey; missing: MissingSource[] }[]
  /** Dữ liệu của global không chép được sang trang. */
  dropped: { slug: RouteKey; what: string }[]
}

export type PageDiff =
  | { slug: RouteKey; state: 'published' | 'draft'; reason: 'missing' | 'different' }
  | { slug: RouteKey; state: 'published' | 'draft'; reason: 'unknown-field'; field: string }

const CONTEXT = { skipPageSourcesCheck: true, disableRevalidate: true }

/** Số dòng của mọi danh sách (kể cả danh sách lồng nhau). */
const countRows = (v: unknown): number => {
  if (Array.isArray(v)) return v.reduce<number>((n, x) => n + (isObj(x) ? 1 + countRows(x) : 0), 0)
  if (isObj(v)) return Object.values(v).reduce<number>((n, x) => n + countRows(x), 0)
  return 0
}

/** Số chú thích: mọi nguồn được trích trong các trường `sources`. */
const countCitations = (v: unknown): number => {
  if (Array.isArray(v)) return v.reduce<number>((n, x) => n + countCitations(x), 0)
  if (isObj(v)) {
    return Object.entries(v).reduce<number>(
      (n, [k, x]) => n + (k === 'sources' && Array.isArray(x) ? x.length : countCitations(x)),
      0,
    )
  }
  return 0
}

type Intros = Obj & { _status?: string }

const readGlobal = async (payload: Payload, draft: boolean): Promise<Intros> =>
  (await payload.findGlobal({ slug: 'page-intros', draft, depth: 0, overrideAccess: true })) as unknown as Intros

const groupOf = (intros: Intros, slug: RouteKey): Obj | undefined => (isObj(intros[slug]) ? (intros[slug] as Obj) : undefined)

type PageDoc = Obj & { id: number; _status?: string }

const findPage = async (payload: Payload, slug: RouteKey): Promise<PageDoc | undefined> => {
  const { docs } = await payload.find({
    collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true, pagination: false,
  })
  return docs[0] as unknown as PageDoc | undefined
}

const readPage = async (payload: Payload, id: number, draft: boolean): Promise<PageDoc> =>
  (await payload.findByID({ collection: 'pages', id, draft, depth: 0, overrideAccess: true })) as unknown as PageDoc

/** Người duyệt dùng để đăng trang (guardPublish và trường `workflow` chỉ cho người duyệt đăng). */
const findReviewer = async (payload: Payload): Promise<TypedUser> => {
  const { docs } = await payload.find({
    collection: 'users', where: { role: { equals: 'reviewer' } }, limit: 1, depth: 0, overrideAccess: true, sort: 'id',
  })
  if (!docs[0]) throw new Error('Cần ít nhất một người duyệt trong Người dùng để đăng trang (npm run create-reviewer).')
  return { ...docs[0], collection: 'users' } as TypedUser
}

const issueKey = (m: MissingSource) => `${m.where}|${m.sourceIds.join(',')}`

/**
 * Chép từng trang của global `page-intros` sang `pages`. Trang đã có thì bỏ qua, trừ khi `replace`.
 * Global đã đăng: tạo trang đã đăng, cộng bản nháp nếu nháp mới nhất của global khác bản đăng.
 * Global chưa từng đăng: tạo trang nháp. Kiểm nguồn của trang được bỏ qua; chỗ lệch nằm trong báo cáo.
 */
export async function migratePages(payload: Payload, opts: { replace?: boolean } = {}): Promise<MigrateReport> {
  const published = await readGlobal(payload, false)
  const latest = await readGlobal(payload, true)
  const isPublished = published._status === 'published'
  const user = isPublished ? await findReviewer(payload) : undefined
  const report: MigrateReport = { pages: [], sourceIssues: [], dropped: [] }

  for (const slug of ROUTE_KEYS) {
    const existing = await findPage(payload, slug)
    if (existing && !opts.replace) {
      const current = pageFromGlobal(await readPage(payload, existing.id, true), slug)
      report.pages.push({ slug, action: 'skipped', rows: countRows(current), citations: countCitations(current) })
      continue
    }
    if (existing) {
      await payload.delete({ collection: 'pages', id: existing.id, overrideAccess: true, context: CONTEXT })
    }

    const draft = convertGlobalPage(groupOf(latest, slug), slug)
    const draftData = draft.page
    const written: Obj[] = []
    const dropped = new Set<string>()
    let action: MigrateAction
    if (isPublished) {
      const live = convertGlobalPage(groupOf(published, slug), slug)
      const liveData = live.page
      live.dropped.forEach((d) => dropped.add(d))
      const created = await payload.create({
        collection: 'pages',
        data: { ...liveData, slug, _status: 'published', workflow: 'published' } as never,
        overrideAccess: true,
        user,
        context: CONTEXT,
      })
      written.push(liveData)
      action = 'created-published'
      if (!samePageContent(draftData, liveData)) {
        await payload.update({
          collection: 'pages', id: created.id, data: draftData as never, draft: true,
          overrideAccess: true, user, context: CONTEXT,
        })
        written.push(draftData)
        draft.dropped.forEach((d) => dropped.add(d))
        action = 'created-published+draft'
      }
    } else {
      await payload.create({
        collection: 'pages', data: { ...draftData, slug } as never, draft: true, overrideAccess: true, context: CONTEXT,
      })
      written.push(draftData)
      draft.dropped.forEach((d) => dropped.add(d))
      action = 'created-draft'
    }

    const last = written[written.length - 1]
    report.pages.push({ slug, action, rows: countRows(last), citations: countCitations(last) })

    const missing = new Map<string, MissingSource>()
    for (const data of written) for (const m of missingPageSources(data)) missing.set(issueKey(m), m)
    if (missing.size) report.sourceIssues.push({ slug, missing: [...missing.values()] })
    for (const what of dropped) report.dropped.push({ slug, what })
  }
  return report
}

/**
 * So từng trang giữa global và `pages`, không ghi gì: bản đăng của global với bản đăng của trang,
 * nháp mới nhất của global với nháp mới nhất của trang.
 */
export async function checkPages(payload: Payload): Promise<PageDiff[]> {
  const published = await readGlobal(payload, false)
  const latest = await readGlobal(payload, true)
  const isPublished = published._status === 'published'
  const diffs: PageDiff[] = []

  for (const slug of ROUTE_KEYS) {
    // Trường của global không có chỗ trong Trang: phép so bên dưới không thấy được nên báo riêng.
    if (isPublished) {
      for (const field of unknownKeys(groupOf(published, slug), slug)) {
        diffs.push({ slug, state: 'published', reason: 'unknown-field', field })
      }
    }
    for (const field of unknownKeys(groupOf(latest, slug), slug)) {
      diffs.push({ slug, state: 'draft', reason: 'unknown-field', field })
    }

    const existing = await findPage(payload, slug)
    if (!existing) {
      if (isPublished) diffs.push({ slug, state: 'published', reason: 'missing' })
      diffs.push({ slug, state: 'draft', reason: 'missing' })
      continue
    }

    const live = await readPage(payload, existing.id, false)
    const livePublished = live._status === 'published'
    if (isPublished && !livePublished) {
      diffs.push({ slug, state: 'published', reason: 'missing' })
    } else if (isPublished !== livePublished ||
      (isPublished && !samePageContent(pageFromGlobal(groupOf(published, slug), slug), pageFromGlobal(live, slug)))) {
      diffs.push({ slug, state: 'published', reason: 'different' })
    }

    const draft = await readPage(payload, existing.id, true)
    if (!samePageContent(pageFromGlobal(groupOf(latest, slug), slug), pageFromGlobal(draft, slug))) {
      diffs.push({ slug, state: 'draft', reason: 'different' })
    }
  }
  return diffs
}

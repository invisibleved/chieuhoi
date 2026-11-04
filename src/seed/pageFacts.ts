// Nhập dữ kiện trang Làng Hới và Nghề dệt chiếu vào collection `pages` (mỗi trang một tài liệu).
// Dùng chung cho `npm run seed` và lệnh nhập riêng ở production (spec, mục Chuyển tiếp):
// chỉ tạo nguồn còn thiếu, chỉ điền nhóm đang trống, không bao giờ tạo người/sản phẩm/bài/ảnh/mốc.
import { readFileSync } from 'fs'
import path from 'path'
import type { Payload, TypedUser } from 'payload'

import { ROUTE_KEYS, ROUTE_LABELS, type RouteKey } from '@/collections/pages/routeKeys'

import { craftFactsSeed, PAGE_FACT_SOURCE_IDS, villageFactsSeed } from './data/pageFacts'

/** Một trang đã được ghi: các nhóm/trường đã điền (không kèm tên trang) và cách lưu. */
export type PageSave = {
  slug: RouteKey
  filled: string[]
  saved: 'published' | 'draft'
  /** Có khi trang đang có bản nháp chờ duyệt: chỉ lưu nháp. */
  warning?: string
}

export type ImportReport = {
  sourcesCreated: string[]
  sourcesSkipped: string[]
  /** Mọi nhóm đã điền, dạng `<trang>.<nhóm>`. */
  filled: string[]
  skipped: { group: string; reason: string }[]
  /** Chỉ các trang có ghi. Trống khi không có gì để nhập. */
  pages: PageSave[]
}

type Rec = Record<string, unknown>
const SOURCE_KEYS = new Set(['sources', 'pageSources'])

/** Đổi mọi sourceId (chuỗi) trong các mảng `sources`/`pageSources` bằng `fn`, trả bản sao. */
export function mapSourceRefs(v: unknown, fn: (sourceId: string) => unknown): unknown {
  if (Array.isArray(v)) return v.map((x) => mapSourceRefs(x, fn))
  if (!v || typeof v !== 'object') return v
  return Object.fromEntries(
    Object.entries(v as Rec).map(([k, x]) => [
      k,
      SOURCE_KEYS.has(k) && Array.isArray(x) ? x.map((s) => (typeof s === 'string' ? fn(s) : s)) : mapSourceRefs(x, fn),
    ]),
  )
}

/** Trống khi mọi chuỗi trống/null và mọi mảng rỗng. Checkbox và `id` của dòng không tính. */
export function isEmptyGroup(v: unknown): boolean {
  if (v === null || v === undefined || typeof v === 'boolean') return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') {
    return Object.entries(v as Rec).every(([k, x]) => k === 'id' || isEmptyGroup(x))
  }
  return false
}

const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Bản trống cùng khung với `v`: mảng thành `[]`, chuỗi/số/checkbox thành `null`, bỏ `id`. */
const blankLike = (v: unknown): unknown => {
  if (Array.isArray(v)) return []
  if (!isRec(v)) return null
  return Object.fromEntries(Object.entries(v).filter(([k]) => k !== 'id').map(([k, x]) => [k, blankLike(x)]))
}

const overlay = (base: unknown, top: unknown): unknown => {
  if (!isRec(base) || !isRec(top)) return top
  const out: Rec = { ...base }
  for (const [k, x] of Object.entries(top)) out[k] = overlay(base[k], x)
  return out
}

/**
 * Giá trị ghi cho một nhóm: dữ liệu seed, cộng các khoá của nhóm cũ mà seed không có được đặt về trống.
 * Payload gộp nhóm (group) theo khoá với bản cũ, nên thiếu khoá thì giá trị cũ (vd. `sources`) còn lại.
 */
const replaceGroup = (existing: unknown, value: unknown): unknown => overlay(blankLike(existing), value)

const ROUTE_GROUPS = {
  'lang-hoi': villageFactsSeed,
  'nghe-det-chieu': craftFactsSeed,
} as const satisfies Record<string, object>

type Route = keyof typeof ROUTE_GROUPS

type SourceJson = { id: string; publisher?: string; title: string; url?: string; date?: string }

export type SourceReport = { sourcesCreated: string[]; sourcesSkipped: string[] }

/** Tạo các nguồn trong `wanted` còn thiếu (lấy từ content/seed/sources.json), không sửa nguồn đã có. */
export async function ensureSources(
  payload: Payload,
  wanted: readonly string[],
  user: TypedUser | undefined,
  report: SourceReport,
): Promise<Record<string, number>> {
  const ids: Record<string, number> = {}
  const found = await payload.find({
    collection: 'sources',
    where: { sourceId: { in: [...wanted] } },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  for (const d of found.docs) ids[d.sourceId] = d.id
  const json = JSON.parse(
    readFileSync(path.resolve(process.cwd(), 'content/seed/sources.json'), 'utf8'),
  ) as SourceJson[]
  for (const id of wanted) {
    if (ids[id] !== undefined) {
      report.sourcesSkipped.push(id)
      continue
    }
    const s = json.find((x) => x.id === id)
    if (!s) throw new Error(`content/seed/sources.json thiếu nguồn ${id}.`)
    const doc = await payload.create({
      collection: 'sources',
      data: { sourceId: s.id, publisher: s.publisher, title: s.title, url: s.url, date: s.date },
      overrideAccess: true,
      user,
    })
    ids[id] = doc.id
    report.sourcesCreated.push(id)
  }
  return ids
}

/** Tên trang trong lời báo, vd. "Trang Làng Hới"; "Trang chủ" giữ nguyên (không thành "Trang Trang chủ"). */
export const pageLabel = (slug: RouteKey) =>
  ROUTE_LABELS[slug].startsWith('Trang') ? ROUTE_LABELS[slug] : `Trang ${ROUTE_LABELS[slug]}`

/**
 * Tạo các trang còn thiếu trong `pages` (dạng nháp, chỉ có `slug`), trả `slug` vừa tạo.
 * `wipe`/`resetDb` xoá cả `pages`, nên seed và lệnh nhập luôn gọi hàm này trước khi ghi.
 */
export async function ensurePages(payload: Payload): Promise<RouteKey[]> {
  const { docs } = await payload.find({
    collection: 'pages', pagination: false, depth: 0, overrideAccess: true, select: { slug: true },
  })
  const existing = new Set(docs.map((d) => d.slug))
  const created: RouteKey[] = []
  for (const slug of ROUTE_KEYS) {
    if (existing.has(slug)) continue
    await payload.create({
      collection: 'pages',
      data: { slug } as never,
      draft: true,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    created.push(slug)
  }
  return created
}

/** Bản nháp mới nhất của trang `slug` (cả trường đã đăng nếu chưa có nháp mới hơn), quan hệ ở dạng id. */
export async function readPageDraft(payload: Payload, slug: RouteKey): Promise<Rec> {
  const { docs } = await payload.find({
    collection: 'pages', where: { slug: { equals: slug } }, draft: true, limit: 1, depth: 0, overrideAccess: true,
  })
  if (!docs[0]) throw new Error(`Chưa có trang ${slug}.`)
  return docs[0] as unknown as Rec
}

/**
 * Ghi `data` vào trang `slug`: lưu nháp (bản đã đăng giữ nguyên) hoặc đăng (cần người duyệt `user`).
 * Payload gộp `data` với nháp mới nhất, nên các trường khác của trang không mất.
 */
export async function savePage(
  payload: Payload,
  slug: RouteKey,
  data: Rec,
  opts: { publish: boolean; user?: TypedUser; context?: Record<string, unknown> },
): Promise<void> {
  if (opts.publish && !opts.user) throw new Error(`Cần người duyệt (user) để đăng ${pageLabel(slug)}.`)
  const res = await payload.update({
    collection: 'pages',
    where: { slug: { equals: slug } },
    data: { ...data, _status: opts.publish ? 'published' : 'draft' } as never,
    draft: !opts.publish,
    overrideAccess: true,
    user: opts.user,
    context: { disableRevalidate: true, ...opts.context },
  })
  if (res.errors.length) {
    throw new Error(`Không lưu được ${pageLabel(slug)}: ${res.errors.map((e) => e.message).join('; ')}`)
  }
  if (res.docs.length !== 1) throw new Error(`Không tìm thấy ${pageLabel(slug)}.`)
}

/**
 * Có bản nháp chưa được đăng không.
 * Đã kiểm với Payload 3.92 (drafts bật): mỗi lần lưu, kể cả đăng, tạo một version mang `_status`
 * của lần lưu đó, và version mới nhất có `latest: true`. Lưu nháp → version mới nhất `draft`, bản
 * chính vẫn `published`; đăng → version mới nhất `published`. So nội dung bản nháp với bản đăng
 * không chắc: hai bản giống nhau vẫn khác `updatedAt`/id dòng.
 * Khi bản chính chưa đăng hoặc đã gỡ đăng, version mới nhất cũng là `draft`: coi là nháp chờ duyệt
 * (không đăng thay người duyệt nội dung chưa ai duyệt). Trang vừa được `ensurePages` tạo trong lần
 * chạy này thì người gọi tự bỏ qua. Trang chưa có thì không có nháp.
 * Test int "keeps pending draft and only fills empty groups" kiểm cách này.
 */
export async function hasPendingDraft(
  payload: Payload,
  target: { collection: 'pages'; slug: RouteKey } | { global: 'site-settings' },
): Promise<boolean> {
  type Latest = { version?: { _status?: string | null } } | undefined
  if ('global' in target) {
    const res = await payload.findGlobalVersions({
      slug: target.global, sort: '-updatedAt', limit: 1, depth: 0, overrideAccess: true,
    })
    return (res.docs[0] as Latest)?.version?._status === 'draft'
  }
  const { docs } = await payload.find({
    collection: 'pages', where: { slug: { equals: target.slug } }, limit: 1, depth: 0, overrideAccess: true,
    select: { slug: true },
  })
  if (!docs[0]) return false
  const res = await payload.findVersions({
    collection: 'pages',
    where: { and: [{ parent: { equals: docs[0].id } }, { latest: { equals: true } }] },
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return (res.docs[0] as Latest)?.version?._status === 'draft'
}

/** Lời báo khi trang hoặc global đang có bản nháp chờ duyệt, `label` là tên trong admin. */
export const pendingDraftWarning = (label: string) =>
  `${label} đang có bản nháp chưa đăng: chỉ lưu nháp, người duyệt cần đăng trong /admin.`

export type PageFactsFill = {
  /** Theo trang: chỉ các nhóm cần điền (đã đổi sourceId sang id), chưa gộp với ô cũ. */
  fill: Partial<Record<Route, Rec>>
  filled: string[]
  skipped: { group: string; reason: string }[]
}

/** Tính các nhóm dữ kiện trang cần điền trên bản `current` (nháp mới nhất của từng trang, theo slug). */
export function pageFactsFill(
  current: Partial<Record<string, Rec | undefined>>,
  toId: (sourceId: string) => number,
  force = false,
): PageFactsFill {
  const out: PageFactsFill = { fill: {}, filled: [], skipped: [] }
  for (const route of Object.keys(ROUTE_GROUPS) as Route[]) {
    const seedGroups = ROUTE_GROUPS[route] as Rec
    const existing = current[route] ?? {}
    const fill: Rec = {}
    for (const [name, value] of Object.entries(seedGroups)) {
      const group = `${route}.${name}`
      if (!force && isEmptyGroup(value)) {
        // Seed không có gì để điền (vd. nguồn trang Nghề dệt): ghi [] lên [] chỉ tạo version thừa.
        out.skipped.push({ group, reason: 'seed không có dữ liệu' })
      } else if (force || isEmptyGroup(existing[name])) {
        // Bọc theo tên nhóm để `pageSources` (mảng chuỗi ở ngay gốc nhóm) cũng được đổi.
        fill[name] = replaceGroup(existing[name], (mapSourceRefs({ [name]: value }, toId) as Rec)[name])
        out.filled.push(group)
      } else {
        out.skipped.push({ group, reason: 'đã có dữ liệu' })
      }
    }
    if (Object.keys(fill).length) out.fill[route] = fill
  }
  return out
}

/**
 * Điền các nhóm dữ kiện còn trống của trang Làng Hới và Nghề dệt chiếu, mỗi trang một lần lưu.
 * `publish: 'when-no-draft'` (seed) đăng trang khi trang không có nháp chờ duyệt; `'never'` chỉ lưu nháp.
 * `toolImages`: id ảnh của từng dòng dụng cụ, gắn vào khi điền nhóm `tools`.
 */
export async function importPageFacts(
  payload: Payload,
  opts: { publish: 'never' | 'when-no-draft'; force?: boolean; user?: TypedUser; toolImages?: (number | null)[] },
): Promise<ImportReport> {
  const { publish, force = false, user, toolImages } = opts
  const report: ImportReport = { sourcesCreated: [], sourcesSkipped: [], filled: [], skipped: [], pages: [] }
  const sourceIds = await ensureSources(payload, PAGE_FACT_SOURCE_IDS, user, report)
  const toId = (sourceId: string) => {
    const id = sourceIds[sourceId]
    if (id === undefined) throw new Error(`Không có nguồn ${sourceId}.`)
    return id
  }

  const created = await ensurePages(payload)
  const routes = Object.keys(ROUTE_GROUPS) as Route[]
  const current: Partial<Record<Route, Rec>> = {}
  for (const route of routes) current[route] = await readPageDraft(payload, route)

  const facts = pageFactsFill(current, toId, force)
  report.filled.push(...facts.filled)
  report.skipped.push(...facts.skipped)

  for (const route of routes) {
    const fill = facts.fill[route]
    if (!fill) continue
    if (toolImages && Array.isArray(fill.tools)) {
      fill.tools = (fill.tools as Rec[]).map((t, i) => ({ ...t, image: toolImages[i] ?? null }))
    }
    const pending = publish === 'when-no-draft' && !created.includes(route) &&
      (await hasPendingDraft(payload, { collection: 'pages', slug: route }))
    const doPublish = publish === 'when-no-draft' && !pending
    await savePage(payload, route, fill, { publish: doPublish, user })
    report.pages.push({
      slug: route,
      filled: Object.keys(fill),
      saved: doPublish ? 'published' : 'draft',
      ...(pending ? { warning: pendingDraftWarning(pageLabel(route)) } : {}),
    })
  }
  return report
}

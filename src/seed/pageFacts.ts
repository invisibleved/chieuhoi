// Nhập dữ kiện trang Làng Hới và Nghề dệt chiếu vào global `page-intros`.
// Dùng chung cho `npm run seed` và lệnh nhập riêng ở production (spec, mục Chuyển tiếp):
// chỉ tạo nguồn còn thiếu, chỉ điền nhóm đang trống, không bao giờ tạo người/sản phẩm/bài/ảnh/mốc.
import { readFileSync } from 'fs'
import path from 'path'
import type { Payload, TypedUser } from 'payload'

import { craftFactsSeed, PAGE_FACT_SOURCE_IDS, villageFactsSeed } from './data/pageFacts'

export type ImportReport = {
  sourcesCreated: string[]
  sourcesSkipped: string[]
  filled: string[]
  skipped: { group: string; reason: string }[]
  saved: 'published' | 'draft' | 'none'
  /** Có khi buộc phải lưu nháp dù được phép đăng (đang có bản nháp chờ duyệt). */
  warning?: string
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

/**
 * Có bản nháp chưa được đăng không.
 * Đã kiểm với Payload 3.92 (drafts bật): mỗi lần lưu, kể cả đăng, tạo một version mang `_status`
 * của lần lưu đó, và version mới nhất có `latest: true`. Lưu nháp → version mới nhất `draft`, bản
 * chính vẫn `published`; đăng → version mới nhất `published`. So nội dung `findGlobal({ draft: true })`
 * với `draft: false` không chắc: hai bản giống nhau vẫn khác `updatedAt`/id dòng.
 * Khi bản chính chưa đăng hoặc đã gỡ đăng, version mới nhất cũng là `draft`: coi là nháp chờ duyệt
 * (không đăng thay người duyệt nội dung chưa ai duyệt). Seed đăng global trước khi gọi hàm này.
 * Test int "keeps pending draft and only fills empty groups" kiểm cách này.
 */
export async function hasPendingDraft(payload: Payload, slug: 'page-intros' | 'site-settings'): Promise<boolean> {
  const res = await payload.findGlobalVersions({
    slug,
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const latest = res.docs[0] as { version?: { _status?: string | null } } | undefined
  return latest?.version?._status === 'draft'
}

/** Lời báo khi global đang có bản nháp chờ duyệt, `label` là tên global trong admin. */
export const pendingDraftWarning = (label: string) =>
  `${label} đang có bản nháp chưa đăng: chỉ lưu nháp, người duyệt cần đăng trong /admin.`

export type PageFactsFill = {
  /** Theo route: chỉ các nhóm cần điền (đã đổi sourceId sang id), chưa gộp với ô cũ. */
  fill: Partial<Record<Route, Rec>>
  filled: string[]
  skipped: { group: string; reason: string }[]
}

/** Tính các nhóm dữ kiện trang cần điền trên bản `current` (bản mới nhất của `page-intros`). */
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
        fill[name] = (mapSourceRefs({ [name]: value }, toId) as Rec)[name]
        out.filled.push(group)
      } else {
        out.skipped.push({ group, reason: 'đã có dữ liệu' })
      }
    }
    if (Object.keys(fill).length) out.fill[route] = fill
  }
  return out
}

export async function importPageFacts(
  payload: Payload,
  opts: { publish: 'never' | 'when-no-draft'; force?: boolean; user?: TypedUser },
): Promise<ImportReport> {
  const { publish, force = false, user } = opts
  const report: ImportReport = { sourcesCreated: [], sourcesSkipped: [], filled: [], skipped: [], saved: 'none' }
  const sourceIds = await ensureSources(payload, PAGE_FACT_SOURCE_IDS, user, report)
  const toId = (sourceId: string) => {
    const id = sourceIds[sourceId]
    if (id === undefined) throw new Error(`Không có nguồn ${sourceId}.`)
    return id
  }

  const current = (await payload.findGlobal({
    slug: 'page-intros', draft: true, depth: 0, overrideAccess: true,
  })) as unknown as Record<Route, Rec | undefined>

  const facts = pageFactsFill(current, toId, force)
  report.filled.push(...facts.filled)
  report.skipped.push(...facts.skipped)
  const data: Rec = {}
  for (const [route, fill] of Object.entries(facts.fill)) {
    // Ghi cả đối tượng route để không mất ô cũ (tiêu đề, đoạn dẫn, ảnh…).
    data[route] = { ...(current[route as Route] ?? {}), ...fill }
  }

  if (!Object.keys(data).length) return report

  const pending = publish === 'when-no-draft' && (await hasPendingDraft(payload, 'page-intros'))
  if (publish === 'never' || pending) {
    if (pending) {
      report.warning = pendingDraftWarning('Phần mở đầu trang')
    }
    await payload.updateGlobal({
      slug: 'page-intros',
      data: { ...data, _status: 'draft' } as never,
      draft: true,
      overrideAccess: true,
      user,
    })
    report.saved = 'draft'
    return report
  }

  if (!user) throw new Error('Cần người duyệt (user) để đăng Phần mở đầu trang.')
  await payload.updateGlobal({
    slug: 'page-intros',
    data: { ...data, _status: 'published' } as never,
    overrideAccess: true,
    user,
  })
  report.saved = 'published'
  return report
}

import type { Field, Validate } from 'payload'

import { pageSourcesField } from '@/globals/pageFacts'
import { PAGE_ONLY_FIELDS } from './fields'
import type { RouteKey } from './routeKeys'

export type MissingSource = { where: string; sourceIds: number[] }

type Obj = Record<string, unknown>

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])

/** Id số của một nguồn: số, chuỗi số hoặc đối tượng đã nạp `{ id }`. */
const idOf = (v: unknown): number | null => {
  const raw = isObj(v) ? v.id : v
  const n = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : raw
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

const idsOf = (v: unknown): number[] => arr(v).map(idOf).filter((n): n is number => n !== null)

/** Mọi nguồn được trích trong các ô dữ kiện của trang mà chưa có trong `pageSources`. */
export const missingPageSources = (page: Record<string, unknown>): MissingSource[] => {
  const listed = new Set(idsOf(page.pageSources))
  const out: MissingSource[] = []
  const check = (where: string, item: unknown) => {
    if (!isObj(item)) return
    const missing = [...new Set(idsOf(item.sources))].filter((id) => !listed.has(id))
    if (missing.length) out.push({ where, sourceIds: missing })
  }

  arr(page.facts).forEach((r) => check(`Bảng thông tin đầu trang, dòng "${isObj(r) ? String(r.term ?? '') : ''}"`, r))

  const founder = isObj(page.founder) ? page.founder : {}
  arr(founder.paragraphs).forEach((p, i) =>
    arr(isObj(p) ? p.sentences : []).forEach((s, j) => check(`Tổ nghề, đoạn ${i + 1}, câu ${j + 1}`, s)),
  )
  arr(founder.conflict).forEach((s, i) => check(`Hộp Các nguồn chưa thống nhất, câu ${i + 1}`, s))

  check('Vị trí', page.location)
  const heritage = isObj(page.heritage) ? page.heritage : {}
  arr(heritage.sentences).forEach((s, i) => check(`Di sản hôm nay, câu ${i + 1}`, s))

  arr(page.tools).forEach((t) => {
    if (isObj(t)) check(`Dụng cụ "${String(t.name ?? '')}"`, t.note)
  })
  for (const [key, label] of [['hand', 'Thẻ Dệt thủ công'], ['machine', 'Thẻ Dệt bằng máy']] as const) {
    const card = isObj(page[key]) ? page[key] : {}
    check(label, card.text)
    check(label, card.note)
  }
  arr(page.compareRows).forEach((r) => check(`Bảng so sánh, hàng "${isObj(r) ? String(r.aspect ?? '') : ''}"`, r))

  return out
}

/** Chỉ giữ trường thuộc trang đang lưu: trường của trang khác sắp bị xoá, không tính. */
const ownFields = (data: Obj): Obj => {
  const slug = data.slug
  if (typeof slug !== 'string' || !Object.hasOwn(PAGE_ONLY_FIELDS, slug)) return data
  const own = PAGE_ONLY_FIELDS[slug as RouteKey]
  return Object.fromEntries(Object.entries(data).filter(([k]) => own.includes(k)))
}

/** `validate` của `pageSources` trong collection `pages`: chặn đăng trang có câu trích nguồn ngoài danh sách. */
const validatePageSources: Validate = async (
  value, { data, req },
) => {
  if (req?.context?.skipPageSourcesCheck) return true
  const page = { ...ownFields(isObj(data) ? data : {}), pageSources: value }
  const missing = missingPageSources(page)
  if (!missing.length) return true

  const ids = [...new Set(missing.flatMap((m) => m.sourceIds))]
  const codes = new Map<number, string>()
  try {
    const { docs } = await req.payload.find({
      collection: 'sources', where: { id: { in: ids } }, limit: ids.length, depth: 0, pagination: false, req,
    })
    for (const d of docs as { id: number; sourceId?: string | null }[]) if (d.sourceId) codes.set(d.id, d.sourceId)
  } catch {
    // Không đọc được mã thì dùng id số.
  }
  const label = (id: number) => codes.get(id) ?? String(id)
  return missing
    .map((m) => `Chưa có trong Nguồn tham khảo của trang: ${m.where} (${m.sourceIds.map(label).join(', ')})`)
    .join('; ')
}

/** `pageSources` của collection `pages`: như của global nhưng có kiểm khi đăng. */
export const pagePageSourcesField = (): Field => ({
  ...pageSourcesField(),
  validate: validatePageSources,
} as Field)

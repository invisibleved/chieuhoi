import { APIError, type CollectionBeforeDeleteHook, type Payload } from 'payload'

/** Collection có thể trích Nguồn. Thêm slug mới vào đây (ví dụ `pages`). */
export const SOURCE_CITING_COLLECTIONS = ['timeline-events', 'stories', 'products', 'people'] as const
/** Global có thể trích Nguồn. */
export const SOURCE_CITING_GLOBALS = ['page-intros'] as const

const SOURCE_KEYS = new Set(['sources', 'pageSources', 'source', 'quoteSource'])

export type SourceRef = { collection: string; id: number | string | null; label: string }

const asSourceId = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isInteger(v)) return v
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const id = (v as { id?: unknown }).id
    if (typeof id === 'number' && Number.isInteger(id)) return id
  }
  return null
}

/** Mọi id Nguồn được trích trong một tài liệu (kể cả văn bản Lexical có khối `cite`). */
export function citedSourceIds(value: unknown): Set<number> {
  const out = new Set<number>()
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    if (!node || typeof node !== 'object') return
    for (const [key, child] of Object.entries(node as Record<string, unknown>)) {
      if (SOURCE_KEYS.has(key)) {
        const items = Array.isArray(child) ? child : [child]
        for (const item of items) {
          const id = asSourceId(item)
          if (id !== null) out.add(id)
        }
      }
      walk(child)
    }
  }
  walk(value)
  return out
}

const itemLabel = (doc: Record<string, unknown>): string => {
  for (const key of ['title', 'name', 'label', 'slug'] as const) {
    const v = doc[key]
    if (typeof v === 'string' && v.trim()) return v
  }
  return String(doc.id ?? '')
}

const labelOf = (l: unknown): string | undefined => {
  if (typeof l === 'string') return l
  return undefined
}

/** Các tài liệu (bản đăng và bản nháp) đang trích Nguồn có id `sourceId`. */
export async function findSourceRefs(payload: Payload, sourceId: number): Promise<SourceRef[]> {
  const refs: SourceRef[] = []
  const seen = new Set<string>()
  const add = (collection: string, id: number | string | null, label: string) => {
    const key = `${collection}:${id}`
    if (seen.has(key)) return
    seen.add(key)
    refs.push({ collection, id, label })
  }

  for (const slug of SOURCE_CITING_COLLECTIONS) {
    const cfg = payload.collections[slug as keyof typeof payload.collections]?.config
    const collectionLabel = labelOf(cfg?.labels?.singular) ?? labelOf(cfg?.labels?.plural) ?? slug
    for (const draft of [false, true]) {
      const { docs } = await payload.find({
        collection: slug,
        draft,
        depth: 0,
        overrideAccess: true,
        pagination: false,
      })
      for (const doc of docs as unknown as Record<string, unknown>[]) {
        if (citedSourceIds(doc).has(sourceId)) {
          add(slug, (doc.id as number | string | undefined) ?? null, `${collectionLabel}: ${itemLabel(doc)}`)
        }
      }
    }
  }

  for (const slug of SOURCE_CITING_GLOBALS) {
    const cfg = payload.globals.config.find((g) => g.slug === slug)
    const globalLabel = labelOf(cfg?.label) ?? slug
    for (const draft of [false, true]) {
      const doc = (await payload.findGlobal({ slug, draft, depth: 0, overrideAccess: true })) as unknown as Record<
        string,
        unknown
      >
      if (citedSourceIds(doc).has(sourceId)) add(slug, null, `${globalLabel}: ${globalLabel}`)
    }
  }
  return refs
}

export const blockCitedSourceDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (req.context?.skipSourceRefGuard === true) return
  const sourceId = Number(id)
  const refs = await findSourceRefs(req.payload, sourceId)
  if (refs.length === 0) return
  const found = await req.payload.findByID({ collection: 'sources', id, depth: 0, overrideAccess: true })
  const name = found?.sourceId ?? String(id)
  throw new APIError(
    `Không xoá được nguồn "${name}" vì đang được trích ở: ${refs.map((r) => r.label).join('; ')}.`,
    400,
  )
}

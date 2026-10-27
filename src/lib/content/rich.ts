/**
 * Lọc cây Lexical theo danh sách cho phép: chỉ giữ nút chữ/cấu trúc đã biết.
 * Mọi nút khác (upload, relationship, khối lạ...) bị bỏ cùng con của nó.
 * - Khối cite thành `{ type: 'cite', n }`, đánh số theo lần trích đầu tiên (R4); cite tới nguồn không
 *   còn nhìn thấy bị bỏ. Ở public, đoạn có cite mà mọi cite đều bị bỏ thì bỏ cả đoạn.
 * - Khối figure thành `{ type: 'figure', image, caption }` (R3); ảnh không dùng được ở mode này thì bỏ cả khối.
 * - Heading h2 có `anchor` (slug không dấu, trùng thì thêm -2, -3) và vào mục lục (R5).
 * Liên kết nội bộ mất đích, chỉ giữ chữ; liên kết ngoài giữ url.
 */
import { slugify } from '@/lib/slugify'

import type { ImageView, Mode, Rich, RichNode } from './types'
import { isUnverified, showText } from './visibility'

type Node = RichNode

export type RichContext = {
  /** id Payload của nguồn -> sourceId; nguồn đã xoá không có trong map. */
  sources: Map<number, string>
  /** sourceId nhìn thấy được ở mode hiện tại. */
  visibleSourceIds: string[]
  /** id asset -> ImageView đã áp mode (null: ảnh không được dùng ở mode này). */
  assets: Map<number, ImageView | null>
  mode: Mode
  /** Gắn anchor cho h2 và dựng mục lục; mặc định true. */
  anchors?: boolean
}

export type RichResult = { rich: Rich | null; citedOrder: string[]; toc: { id: string; title: string }[] }

const KEEP = new Set([
  'root', 'paragraph', 'text', 'heading', 'list', 'listitem', 'quote', 'linebreak', 'tab', 'horizontalrule',
])
/** Khối chữ bị bỏ ở public khi mọi cite của nó đều mất (R4). */
const CITING_BLOCKS = new Set(['paragraph', 'listitem', 'quote'])
const STRUCT_KEYS = ['type', 'version', 'direction', 'format', 'indent', 'text', 'detail', 'mode', 'style',
  'tag', 'listType', 'start', 'value', 'checked', 'textFormat', 'textStyle'] as const

function pick(obj: Node): Node {
  const out: Node = {}
  for (const k of STRUCT_KEYS) if (k in obj) out[k] = obj[k]
  return out
}

/** id của quan hệ ở depth 0 (số) hoặc depth > 0 (object có id). */
const relId = (v: unknown): number | undefined =>
  typeof v === 'number' ? v : v && typeof v === 'object' && typeof (v as { id?: unknown }).id === 'number'
    ? (v as { id: number }).id : undefined

/** Nối mọi nút chữ trong cây để dò dấu [cần xác minh] hoặc lấy chữ của heading. */
function collectText(obj: unknown): string {
  if (!obj || typeof obj !== 'object') return ''
  const n = obj as Node
  const own = n.type === 'text' && typeof n.text === 'string' ? n.text : ''
  const kids = Array.isArray(n.children) ? (n.children as unknown[]).map(collectText).join('') : ''
  return own + kids
}

export function sanitizeRich(node: unknown, ctx: RichContext): RichResult {
  const empty: RichResult = { rich: null, citedOrder: [], toc: [] }
  if (!node || typeof node !== 'object') return empty
  const root = (node as Node).root
  if (!root || typeof root !== 'object') return empty
  const { mode } = ctx
  // Trường chứa dấu [cần xác minh] thì ẩn cả trường ở public (spec mục 5).
  const text = collectText(root)
  if (mode === 'public' && text.trim() !== '' && isUnverified(text)) return empty

  const visible = new Set(ctx.visibleSourceIds)
  const citedOrder: string[] = []
  const toc: RichResult['toc'] = []
  const used = new Map<string, number>()
  const anchors = ctx.anchors ?? true

  /** Trả về các nút thay thế và số cite gặp/giữ trong cây con (để bỏ đoạn mất hết cite). */
  function walk(obj: Node): { nodes: Node[]; seen: number; kept: number } {
    const type = obj.type
    let seen = 0
    let kept = 0
    const children = Array.isArray(obj.children)
      ? (obj.children as Node[]).flatMap((c) => {
          if (!c || typeof c !== 'object') return []
          const r = walk(c)
          seen += r.seen
          kept += r.kept
          return r.nodes
        })
      : undefined

    if (type === 'inlineBlock') {
      const fields = obj.fields as Node | undefined
      if (fields?.blockType !== 'cite') return { nodes: [], seen: 0, kept: 0 }
      const id = relId(fields.source)
      const sourceId = id !== undefined ? ctx.sources.get(id) : undefined
      if (!sourceId || !visible.has(sourceId)) return { nodes: [], seen: 1, kept: 0 }
      if (!citedOrder.includes(sourceId)) citedOrder.push(sourceId)
      return { nodes: [{ type: 'cite', n: citedOrder.indexOf(sourceId) + 1 }], seen: 1, kept: 1 }
    }
    if (type === 'block') {
      const fields = obj.fields as Node | undefined
      if (fields?.blockType !== 'figure') return { nodes: [], seen, kept }
      const id = relId(fields.image)
      const image = id !== undefined ? ctx.assets.get(id) : undefined
      if (!image) return { nodes: [], seen, kept }
      const caption = showText(typeof fields.caption === 'string' ? fields.caption : null, mode)
      return { nodes: [{ type: 'figure', image, caption }], seen, kept }
    }
    if (type === 'link' || type === 'autolink') {
      const fields = obj.fields as Node | undefined
      const url = typeof fields?.url === 'string' ? fields.url : null
      if (fields?.linkType === 'custom' && url && /^(https?:|mailto:|tel:)/i.test(url)) {
        return { nodes: [{ ...pick(obj), type, fields: { linkType: 'custom', url, newTab: !!fields.newTab }, children }], seen, kept }
      }
      return { nodes: children ?? [], seen, kept } // mất đích, giữ chữ
    }
    if (typeof type === 'string' && KEEP.has(type)) {
      if (mode === 'public' && CITING_BLOCKS.has(type) && seen > 0 && kept === 0) {
        return { nodes: [], seen, kept }
      }
      const out: Node = children ? { ...pick(obj), children } : pick(obj)
      if (anchors && type === 'heading' && obj.tag === 'h2') {
        const title = collectText(out).trim()
        const base = slugify(title) || 'muc'
        const count = (used.get(base) ?? 0) + 1
        used.set(base, count)
        const anchor = count === 1 ? base : `${base}-${count}`
        out.anchor = anchor
        toc.push({ id: anchor, title })
      }
      return { nodes: [out], seen, kept }
    }
    return { nodes: [], seen, kept }
  }

  const out = walk(root as Node).nodes[0]
  return out ? { rich: { root: out }, citedOrder, toc } : empty
}

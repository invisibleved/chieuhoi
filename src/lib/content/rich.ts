/**
 * Lọc cây Lexical theo danh sách cho phép: chỉ giữ nút chữ/cấu trúc đã biết.
 * Mọi nút khác (upload, relationship, khối lạ...) bị bỏ cùng con của nó.
 * Khối cite chỉ còn sourceId. Liên kết nội bộ mất đích, chỉ giữ chữ; liên kết ngoài giữ url.
 */
type Node = Record<string, unknown>

const KEEP = new Set([
  'root', 'paragraph', 'text', 'heading', 'list', 'listitem', 'quote', 'linebreak', 'tab', 'horizontalrule',
])
const STRUCT_KEYS = ['type', 'version', 'direction', 'format', 'indent', 'text', 'detail', 'mode', 'style',
  'tag', 'listType', 'start', 'value', 'checked', 'textFormat', 'textStyle'] as const

function pick(obj: Node): Node {
  const out: Node = {}
  for (const k of STRUCT_KEYS) if (k in obj) out[k] = obj[k]
  return out
}

function walk(obj: Node, sources: Map<number, string>): Node[] {
  const type = obj.type
  const children = Array.isArray(obj.children)
    ? (obj.children as Node[]).flatMap((c) => (c && typeof c === 'object' ? walk(c, sources) : []))
    : undefined

  if (type === 'inlineBlock') {
    const fields = obj.fields as Node | undefined
    if (fields?.blockType !== 'cite') return []
    const s = fields.source
    const sourceId =
      typeof s === 'object' && s !== null ? (s as { sourceId?: string }).sourceId
        : typeof s === 'number' ? sources.get(s) : undefined
    return [{ type: 'inlineBlock', version: obj.version, fields: { blockType: 'cite', sourceId: sourceId ?? null } }]
  }
  if (type === 'link' || type === 'autolink') {
    const fields = obj.fields as Node | undefined
    const url = typeof fields?.url === 'string' ? fields.url : null
    if (fields?.linkType === 'custom' && url && /^(https?:|mailto:|tel:)/i.test(url)) {
      return [{ ...pick(obj), type, fields: { linkType: 'custom', url, newTab: !!fields.newTab }, children }]
    }
    return children ?? [] // mất đích, giữ chữ
  }
  if (typeof type === 'string' && KEEP.has(type)) {
    return [children ? { ...pick(obj), children } : pick(obj)]
  }
  return []
}

export function sanitizeRich(node: unknown, sources: Map<number, string>): unknown {
  if (!node || typeof node !== 'object') return null
  const root = (node as Node).root
  if (!root || typeof root !== 'object') return null
  const out = walk(root as Node, sources)[0]
  return out ? { root: out } : null
}

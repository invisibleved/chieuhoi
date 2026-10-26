/** Duyệt cây Lexical: khối cite chỉ giữ sourceId, không lộ document nguồn. */
export function sanitizeRich(node: unknown, sources: Map<number, string>): unknown {
  if (node === null || node === undefined) return null
  if (Array.isArray(node)) return node.map((n) => sanitizeRich(n, sources))
  if (typeof node !== 'object') return node
  const obj = node as Record<string, unknown>
  const fields = obj.fields as Record<string, unknown> | undefined
  if (obj.type === 'inlineBlock' && fields?.blockType === 'cite') {
    const s = fields.source
    const sourceId =
      typeof s === 'object' && s !== null ? (s as { sourceId?: string }).sourceId
        : typeof s === 'number' ? sources.get(s) : undefined
    return { type: 'inlineBlock', version: obj.version, fields: { blockType: 'cite', sourceId: sourceId ?? null } }
  }
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, sanitizeRich(v, sources)]))
}

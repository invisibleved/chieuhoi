import type { SerializedEditorState } from 'lexical'

const TOKEN = /\[\[cite:([^\]]+)\]\]/g

type Node = Record<string, unknown> & { children?: Node[] }

/** Thay token `[[cite:<sourceId>]]` trong text node bằng inline block `cite`. */
export function injectCitations(
  root: SerializedEditorState,
  idBySourceId: Record<string, number>,
): SerializedEditorState {
  const walk = (node: Node): Node => {
    if (!Array.isArray(node.children)) return node
    const out: Node[] = []
    for (const child of node.children) {
      if (child.type !== 'text' || typeof child.text !== 'string' || !child.text.includes('[[cite:')) {
        out.push(walk(child))
        continue
      }
      const text = child.text
      let last = 0
      for (const m of text.matchAll(TOKEN)) {
        const id = idBySourceId[m[1]]
        if (id === undefined) throw new Error(`Không tìm thấy nguồn "${m[1]}" để chèn trích dẫn.`)
        if (m.index > last) out.push({ ...child, text: text.slice(last, m.index) })
        out.push({
          type: 'inlineBlock',
          version: 1,
          fields: { id: `cite-${m[1]}-${out.length}`, blockName: '', blockType: 'cite', source: id },
        })
        last = m.index + m[0].length
      }
      if (last < text.length) out.push({ ...child, text: text.slice(last) })
    }
    return { ...node, children: out }
  }
  const clone = structuredClone(root) as unknown as { root: Node }
  clone.root = walk(clone.root)
  return clone as unknown as SerializedEditorState
}

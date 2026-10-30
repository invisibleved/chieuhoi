// Hàm thuần ghép dữ kiện CMS của /lang-hoi vào khung chữ cố định và bảng thông tin.
import { applyMode } from './copy/applyMode'
import type { villageCopy } from './copy/village'
import type { VillageFacts } from './pageFacts'
import type { Mode } from './types'
import { showText } from './visibility'

/** Lấp dữ kiện từ CMS vào khung `villageCopy` (trước khi áp mode). */
export function mergeVillageCopy(copy: typeof villageCopy, f: VillageFacts) {
  return {
    ...copy,
    founder: {
      ...copy.founder,
      paragraphs: f.founder.paragraphs,
      conflict: { ...copy.founder.conflict, parts: f.founder.conflict.parts, preview: { closing: f.founder.conflict.closing } },
      noPortrait: f.founder.noPortrait,
    },
    location: { ...copy.location, body: f.location.body, preview: { ...copy.location.preview, note: f.location.note } },
    heritage: { ...copy.heritage, paragraphs: f.heritage.paragraphs, preview: { note: f.heritage.note } },
  }
}

/**
 * Hàng bảng thông tin: lọc nguồn bị ẩn, ghi chú biên tập nối sau "·" chỉ ở preview (R4).
 * Ở public bỏ hàng không có Mục, và hàng có nguồn mà mọi nguồn bị ẩn; hàng không có nguồn vẫn giữ.
 */
export function villageFactRows(facts: VillageFacts['facts'], mode: Mode, visible: ReadonlySet<string>) {
  const noteOf = (fact: VillageFacts['facts'][number], k: 'desktop' | 'mobile') => {
    const note = fact.note[k]
    return note && mode === 'preview' && fact.editorNote ? `${note} · ${fact.editorNote}` : note
  }
  return facts.flatMap((fact) => {
    const term = showText(fact.term, mode)
    if (term === null) return []
    const cite = fact.cite.filter((id) => visible.has(id))
    // Thông tin có nguồn mà mọi nguồn bị ẩn thì không hiện ở public.
    if (mode === 'public' && fact.cite.length > 0 && cite.length === 0) return []
    return [{
      term,
      detail: applyMode(fact.detail, mode),
      note: applyMode({ desktop: noteOf(fact, 'desktop'), mobile: noteOf(fact, 'mobile') }, mode),
      cite,
    }]
  })
}

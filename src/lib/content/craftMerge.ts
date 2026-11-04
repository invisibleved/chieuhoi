// Hàm thuần dựng dụng cụ, thẻ hai cách dệt và hàng bảng so sánh của /nghe-det-chieu từ dữ kiện CMS.
import type { ArchiveAsset } from '@/payload-types'

import { applyMode } from './copy/applyMode'
import { composeMobileLine, type CraftFacts, type Way } from './pageFacts'
import type { CraftPageView, ImageView, Mode } from './types'
import { isUnverified, showText, toImageView } from './visibility'

/**
 * Dụng cụ: tên qua luật hiển thị (public bỏ dụng cụ không có tên); ghi chú áp mode theo nguồn nhìn thấy.
 * Ảnh lấy từ chính dòng dụng cụ nên đi theo dòng khi biên tập viên đổi thứ tự.
 */
export function craftToolCards(
  tools: CraftFacts['tools'], mode: Mode, visible: ReadonlySet<string>,
): CraftPageView['tools'] {
  return tools.flatMap((t) => {
    const name = showText(t.name, mode)
    if (name === null) return []
    const m = applyMode({ note: t.note, cite: t.cite }, mode, { cites: visible })
    return [{ n: t.n, name, note: m.note, cite: m.cite, image: toImageView(t.image as ArchiveAsset | number | null | undefined, mode) }]
  })
}

/** Thẻ một cách dệt: mô tả và ghi chú áp mode riêng, nên mỗi câu ẩn độc lập khi mọi nguồn của nó bị ẩn. */
export function craftWayCard(
  c: Way, mode: Mode, visible: ReadonlySet<string>, image: ImageView | null,
): CraftPageView['compare']['hand'] {
  const opts = { cites: visible }
  const text = applyMode(c.text, mode, opts)
  const note = applyMode(c.note, mode, opts)
  return { title: showText(c.title, mode), image, text: text.text, textCite: text.cite, note: note.text, noteCite: note.cite }
}

/** Dòng điện thoại của một hàng. Dòng tự ghép ở public dựng lại từ các ô còn hiện; dòng biên tập viên viết lọc như ô chữ. */
function mobileLines(r: CraftFacts['rows'][number], mode: Mode, hand: string | null, machine: string | null) {
  if (r.mobileAuto && mode === 'public') return [{ text: composeMobileLine(hand, machine), muted: false }]
  return r.mobile
    .map((l) => ({ text: showText(l, mode), muted: isUnverified(l) }))
    .filter((l): l is { text: string; muted: boolean } => l.text !== null)
}

/** Bỏ hàng mà cả hai ô desktop bị ẩn hoặc không có Khía cạnh; lọc nguồn bị ẩn khỏi `cite`; đánh dấu ô còn chờ xác minh (muted). */
export function craftCompareRows(rows: CraftFacts['rows'], mode: Mode, visible: ReadonlySet<string>): CraftPageView['compare']['rows'] {
  const out: CraftPageView['compare']['rows'] = []
  for (const r of rows) {
    const aspect = showText(r.aspect, mode)
    if (aspect === null) continue
    const hand = showText(r.hand, mode)
    const machine = showText(r.machine, mode)
    if (hand === null && machine === null) continue
    const cite = r.cite.filter((id) => visible.has(id))
    // Dữ kiện có nguồn mà mọi nguồn bị ẩn thì không hiện ở public.
    if (mode === 'public' && r.cite.length > 0 && cite.length === 0) continue
    const lines = mobileLines(r, mode, hand, machine)
    out.push({
      aspect, hand, machine, mobile: lines.map((l) => l.text),
      muted: { hand: isUnverified(r.hand), machine: isUnverified(r.machine), mobile: lines.map((l) => l.muted) },
      cite,
    })
  }
  return out
}

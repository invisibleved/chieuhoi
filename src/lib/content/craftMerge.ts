// Hàm thuần dựng hàng bảng so sánh của /nghe-det-chieu từ dữ kiện CMS.
import type { CraftFacts } from './pageFacts'
import type { CraftPageView, Mode } from './types'
import { isUnverified, showText } from './visibility'

/** Bỏ hàng mà cả hai ô desktop bị ẩn; lọc nguồn bị ẩn khỏi `cite`; đánh dấu ô còn chờ xác minh (muted). */
export function craftCompareRows(rows: CraftFacts['rows'], mode: Mode, visible: ReadonlySet<string>): CraftPageView['compare']['rows'] {
  const out: CraftPageView['compare']['rows'] = []
  for (const r of rows) {
    const hand = showText(r.hand, mode)
    const machine = showText(r.machine, mode)
    if (hand === null && machine === null) continue
    const lines = r.mobile
      .map((l) => ({ text: showText(l, mode), muted: isUnverified(l) }))
      .filter((l): l is { text: string; muted: boolean } => l.text !== null)
    out.push({
      aspect: r.aspect, hand, machine, mobile: lines.map((l) => l.text),
      muted: { hand: isUnverified(r.hand), machine: isUnverified(r.machine), mobile: lines.map((l) => l.muted) },
      cite: r.cite.filter((id) => visible.has(id)),
    })
  }
  return out
}

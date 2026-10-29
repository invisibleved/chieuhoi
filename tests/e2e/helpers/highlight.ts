import type { Locator, Page } from '@playwright/test'

/** Khoảng cách giữa khung đỏ và phần tử (px). */
const GAP = 4

/**
 * Vẽ một khung đỏ quanh phần tử cần bấm cho ảnh hướng dẫn, gỡ mọi khung cũ trước. Locator khớp nhiều phần tử thì
 * khung bao trọn tất cả. Khung là một `div` tuyệt đối gắn vào `body`, không nhận chuột. Trả chữ của các phần tử,
 * mỗi phần tử một đoạn (để ghi `labels.json`); nút chỉ có biểu tượng thì trả `aria-label`.
 */
export async function highlight(page: Page, locator: Locator): Promise<string> {
  await locator.first().waitFor({ state: 'visible' })
  return locator.evaluateAll((els, gap) => {
    document.querySelectorAll('[data-guide-highlight]').forEach((n) => n.remove())
    // Đưa phần tử vào giữa màn hình để ảnh có cả phần xung quanh (thanh trên dính không che mất).
    els[0].scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })
    const rects = els.map((el) => el.getBoundingClientRect())
    const left = Math.min(...rects.map((r) => r.left))
    const top = Math.min(...rects.map((r) => r.top))
    const right = Math.max(...rects.map((r) => r.right))
    const bottom = Math.max(...rects.map((r) => r.bottom))
    const box = document.createElement('div')
    box.setAttribute('data-guide-highlight', '')
    box.setAttribute('aria-hidden', 'true')
    Object.assign(box.style, {
      position: 'absolute',
      left: `${left + window.scrollX - gap}px`,
      top: `${top + window.scrollY - gap}px`,
      width: `${right - left + gap * 2}px`,
      height: `${bottom - top + gap * 2}px`,
      outline: '3px solid #A04435',
      pointerEvents: 'none',
      zIndex: '2147483647',
    })
    document.body.appendChild(box)
    return els
      .map((el) => (el as HTMLElement).innerText.trim() || el.getAttribute('aria-label')?.trim() || '')
      .filter(Boolean)
      .join('\n')
  }, GAP)
}

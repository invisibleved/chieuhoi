import type { Locator, Page } from '@playwright/test'

/** Khoảng cách giữa khung đỏ và phần tử (px). */
const GAP = 4

/**
 * Vẽ khung đỏ quanh phần tử cần bấm cho ảnh hướng dẫn, gỡ mọi khung cũ trước.
 * Khung là một `div` tuyệt đối gắn vào `body`, không nhận chuột. Trả chữ của phần tử (để ghi `labels.json`);
 * nút chỉ có biểu tượng thì trả `aria-label`.
 */
export async function highlight(page: Page, locator: Locator): Promise<string> {
  await locator.waitFor({ state: 'visible' })
  return locator.evaluate((el, gap) => {
    document.querySelectorAll('[data-guide-highlight]').forEach((n) => n.remove())
    // Đưa phần tử vào giữa màn hình để ảnh có cả phần xung quanh (thanh trên dính không che mất).
    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })
    const r = el.getBoundingClientRect()
    const box = document.createElement('div')
    box.setAttribute('data-guide-highlight', '')
    box.setAttribute('aria-hidden', 'true')
    Object.assign(box.style, {
      position: 'absolute',
      left: `${r.left + window.scrollX - gap}px`,
      top: `${r.top + window.scrollY - gap}px`,
      width: `${r.width + gap * 2}px`,
      height: `${r.height + gap * 2}px`,
      outline: '3px solid #A04435',
      pointerEvents: 'none',
      zIndex: '2147483647',
    })
    document.body.appendChild(box)
    const text = (el as HTMLElement).innerText.trim()
    return text || el.getAttribute('aria-label')?.trim() || ''
  }, GAP)
}

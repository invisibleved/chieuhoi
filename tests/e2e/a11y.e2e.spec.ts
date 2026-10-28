// Quét a11y mọi route chính (R12, R13 Phase 7). Chạy ở hai project:
// - `chromium`: bản xem trước (:3000, đăng nhập người duyệt nếu có phiên để hiện ảnh chưa được phép);
// - `a11y-public`: bản production public (:3100, PREVIEW_ALL=false). Bài "Chuyện về Trạng Chiếu" còn là bản nháp
//   nên ở public route này trả trang 404: vẫn quét, vì trang 404 cũng phải đạt a11y.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import { REVIEWER_STATE } from './global-setup'
import { AUDIT_ROUTES, VIEWPORTS } from './helpers/routes'

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const MIN_FONT_PX = 12
const MIN_TARGET_PX = 44

async function open(page: Page, path: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  if (test.info().project.name === 'chromium' && existsSync(REVIEWER_STATE)) {
    const { cookies } = JSON.parse(readFileSync(REVIEWER_STATE, 'utf8'))
    await page.context().addCookies(cookies)
  }
  const res = await page.goto(path)
  expect(res, path).toBeTruthy()
  await page.waitForLoadState('networkidle')
}

/** Nút text hiển thị có font-size dưới 12px: trả "cỡ chữ \"đoạn chữ\"" để so với []. */
function smallText(page: Page) {
  return page.evaluate((min) => {
    const out: string[] = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = (n.textContent ?? '').trim()
      const el = n.parentElement
      if (!text || !el || el.closest('script, style, noscript, template')) continue
      if (!el.checkVisibility({ visibilityProperty: true })) continue
      const range = document.createRange()
      range.selectNodeContents(n)
      if (![...range.getClientRects()].some((r) => r.width > 0 && r.height > 0)) continue
      const size = parseFloat(getComputedStyle(el).fontSize)
      if (size < min) out.push(`${size}px <${el.tagName.toLowerCase()}> "${text.slice(0, 40)}"`)
    }
    return out
  }, MIN_FONT_PX)
}

/** Điều khiển hiển thị nhỏ hơn 44×44 (chỉ kiểm ở 390). Trả danh sách để so với []. */
function smallTargets(page: Page) {
  return page.evaluate((min) => {
    const INLINE_PARENTS = new Set(['P', 'LI', 'DD', 'FIGCAPTION'])
    const blockAncestor = (el: Element) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const d = getComputedStyle(p).display
        if (d !== 'contents' && !d.startsWith('inline')) return p
      }
      return null
    }
    const out: string[] = []
    document.querySelectorAll('a, button, input, select, textarea, [role=tab]').forEach((el) => {
      if (!el.checkVisibility({ visibilityProperty: true })) return
      const r = el.getBoundingClientRect()
      // Mẫu "chỉ cho trình đọc màn hình" (sr-only, ví dụ link "bỏ qua tới nội dung" trước khi focus) có hộp 1×1:
      // không phải vùng chạm nhìn thấy nên không thuộc phạm vi WCAG 2.5.8.
      if (r.width <= 1 || r.height <= 1) return
      // Vùng chạm có thể được mở rộng bằng pseudo-element tuyệt đối (ví dụ FootnoteRef: before:size-11);
      // getBoundingClientRect không tính pseudo-element nên lấy cỡ lớn nhất của hộp và ::before/::after.
      let [w, h] = [r.width, r.height]
      for (const pseudo of ['::before', '::after']) {
        const cs = getComputedStyle(el, pseudo)
        if (cs.content === 'none' || cs.position !== 'absolute') continue
        w = Math.max(w, parseFloat(cs.width) || 0)
        h = Math.max(h, parseFloat(cs.height) || 0)
      }
      if (w >= min - 0.5 && h >= min - 0.5) return
      // Ngoại lệ "inline" của WCAG 2.5.8: link nằm trong dòng chữ (tổ tiên khối gần nhất là p, li, dd, figcaption),
      // cỡ của nó do line-height của đoạn văn quyết định, ví dụ chú thích nguồn [1] hay link trong danh sách nguồn.
      if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') {
        const block = blockAncestor(el)
        if (block && INLINE_PARENTS.has(block.tagName)) return
      }
      const label = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)
      out.push(`<${el.tagName.toLowerCase()}> "${label}" ${Math.round(w)}×${Math.round(h)}`)
    })
    return out
  }, MIN_TARGET_PX)
}

for (const route of AUDIT_ROUTES) {
  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    test(`a11y ${route.name} ${vpName}`, async ({ page }) => {
      await page.setViewportSize(vp)
      await open(page, route.path)

      const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()
      expect
        .soft(
          violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')} (${v.help})`)),
          'axe',
        )
        .toEqual([])
      expect.soft(await smallText(page), `chữ < ${MIN_FONT_PX}px`).toEqual([])
      if (vpName === 'mobile') expect.soft(await smallTargets(page), `vùng chạm < ${MIN_TARGET_PX}px`).toEqual([])
    })
  }

  // R13: phóng chữ 200% (1280 px → 640 px) và reflow WCAG 1.4.10 (320 px) không được cuộn ngang.
  for (const width of [320, 640]) {
    test(`a11y ${route.name} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await open(page, route.path)
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }))
      expect(scrollWidth, 'cuộn ngang').toBeLessThanOrEqual(innerWidth)
    })
  }
}

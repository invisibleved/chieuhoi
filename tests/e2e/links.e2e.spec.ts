// Duyệt link (preview): mọi link nội bộ tới Sản phẩm, Thư viện, Kết nối từ header, footer và các trang Phase 3–5a phải mở được.
import { expect, test } from '@playwright/test'

const SOURCES = ['/', '/nghe-det-chieu', '/lang-hoi', '/cau-chuyen', '/con-nguoi']
const TARGET = /^\/(san-pham(\/[^?#]+)?|thu-vien(\?anh=[^&#]+)?|ket-noi)$/

test('link tới /san-pham, /thu-vien, /ket-noi không còn 404', async ({ page }) => {
  const found = new Map<string, string>()
  for (const source of SOURCES) {
    const res = await page.goto(source)
    expect(res?.status(), source).toBe(200)
    await page.locator('main h1').first().waitFor()
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''))
    for (const h of hrefs) if (TARGET.test(h) && !found.has(h)) found.set(h, source)
  }
  const links = [...found.keys()]
  // Header và footer có mặt trên mọi trang nên các trang gốc phải có mặt trong tập link.
  for (const must of ['/san-pham', '/thu-vien', '/ket-noi']) expect(links, must).toContain(must)
  expect(links.some((h) => h.startsWith('/san-pham/'))).toBe(true)
  for (const h of links) {
    const res = await page.request.get(h)
    expect(res.status(), `${h} (từ ${found.get(h)})`).toBeLessThan(400)
  }
})

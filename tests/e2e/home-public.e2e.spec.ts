// Chạy bằng project "public" (máy chủ riêng, PREVIEW_ALL=false): xem playwright.config.ts.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

const ideaSlugs: string[] = (JSON.parse(readFileSync('content/seed/stories.json', 'utf8')) as { slug: string }[]).map((s) => s.slug)

async function open(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const res = await page.goto('/')
  expect(res?.status()).toBe(200)
  // Bản production prefetch liên tục các link trong khung nhìn nên không đợi networkidle.
  await page.locator('main h1').waitFor()
}

for (const vp of [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]) {
  test.describe(`trang chủ public ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test('không lộ placeholder, nháp, ảnh chưa được phép, link 404', async ({ page }) => {
      await open(page)
      const main = page.locator('main')
      const text = (await main.evaluate((el) => el.textContent ?? ''))
      expect(text).not.toMatch(/\[[^\]]*(cần|chờ)\s/i)
      expect(text).not.toMatch(/cần xác minh|chờ xác minh|cần xin phép/i)
      expect(text).not.toContain('Bản nháp')

      // Seed hiện chỉ có asset rights=unknown: không img nào trỏ tới asset hay ảnh tham khảo.
      const srcs = await main.locator('img').evaluateAll((els) => els.map((e) => decodeURIComponent((e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src)))
      expect(srcs.filter((s) => /archive-assets|images\/reference/.test(s))).toEqual([])
      expect(await main.locator('section:has(h2) img, section:first-of-type img').count()).toBe(0)

      await expect(main.locator('h1')).toHaveCount(1)
      await expect(page.getByRole('heading', { level: 2, name: /Làng vẫn còn đó/ })).toBeVisible()

      const hrefs = await main.locator('a').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''))
      for (const slug of ideaSlugs) expect(hrefs).not.toContain(`/cau-chuyen/${slug}`)
    })

    test('axe: không có vi phạm serious/critical', async ({ page }) => {
      await open(page)
      const { violations } = await new AxeBuilder({ page }).analyze()
      expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
    })
  })
}

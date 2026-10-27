import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { SHOTS, shootFullPage, smallTargets, VIEWPORTS } from './helpers'

const H2 = [
  'Có một làng Hới...',
  'Một tấm chiếu, muôn công đoạn.',
  'Những bàn tay giữ hồn làng.',
  'Chuyện làng, kể chậm.',
  'Nét đẹp từ những đường dệt.',
  'Ký ức qua từng khung hình.',
]

async function open(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const res = await page.goto('/')
  expect(res?.status()).toBe(200)
  await page.waitForLoadState('networkidle')
}

for (const vp of [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]) {
  test.describe(`trang chủ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test('một h1 và đủ h2', async ({ page }) => {
      await open(page)
      await expect(page.locator('main h1')).toHaveCount(1)
      const h1 = (await page.locator('main h1').evaluate((el) => (el as HTMLElement).innerText)).split('\n').map((l) => l.trim()).filter(Boolean)
      expect(h1[0]).toBe('Từ sợi cói quê nhà,')
      expect(h1[h1.length - 1]).toBe('câu chuyện.')
      for (const t of H2) await expect(page.getByRole('heading', { level: 2, name: t, exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { level: 2, name: /Làng vẫn còn đó/ })).toBeVisible()
    })

    test('axe: không có vi phạm serious/critical', async ({ page }) => {
      await open(page)
      const { violations } = await new AxeBuilder({ page }).analyze()
      const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
    })

    test('chọn công đoạn thứ 3', async ({ page }) => {
      await open(page)
      const group = vp.width >= 768 ? page.locator('ol button') : page.getByRole('group', { name: 'Chọn công đoạn' }).locator('button')
      await group.nth(2).click()
      await expect(page.getByRole('progressbar', { name: 'Tiến trình công đoạn' }).and(page.locator(':visible'))).toHaveAttribute('aria-valuenow', '3')
    })

    test('chọn điểm hoa văn 2', async ({ page }) => {
      await open(page)
      const dot = page.locator('button[aria-pressed][aria-label^="Chi tiết 2"]')
      expect(await dot.count()).toBeGreaterThan(0)
      await dot.scrollIntoViewIfNeeded()
      await dot.click()
      await expect(dot).toHaveAttribute('aria-pressed', 'true')
    })

    test('chip "Nghề dệt" lọc ô ảnh', async ({ page }) => {
      await open(page)
      const chip = page.getByRole('button', { name: 'Nghề dệt', exact: true })
      await chip.scrollIntoViewIfNeeded()
      await chip.click()
      await expect(chip).toHaveAttribute('aria-pressed', 'true')
      const tiles = page.locator('a[href^="/thu-vien?anh="]')
      const n = await tiles.count()
      expect(n).toBeGreaterThan(0)
      for (let i = 0; i < n; i++) {
        const t = tiles.nth(i)
        // Mobile ẩn phần nhãn nhóm bằng CSS nên đọc textContent, không phải innerText.
        expect(((await t.textContent()) ?? '').toLocaleUpperCase('vi')).toContain('NGHỀ DỆT')
      }
    })
  })
}

test.describe('trang chủ mobile 390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('không cuộn ngang, nút và link ≥ 44px', async ({ page }) => {
    await open(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    const small = await smallTargets(page)
    expect(small).toEqual([])
  })

  test('link "Gặp những người làng Hới" ẩn ở mobile', async ({ page }) => {
    await open(page)
    await expect(page.getByRole('link', { name: /Gặp những người làng Hới/ })).toBeHidden()
  })
})

for (const vp of VIEWPORTS) {
  test(`chụp toàn trang chủ ${vp.name}`, async ({ page }) => {
    test.skip(!SHOTS, 'đặt SHOTS_DIR để lưu ảnh chụp')
    test.setTimeout(120_000)
    await shootFullPage(page, open, 'home', vp)
  })
}

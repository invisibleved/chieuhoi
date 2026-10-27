// /cau-chuyen ở chế độ xem trước (đăng nhập người duyệt). Ca public nằm trong public-pages.e2e.spec.ts.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import {
  expectVisibleImagesLoaded,
  loginReviewer,
  scrollThrough,
  shootFullPage,
  SHOTS,
  smallTargets,
  VIEWPORTS,
} from './helpers'

async function open(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const res = await page.goto('/cau-chuyen')
  expect(res?.status()).toBe(200)
  await page.waitForLoadState('networkidle')
}

const visibleSearch = (page: Page) =>
  page.getByLabel('Tìm trong câu chuyện').filter({ visible: true })
const cards = (page: Page) =>
  page
    .locator('main section')
    .last()
    .locator('a, article')
    .filter({ has: page.locator('span.font-display') })

for (const vp of VIEWPORTS) {
  test.describe(`câu chuyện (xem trước) ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test('một h1, 6 thẻ, đếm có bản nháp, axe sạch', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      await expect(page.locator('main h1')).toHaveCount(1)
      await expect(cards(page)).toHaveCount(6)
      const count = page.getByRole('status').locator('span').filter({ visible: true })
      await expect(count).toHaveText(vp.width >= 768 ? '6 bài · 1 bản nháp' : '6 bài')
      const { violations } = await new AxeBuilder({ page }).analyze()
      const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      expect(
        bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
      ).toEqual([])
    })

    test('chip "Lịch sử" còn 1 thẻ và đổi aria-pressed', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      const chip = page.getByRole('button', { name: 'Lịch sử' })
      await chip.click()
      await expect(chip).toHaveAttribute('aria-pressed', 'true')
      await expect(page.getByRole('button', { name: 'Tất cả' })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
      await expect(cards(page)).toHaveCount(1)
    })

    test('tìm "trang chieu" ra 1 kết quả; "zzz" ra khung trống', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      const box = visibleSearch(page)
      await box.fill('trang chieu')
      await expect(cards(page)).toHaveCount(1)
      await expect(cards(page).first()).toContainText('Chuyện về Trạng Chiếu')
      await box.fill('zzz')
      await expect(page.getByText('Chưa có bài trong chủ đề này')).toBeVisible()
      await expect(page.getByRole('status').filter({ visible: true })).toContainText('0 bài')
    })
  })
}

test.describe('câu chuyện (xem trước) 1440: bài nổi bật', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('bài nổi bật là Chuyện về Trạng Chiếu, link tới trang chi tiết', async ({ page }) => {
    await loginReviewer(page)
    await open(page)
    const featured = page.getByRole('region', { name: 'BÀI NỔI BẬT' })
    await expect(featured).toContainText('BÀI NỔI BẬT · LỊCH SỬ')
    await expect(featured.getByRole('link')).toHaveAttribute(
      'href',
      '/cau-chuyen/chuyen-ve-trang-chieu',
    )
    // Thẻ chủ đề đề xuất không phải link.
    await expect(page.locator('main a[href="/cau-chuyen"]')).toHaveCount(0)
  })
})

test.describe('câu chuyện (xem trước) 390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('không cuộn ngang, không có khối nổi bật, vùng chạm ≥ 44px', async ({ page }) => {
    await loginReviewer(page)
    await open(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await expect(page.getByRole('region', { name: 'BÀI NỔI BẬT' })).toBeHidden()
    expect(await smallTargets(page)).toEqual([])
  })
})

for (const vp of VIEWPORTS) {
  test(`ảnh trong main tải xong ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await loginReviewer(page)
    await open(page)
    await scrollThrough(page)
    await expectVisibleImagesLoaded(page)
  })

  test(`chụp toàn trang câu chuyện ${vp.name}`, async ({ page }) => {
    test.skip(!SHOTS, 'đặt SHOTS_DIR để lưu ảnh chụp')
    test.setTimeout(120_000)
    await shootFullPage(page, open, 'stories', vp)
  })
}

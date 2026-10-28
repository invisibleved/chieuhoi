// /san-pham ở chế độ xem trước (đăng nhập người duyệt). Ca public nằm trong public-pages.e2e.spec.ts.
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
  const res = await page.goto('/san-pham')
  expect(res?.status()).toBe(200)
  await page.waitForLoadState('networkidle')
}

const cards = (page: Page) => page.locator('main a[href^="/san-pham/"]')

for (const vp of VIEWPORTS) {
  test.describe(`sản phẩm (xem trước) ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })
    const desktop = vp.width >= 768

    test('một h1 ngắt dòng, 7 thẻ, 3 chip, đếm, không cuộn ngang, axe sạch', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      await expect(page.locator('main h1')).toHaveCount(1)
      await expect(page.locator('main h1')).toHaveText(/Nét đẹp từ\s*những đường dệt\./)
      await expect(page.locator('main h1 br')).toHaveCount(1)
      await expect(page.getByRole('navigation', { name: 'Đường dẫn' }))[desktop ? 'toBeVisible' : 'toBeHidden']()
      await expect(cards(page)).toHaveCount(7)
      await expect(page.getByRole('group', { name: desktop ? 'Lọc theo nhóm' : 'Lọc' }).getByRole('button')).toHaveCount(3)
      await expect(page.getByRole('status').locator('span').filter({ visible: true })).toHaveText(
        desktop ? '7 hiện vật · danh mục theo Vietnam+' : '7 hiện vật',
      )
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width)
      const { violations } = await new AxeBuilder({ page }).analyze()
      const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
    })

    test('chip lọc đổi số thẻ, aria-pressed và đếm', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      const chip = page.getByRole('button', { name: 'Chiếu đương đại' })
      await chip.click()
      await expect(chip).toHaveAttribute('aria-pressed', 'true')
      await expect(cards(page)).toHaveCount(1)
      await expect(page.getByRole('status').locator('span').filter({ visible: true })).toHaveText(
        desktop ? '1 hiện vật · danh mục theo Vietnam+' : '1 hiện vật',
      )
      await page.getByRole('button', { name: 'Tất cả' }).click()
      await expect(cards(page)).toHaveCount(7)
    })

    test('thẻ đầu trỏ tới /san-pham/chieu-cap-dieu; thẻ không ảnh có khung "ẢNH CẦN CHỤP"', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      await expect(cards(page).first()).toHaveAttribute('href', '/san-pham/chieu-cap-dieu')
      await expect(page.getByRole('img', { name: /Ảnh cần chụp/ }).filter({ visible: true }).first()).toBeVisible()
    })

    test('khung "VỀ DANH MỤC" và khối kêu gọi chỉ có ở desktop', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      const about = page.getByText('VỀ DANH MỤC')
      const cta = page.getByRole('heading', { level: 2, name: 'Muốn tìm đến người làm chiếu?' })
      if (desktop) {
        await expect(about).toBeVisible()
        await expect(page.getByRole('link', { name: /Xem nguồn/ })).toHaveAttribute('href', /^https?:\/\//)
        await expect(cta).toBeVisible()
        await expect(page.getByRole('link', { name: 'Kết nối với làng', exact: true })).toHaveAttribute('href', '/ket-noi')
      } else {
        await expect(about).toBeHidden()
        await expect(cta).toBeHidden()
      }
    })
  })
}

test.describe('sản phẩm (xem trước) 1440 bố cục', () => {
  test.use({ viewport: { width: 1440, height: 900 } })
  test('lưới 3 cột, ảnh cao 340px', async ({ page }) => {
    await loginReviewer(page)
    await open(page)
    const lefts = await cards(page).evaluateAll((els) => [...new Set(els.map((e) => Math.round(e.getBoundingClientRect().left)))])
    expect(lefts).toHaveLength(3)
    const h = await cards(page).first().locator('img, [role="img"]').first().evaluate((e) => Math.round(e.getBoundingClientRect().height))
    expect(h).toBe(340)
  })
})

test.describe('sản phẩm (xem trước) 390', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test('lưới 1 cột, vùng chạm ≥ 44px', async ({ page }) => {
    await loginReviewer(page)
    await open(page)
    const lefts = await cards(page).evaluateAll((els) => [...new Set(els.map((e) => Math.round(e.getBoundingClientRect().left)))])
    expect(lefts).toHaveLength(1)
    expect(await smallTargets(page)).toEqual([])
  })
})

for (const vp of VIEWPORTS) {
  test(`ảnh trong main tải xong (sản phẩm) ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await loginReviewer(page)
    await open(page)
    await scrollThrough(page)
    await expectVisibleImagesLoaded(page)
  })

  test(`chụp toàn trang sản phẩm ${vp.name}`, async ({ page }) => {
    test.skip(!SHOTS, 'đặt SHOTS_DIR để lưu ảnh chụp')
    test.setTimeout(120_000)
    await shootFullPage(page, open, 'san-pham', vp)
  })
}

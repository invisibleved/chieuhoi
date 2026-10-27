// /con-nguoi ở chế độ xem trước (đăng nhập người duyệt). Ca public nằm trong public-pages.e2e.spec.ts.
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
  const res = await page.goto('/con-nguoi')
  expect(res?.status()).toBe(200)
  await page.waitForLoadState('networkidle')
}

const cards = (page: Page) => page.locator('main a[href^="/con-nguoi/"]')

for (const vp of VIEWPORTS) {
  test.describe(`con người (xem trước) ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })
    const desktop = vp.width >= 768

    test('một h1, 8 thẻ, đếm, ghi chú, axe sạch', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      await expect(page.locator('main h1')).toHaveCount(1)
      await expect(cards(page)).toHaveCount(8)
      await expect(page.getByRole('status').locator('span').filter({ visible: true })).toHaveText(
        desktop ? '8 chân dung · tất cả đang chờ đồng ý' : '8 chân dung · đang chờ đồng ý',
      )
      if (desktop) await expect(cards(page).first()).toContainText('cần xác minh')
      const { violations } = await new AxeBuilder({ page }).analyze()
      const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
    })

    test('chip lọc đổi số thẻ và aria-pressed; nhóm trống hiện khung trống', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      const chip = page.getByRole('button', { name: 'Nghệ nhân' })
      await chip.click()
      await expect(chip).toHaveAttribute('aria-pressed', 'true')
      await expect(cards(page)).toHaveCount(2)
      await page.getByRole('button', { name: 'Thế hệ trẻ' }).click()
      await expect(page.getByText('Chưa có chân dung trong nhóm này')).toBeVisible()
      await expect(cards(page)).toHaveCount(0)
    })

    test('khối mời và khung nguyên tắc', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      await expect(page.getByRole('complementary', { name: 'Nguyên tắc chân dung' })).toBeVisible()
      const invite = page.getByRole('heading', { level: 2, name: 'Bạn biết một người giữ nghề?' })
      if (desktop) {
        await expect(invite).toBeVisible()
        await expect(page.getByRole('link', { name: 'Giới thiệu một người', exact: true })).toHaveAttribute('href', '/ket-noi')
      } else {
        await expect(invite).toBeHidden()
      }
    })
  })
}

test.describe('con người (xem trước) 1440 bố cục', () => {
  test.use({ viewport: { width: 1440, height: 900 } })
  test('4 cột, thẻ thứ 2 và 4 lùi xuống 48px', async ({ page }) => {
    await loginReviewer(page)
    await open(page)
    const tops = await cards(page).evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)))
    expect(tops[1] - tops[0]).toBe(48)
    expect(tops[3] - tops[0]).toBe(48)
    expect(tops[2]).toBe(tops[0])
    expect(tops[4]).toBeGreaterThan(tops[3])
  })
})

test.describe('con người (xem trước) 390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('không cuộn ngang, lưới 2 cột, vùng chạm ≥ 44px', async ({ page }) => {
    await loginReviewer(page)
    await open(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    const lefts = await cards(page).evaluateAll((els) => [...new Set(els.map((e) => Math.round(e.getBoundingClientRect().left)))])
    expect(lefts).toHaveLength(2)
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

  test(`chụp toàn trang con người ${vp.name}`, async ({ page }) => {
    test.skip(!SHOTS, 'đặt SHOTS_DIR để lưu ảnh chụp')
    test.setTimeout(120_000)
    await shootFullPage(page, open, 'people', vp)
  })
}

// /con-nguoi/[slug] ở chế độ xem trước: mẫu seed chưa có đồng ý, preview hiện ảnh tham khảo kèm ghi chú quy trình.
const PERSON = '/con-nguoi/mau-nghe-nhan'

async function openPerson(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const res = await page.goto(PERSON)
  expect(res?.status()).toBe(200)
  await page.waitForLoadState('networkidle')
}

for (const vp of VIEWPORTS) {
  test.describe(`chân dung (xem trước) ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })
    const desktop = vp.width >= 768

    test('một h1, băng mẫu trang, ba mục gợi ý, không cuộn ngang, axe sạch', async ({ page }) => {
      await loginReviewer(page)
      await openPerson(page)
      await expect(page.locator('main h1')).toHaveCount(1)
      await expect(page.getByRole('note').filter({ visible: true })).toContainText(desktop ? 'Mẫu trang chân dung.' : 'Mẫu trang.')
      await expect(page.getByRole('navigation', { name: 'Đường dẫn' }))[desktop ? 'toBeVisible' : 'toBeHidden']()
      await expect(page.locator('main h3')).toHaveText(['Tuổi thơ bên khung dệt', 'Một ngày làm chiếu', 'Điều muốn giữ lại'])
      // Lời trích sau mục 1 ở mobile (PersonMobile), sau mục 2 từ md (PersonDetail) (F1).
      const order = await page.locator('main h3, main blockquote').evaluateAll((els) =>
        els.filter((e) => e.getClientRects().length > 0).map((e) => (e.tagName === 'H3' ? e.textContent : 'QUOTE')))
      expect(order).toEqual(desktop
        ? ['Tuổi thơ bên khung dệt', 'Một ngày làm chiếu', 'QUOTE', 'Điều muốn giữ lại']
        : ['Tuổi thơ bên khung dệt', 'QUOTE', 'Một ngày làm chiếu', 'Điều muốn giữ lại'])
      await expect(page.locator('main dl').filter({ visible: true }).locator('dt')).toHaveCount(desktop ? 4 : 2)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width)
      const { violations } = await new AxeBuilder({ page }).analyze()
      const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
    })

    test('phóng sự ảnh 2 ảnh, thẻ liên quan "05 · …" (công đoạn nháp chỉ có ở preview, P2)', async ({ page }) => {
      await loginReviewer(page)
      await openPerson(page)
      await expect(page.getByRole('heading', { level: 2, name: 'Phóng sự ảnh' })).toBeVisible()
      await expect(page.locator('main section:has(h2:text-is("Phóng sự ảnh")) figure img')).toHaveCount(2)
      const related = page.locator('main section[aria-labelledby="read-next-h"] a').filter({ visible: true })
      await expect(related.first()).toContainText(/05 · /)
      await expect(related).toHaveCount(desktop ? 2 : 1)
      await expect(page.getByRole('region', { name: 'TRẠNG THÁI ĐỒNG Ý' })).toContainText('Chưa có')
    })

    test('ảnh tải xong, vùng chạm ≥ 44px', async ({ page }) => {
      await loginReviewer(page)
      await openPerson(page)
      await scrollThrough(page)
      await expectVisibleImagesLoaded(page)
      if (!desktop) expect(await smallTargets(page)).toEqual([])
    })
  })
}

for (const vp of VIEWPORTS) {
  test(`chụp toàn trang chân dung ${vp.name}`, async ({ page }) => {
    test.skip(!SHOTS, 'đặt SHOTS_DIR để lưu ảnh chụp')
    test.setTimeout(120_000)
    await shootFullPage(page, openPerson, 'person', vp)
  })
}

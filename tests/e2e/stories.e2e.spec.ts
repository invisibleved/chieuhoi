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
    // Chủ đề in hoa bằng CSS: innerText phản ánh text-transform.
    await expect(featured).toContainText('BÀI NỔI BẬT · LỊCH SỬ', { useInnerText: true })
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

// /cau-chuyen/[slug] ở chế độ xem trước: bài nháp chỉ mở được khi đăng nhập người duyệt.
const STORY = '/cau-chuyen/chuyen-ve-trang-chieu'

async function openStory(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const res = await page.goto(STORY)
  expect(res?.status()).toBe(200)
  await page.waitForLoadState('networkidle')
}

for (const vp of VIEWPORTS) {
  test.describe(`bài đọc (xem trước) ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })
    const desktop = vp.width >= 768

    test('một h1, tag nháp, mục lục theo viewport, không cuộn ngang, axe sạch', async ({ page }) => {
      await loginReviewer(page)
      await openStory(page)
      await expect(page.locator('main h1')).toHaveCount(1)
      await expect(page.locator('main h1')).toHaveText('Chuyện về Trạng Chiếu')
      await expect(page.getByText('Bản nháp — cần thẩm định')).toBeVisible()
      await expect(page.getByRole('navigation', { name: 'Mục lục' }))[desktop ? 'toBeVisible' : 'toBeHidden']()
      await expect(page.getByRole('navigation', { name: 'Đường dẫn' }))[desktop ? 'toBeVisible' : 'toBeHidden']()
      await expect(page.getByText('CẦN THẨM ĐỊNH TRƯỚC KHI ĐĂNG')).toBeVisible()
      // Dòng dưới trích dẫn trong bài: StoryDetail có, StoryMobile không (M1).
      await expect(page.locator('main blockquote').getByText('Trích từ bài viết'))[desktop ? 'toBeVisible' : 'toBeHidden']()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width)
      const { violations } = await new AxeBuilder({ page }).analyze()
      const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
    })

    test('bấm chú thích "2" nhảy tới #nguon-2', async ({ page }) => {
      await loginReviewer(page)
      await openStory(page)
      await page.locator('article a[href="#nguon-2"]').first().click()
      await expect(page).toHaveURL(/#nguon-2$/)
      await expect(page.locator('#nguon-2')).toBeInViewport()
    })

    test('cuộn 50% thì thanh tiến độ lớn hơn 0', async ({ page }) => {
      await loginReviewer(page)
      await openStory(page)
      const bar = page.getByRole('progressbar', { name: 'Tiến độ đọc' })
      await expect(bar).toHaveAttribute('aria-valuenow', '0')
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2))
      await expect.poll(async () => Number(await bar.getAttribute('aria-valuenow'))).toBeGreaterThan(0)
    })

    test('sao chép đường dẫn báo "Đã sao chép đường dẫn"', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])
      await loginReviewer(page)
      await openStory(page)
      await page.getByRole('button', { name: /Sao chép/ }).filter({ visible: true }).click()
      await expect(page.getByRole('status').filter({ hasText: 'Đã sao chép đường dẫn' })).toBeVisible()
      expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(STORY)
    })

    test('thẻ đọc tiếp: ba thẻ ở desktop, hai thẻ ở mobile', async ({ page }) => {
      await loginReviewer(page)
      await openStory(page)
      const links = page.locator('main section[aria-labelledby="read-next-h"] a').filter({ visible: true })
      await expect(links).toHaveCount(desktop ? 4 : 2) // desktop thêm link "Tất cả câu chuyện →"
    })

    test('ảnh tải xong, vùng chạm ≥ 44px', async ({ page }) => {
      await loginReviewer(page)
      await openStory(page)
      await scrollThrough(page)
      await expectVisibleImagesLoaded(page)
      if (!desktop) expect(await smallTargets(page)).toEqual([])
    })
  })
}

test.describe('bài đọc (xem trước) 1440: mục lục', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('bấm "Truyền khẩu và sử liệu" đưa heading vào khung nhìn và đánh dấu aria-current', async ({ page }) => {
    await loginReviewer(page)
    await openStory(page)
    const link = page.getByRole('navigation', { name: 'Mục lục' }).getByRole('link', { name: 'Truyền khẩu và sử liệu' })
    await link.click()
    await expect(page.getByRole('heading', { level: 2, name: 'Truyền khẩu và sử liệu' })).toBeInViewport()
    await expect(link).toHaveAttribute('aria-current', 'true')
  })
})

for (const vp of VIEWPORTS) {
  test(`chụp toàn trang bài đọc ${vp.name}`, async ({ page }) => {
    test.skip(!SHOTS, 'đặt SHOTS_DIR để lưu ảnh chụp')
    test.setTimeout(120_000)
    await shootFullPage(page, openStory, 'story', vp)
  })
}

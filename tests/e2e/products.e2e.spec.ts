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

// /san-pham/chieu-cap-dieu ở chế độ xem trước: 3 điểm hoa văn, phóng, nguồn, mobile.
const SLUG = '/san-pham/chieu-cap-dieu'

async function openDetail(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const res = await page.goto(SLUG)
  expect(res?.status()).toBe(200)
  await page.locator('main h1').waitFor()
  await page.waitForLoadState('networkidle')
}

const markers = (page: Page) => page.getByRole('button', { name: /^Chi tiết \d: / })
const stageImg = (page: Page) => page.locator('main img').first()

for (const vp of VIEWPORTS) {
  test.describe(`hiện vật (xem trước) ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })
    const desktop = vp.width >= 768

    test('một h1, 3 điểm, nguồn #nguon-1, không cuộn ngang, axe sạch cả lúc phóng', async ({ page }) => {
      await loginReviewer(page)
      await openDetail(page)
      await expect(page.locator('main h1')).toHaveCount(1)
      await expect(page.locator('main h1')).toHaveText('Chiếu cạp điều')
      await expect(markers(page)).toHaveCount(3)
      await expect(page.locator('#nguon-1')).toBeAttached()
      await expect(page.getByRole('navigation', { name: 'Đường dẫn' }))[desktop ? 'toBeVisible' : 'toBeHidden']()
      await expect(page.getByRole('link', { name: /Sản phẩm$/ }).filter({ visible: true }).first()).toHaveAttribute('href', '/san-pham')
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width)
      const axe = async () => {
        const { violations } = await new AxeBuilder({ page }).analyze()
        return violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)
      }
      expect(await axe()).toEqual([])
      await markers(page).nth(1).click()
      await expect(page.getByRole('button', { name: 'Đóng chi tiết' })).toBeVisible()
      expect(await axe()).toEqual([])
    })

    test('bấm điểm 2: phóng, region có chú thích và nút Đóng; Esc thu nhỏ', async ({ page }) => {
      await loginReviewer(page)
      await openDetail(page)
      await markers(page).nth(1).click()
      await expect(markers(page).nth(1)).toHaveAttribute('aria-pressed', 'true')
      const region = page.getByRole('region', { name: 'Chú thích chi tiết' })
      await expect(region).toContainText('Hoa văn in')
      await expect(region.getByRole('link', { name: 'Nguồn 1' })).toHaveAttribute('href', '#nguon-1')
      await expect(page.getByRole('button', { name: 'Đóng chi tiết' })).toBeVisible()
      await expect(stageImg(page)).toHaveCSS('transform', /matrix\(2\.2/)
      await page.keyboard.press('Escape')
      await expect(page.getByRole('button', { name: 'Đóng chi tiết' })).toHaveCount(0)
      await expect(stageImg(page)).toHaveCSS('transform', /matrix\(1,/)
    })

    test('thứ tự DOM: h1 trước ảnh; mobile ảnh → nút chọn → panel → h1', async ({ page }) => {
      await loginReviewer(page)
      await openDetail(page)
      const y = (loc: ReturnType<Page['locator']>) => loc.evaluate((e) => e.getBoundingClientRect().top + window.scrollY)
      const h1 = await y(page.locator('main h1'))
      const img = await y(stageImg(page))
      if (desktop) {
        expect(await page.locator('main h1').evaluate((h) => h.getBoundingClientRect().left)).toBeGreaterThan(vp.width * 0.65)
      } else {
        const picker = await y(page.getByRole('group', { name: 'Chọn chi tiết' }))
        expect(img).toBeLessThan(picker)
        expect(picker).toBeLessThan(h1)
      }
      const order = await page.evaluate(() => {
        const h = document.querySelector('main h1')!
        const i = document.querySelector('main img')!
        return h.compareDocumentPosition(i) & Node.DOCUMENT_POSITION_FOLLOWING ? 'h1-first' : 'img-first'
      })
      expect(order).toBe('h1-first')
    })

    test('bảng thông số: placeholder preview; liên hệ desktop, nút viền mobile', async ({ page }) => {
      await loginReviewer(page)
      await openDetail(page)
      const main = page.locator('main')
      await expect(main.getByText('[chỉ ghi khi đã đo]').filter({ visible: true })).toBeVisible()
      await expect(main.getByText('[hướng dẫn từ cơ sở dệt]').filter({ visible: true })).toBeVisible()
      await expect(main.getByText(desktop ? '[tên cơ sở, nếu được đồng ý]' : '[nếu được đồng ý]').filter({ visible: true })).toBeVisible()
      const cta = page.getByRole('link', { name: desktop ? /^Kết nối với làng/ : 'Kết nối với người làm chiếu' })
      await expect(cta.filter({ visible: true })).toHaveAttribute('href', '/ket-noi')
      await expect(main.getByText('Chưa có cơ sở được xác minh và đồng ý công khai').filter({ visible: true })).toHaveCount(desktop ? 1 : 0)
      await expect(page.locator('section[aria-labelledby="read-next-h"]').getByText(desktop ? 'Hiện vật khác' : 'HIỆN VẬT KHÁC', { exact: true }).filter({ visible: true })).toBeVisible()
      await expect(page.locator('section[aria-labelledby="read-next-h"] li').filter({ visible: true })).toHaveCount(desktop ? 3 : 2)
    })
  })
}

test.describe('hiện vật (xem trước) 390 vùng chạm', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test('mọi nút và link trong main ≥ 44px', async ({ page }) => {
    await loginReviewer(page)
    await openDetail(page)
    expect(await smallTargets(page)).toEqual([])
  })
})

test.describe('hiện vật (xem trước) không JS', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } })
  test('<noscript> liệt kê đủ 3 chú thích', async ({ page }) => {
    await loginReviewer(page)
    const res = await page.goto(SLUG)
    expect(res?.status()).toBe(200)
    const html = await page.content()
    const ns = [...html.matchAll(/<noscript[^>]*>([\s\S]*?)<\/noscript>/g)].map((m) => m[1]).join('')
    for (const t of ['1 · Viền chiếu', '2 · Hoa văn in', '3 · Mặt cói dệt']) expect(ns).toContain(t)
  })
})

test('PatternTeaser trang chủ: bấm điểm 2 rồi link nguồn tới đúng neo trên trang hiện vật', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await loginReviewer(page)
  await page.goto('/')
  await page.getByRole('button', { name: /^Chi tiết 2: / }).click()
  const link = page.locator('main [aria-live="polite"]').getByRole('link', { name: 'Nguồn 1' })
  await expect(link).toHaveAttribute('href', `${SLUG}#nguon-1`)
  await link.click()
  await expect(page).toHaveURL(new RegExp(`${SLUG}#nguon-1$`))
  const target = page.locator('#nguon-1')
  await expect(target).toBeVisible()
  await expect(target).toContainText('Vietnam+')
  expect(await target.evaluate((e) => e.getBoundingClientRect().top)).toBeLessThan(900)
})

for (const vp of VIEWPORTS) {
  test(`chụp hiện vật ${vp.name} (xem trước, thu nhỏ và phóng)`, async ({ page }) => {
    test.skip(!SHOTS, 'đặt SHOTS_DIR để lưu ảnh chụp')
    test.setTimeout(120_000)
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await shootFullPage(page, openDetail, 'san-pham-slug-preview', vp)
    await markers(page).nth(1).click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: `${SHOTS}/san-pham-slug-preview-zoom-${vp.name}.png`, fullPage: true })
  })

  test(`ảnh trong main tải xong (hiện vật) ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await loginReviewer(page)
    await openDetail(page)
    await scrollThrough(page)
    await expectVisibleImagesLoaded(page)
  })
}

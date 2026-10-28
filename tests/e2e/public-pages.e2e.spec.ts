// Trang chủ, Nghề dệt chiếu, Làng Hới ở chế độ public. Chạy bằng project "public" (máy chủ riêng, PREVIEW_ALL=false): xem playwright.config.ts.
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

      // Thẻ idea ở trang chủ là chủ đề đề xuất (không phải link); mọi link tới Câu chuyện/Con người đều phải mở được.
      await expect(main.getByText('Chủ đề đề xuất').first()).toBeVisible()
      const internal = [...new Set(hrefs.filter((h) => /^\/(cau-chuyen|con-nguoi)(\/|$)/.test(h)))]
      expect(internal).toContain('/cau-chuyen')
      expect(internal).toContain('/con-nguoi')
      for (const h of internal) expect((await page.request.get(h)).status(), h).toBe(200)
    })

    test('axe: không có vi phạm serious/critical', async ({ page }) => {
      await open(page)
      const { violations } = await new AxeBuilder({ page }).analyze()
      expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
    })
  })
}

// Hai trang Phase 4: seed giữ công đoạn và mốc ở dạng nháp nên bản public thưa; chỉ kiểm không lộ placeholder/ảnh chưa được phép.
for (const route of ['/nghe-det-chieu', '/lang-hoi']) {
  for (const vp of [
    { name: '1440', width: 1440, height: 900 },
    { name: '390', width: 390, height: 844 },
  ]) {
    test.describe(`${route} public ${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } })

      test('200, một h1, không lộ placeholder hay ảnh chưa được phép', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' })
        const res = await page.goto(route)
        expect(res?.status()).toBe(200)
        await page.locator('main h1').first().waitFor()
        await expect(page.locator('main h1')).toHaveCount(1)
        const body = await page.evaluate(() => document.body.textContent ?? '')
        expect(body).not.toMatch(/cần xác minh|CẦN GHI LẠI|Chờ dữ liệu địa lý/i)
        const srcs = await page.locator('main img').evaluateAll((els) => els.map((e) => decodeURIComponent((e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src)))
        expect(srcs.filter((s) => /archive-assets|images\/reference/.test(s))).toEqual([])
      })

      test('axe: không có vi phạm serious/critical', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.goto(route)
        await page.locator('main h1').first().waitFor()
        const { violations } = await new AxeBuilder({ page }).analyze()
        expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
      })
    })
  }
}

// /cau-chuyen ở public: chỉ 5 bài chủ đề đề xuất (bài Trạng Chiếu còn là bản nháp), không bài nào có trang chi tiết (chi tiết public là 404).
for (const vp of [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]) {
  test.describe(`câu chuyện public ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    async function openStories(page: Page) {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      const res = await page.goto('/cau-chuyen')
      expect(res?.status()).toBe(200)
      await page.locator('main h1').waitFor()
    }

    test('5 bài, không khối nổi bật, thẻ chủ đề đề xuất không phải link, không lộ bản nháp', async ({ page }) => {
      await openStories(page)
      const main = page.locator('main')
      await expect(main.locator('h1')).toHaveCount(1)
      await expect(page.getByRole('status').filter({ visible: true })).toHaveText('5 bài')
      await expect(main.locator('article')).toHaveCount(5)
      await expect(main.getByText('Chủ đề đề xuất')).toHaveCount(5)
      await expect(page.getByRole('region', { name: 'BÀI NỔI BẬT' })).toHaveCount(0)
      const text = await main.evaluate((el) => el.textContent ?? '')
      expect(text).not.toContain('Bản nháp')
      expect(text).not.toContain('Chuyện về Trạng Chiếu')
      expect(text).not.toContain('Xem đề cương')
      const hrefs = await main.locator('a').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''))
      expect(hrefs.filter((h) => h.startsWith('/cau-chuyen'))).toEqual([])
    })

    test('lọc, tìm và axe', async ({ page }) => {
      await openStories(page)
      await page.getByRole('button', { name: 'Ký ức làng quê' }).click()
      await expect(page.getByRole('status').filter({ visible: true })).toHaveText('2 bài')
      await page.getByLabel('Tìm trong câu chuyện').filter({ visible: true }).fill('zzz')
      await expect(page.getByText('Chưa có bài trong chủ đề này')).toBeVisible()
      const { violations } = await new AxeBuilder({ page }).analyze()
      expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
    })
  })
}

// Vòng kiểm ảnh: 4 route mới ở public không có ảnh tham khảo hay ảnh chưa được phép (bài chi tiết public là 404 nên dùng chân dung mẫu).
for (const route of ['/cau-chuyen', '/con-nguoi', '/con-nguoi/mau-nghe-nhan']) {
  test(`${route} public không có ảnh chưa được phép`, async ({ page }) => {
    const res = await page.goto(route)
    expect(res?.status()).toBe(200)
    await page.locator('main h1').first().waitFor()
    const srcs = await page.locator('img').evaluateAll((els) => els.map((e) => decodeURIComponent((e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src)))
    expect(srcs.filter((s) => /archive-assets|images\/reference/.test(s))).toEqual([])
    expect(await page.content()).not.toMatch(/images\/reference|archive-assets/)
  })
}

test.describe('bài đọc public', () => {
  for (const slug of ['chuyen-ve-trang-chieu', 'mot-ngay-o-lang-hoi']) {
    test(`/cau-chuyen/${slug} trả 404 (bài nháp và bài idea không công khai)`, async ({ page }) => {
      const res = await page.goto(`/cau-chuyen/${slug}`)
      expect(res?.status()).toBe(404)
    })
  }
})

// /con-nguoi ở public: seed chưa có đồng ý nào nên 8 thẻ đều "Chờ đồng ý", không tên, không alt ảnh, không ghi chú.
for (const vp of [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]) {
  test.describe(`con người public ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    async function openPeople(page: Page) {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      const res = await page.goto('/con-nguoi')
      expect(res?.status()).toBe(200)
      await page.locator('main h1').waitFor()
    }

    test('8 thẻ chờ đồng ý, không lộ tên, vai trò, ghi chú, alt hay ảnh tham khảo', async ({ page }) => {
      await openPeople(page)
      const main = page.locator('main')
      await expect(main.locator('h1')).toHaveCount(1)
      const cards = main.locator('a[href^="/con-nguoi/"]')
      await expect(cards).toHaveCount(8)
      await expect(page.getByRole('status').locator('span').filter({ visible: true })).toHaveText(
        vp.width >= 768 ? '8 chân dung · tất cả đang chờ đồng ý' : '8 chân dung · đang chờ đồng ý',
      )
      const text = await main.evaluate((el) => el.textContent ?? '')
      expect(text).not.toMatch(/\[[^\]]*(cần|chờ)\s/i)
      expect(text).not.toMatch(/cần xác minh|chờ xác minh|cần xin phép/i)
      expect(text).not.toContain('bộ ảnh tham khảo')
      expect(text).not.toContain('Dệt chiếu tay')
      // Ảnh người chưa được đồng ý: không img nào trong lưới có alt khác rỗng.
      const alts = await cards.locator('img').evaluateAll((els) => els.map((e) => e.getAttribute('alt')))
      expect(alts.filter((a) => a !== '')).toEqual([])
      const srcs = await main.locator('img').evaluateAll((els) => els.map((e) => decodeURIComponent((e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src)))
      expect(srcs.filter((s) => /archive-assets|images\/reference/.test(s))).toEqual([])
    })

    test('lọc nhóm trống và axe', async ({ page }) => {
      await openPeople(page)
      await page.getByRole('button', { name: 'Thế hệ trẻ' }).click()
      await expect(page.getByText('Chưa có chân dung trong nhóm này')).toBeVisible()
      const { violations } = await new AxeBuilder({ page }).analyze()
      expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
    })
  })
}

// /con-nguoi/[slug] ở public: mẫu seed đã đăng nhưng chưa có đồng ý nào (Review Focus 1, P4).
// Không tên, không ảnh chân dung hay phóng sự ảnh, không alt/chú thích, không câu chuyện; khung đồng ý vẫn hiện.
const seedPersonLeaks = [
  'nkc10', 'nkc5', 'nkc14', 'images/reference',
  // alt ảnh tham khảo của seed (src/seed/data/archive.ts) và chú thích phóng sự ảnh (src/seed/data/extras.ts)
  'Người phụ nữ lớn tuổi ngồi dệt chiếu', 'Hai người cùng làm trên một khung', 'Đôi tay người phụ nữ ấn go',
  'Đôi tay trên khung dệt', 'Dệt chiếu tay', 'Đồng ý của người trong ảnh', 'Mẫu trang', 'Phóng sự ảnh',
]
for (const vp of [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]) {
  test.describe(`chân dung public ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    async function openPerson(page: Page) {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      const res = await page.goto('/con-nguoi/mau-nghe-nhan')
      expect(res?.status()).toBe(200)
      await page.locator('main h1').waitFor()
    }

    test('h1 "Chờ đồng ý", không lộ ảnh, alt, chú thích hay chữ quy trình; khung đồng ý "Chưa có"', async ({ page }) => {
      await openPerson(page)
      const main = page.locator('main')
      await expect(main.locator('h1')).toHaveCount(1)
      await expect(main.locator('h1')).toHaveText('Chờ đồng ý')
      // Toàn bộ HTML (kể cả payload RSC và metadata) không chứa dấu vết nhận ra người.
      const html = await page.content()
      for (const leak of seedPersonLeaks) expect(html, leak).not.toContain(leak)
      await expect(page).toHaveTitle(/Chờ đồng ý/)
      expect(await page.locator('meta[property="og:image"]').count()).toBe(0)
      await expect(main.locator('header img, figure img, blockquote')).toHaveCount(0)
      await expect(main.getByRole('heading', { level: 2, name: /Câu chuyện/ })).toHaveCount(0)
      const text = await main.evaluate((el) => el.textContent ?? '')
      expect(text).not.toMatch(/\[[^\]]*\]/)
      await expect(page.getByText('TRẠNG THÁI ĐỒNG Ý').filter({ visible: true })).toBeVisible()
      await expect(page.getByRole('region', { name: 'TRẠNG THÁI ĐỒNG Ý' })).toContainText('Chưa có')
      // Liên quan chỉ còn thẻ "Những chân dung khác" (desktop-only) nên mobile không có dải trống.
      await expect(page.locator('section[aria-labelledby="read-next-h"]'))[vp.width >= 768 ? 'toBeVisible' : 'toBeHidden']()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width)
    })

    test('axe: không có vi phạm serious/critical', async ({ page }) => {
      await openPerson(page)
      const { violations } = await new AxeBuilder({ page }).analyze()
      expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
    })

    test('chụp toàn trang chân dung public', async ({ page }) => {
      test.skip(!process.env.SHOTS_DIR, 'đặt SHOTS_DIR để lưu ảnh chụp')
      await openPerson(page)
      await page.screenshot({ path: `${process.env.SHOTS_DIR}/person-public-${vp.name}.png`, fullPage: true })
    })
  })
}

test('/con-nguoi/khong-co trả 404', async ({ page }) => {
  const res = await page.goto('/con-nguoi/khong-co')
  expect(res?.status()).toBe(404)
})

// /san-pham ở public: 7 hiện vật, ảnh chưa được phép nên mọi thẻ không ảnh; không ghi chú quy trình.
for (const vp of [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]) {
  test.describe(`sản phẩm public ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    async function openProducts(page: Page) {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      const res = await page.goto('/san-pham')
      expect(res?.status()).toBe(200)
      await page.locator('main h1').waitFor()
    }

    test('7 thẻ, lọc theo chip, link thẻ, không cuộn ngang, không lộ ảnh tham khảo hay chữ chưa xác minh', async ({ page }) => {
      await openProducts(page)
      const main = page.locator('main')
      const cards = main.locator('a[href^="/san-pham/"]')
      await expect(main.locator('h1')).toHaveCount(1)
      await expect(cards).toHaveCount(7)
      await expect(cards.first()).toHaveAttribute('href', '/san-pham/chieu-cap-dieu')
      const desktop = vp.width >= 768
      await expect(page.getByRole('status').locator('span').filter({ visible: true })).toHaveText(
        desktop ? '7 hiện vật · danh mục theo Vietnam+' : '7 hiện vật',
      )
      const text = await main.evaluate((el) => el.textContent ?? '')
      expect(text).not.toMatch(/cần xác minh/i)
      const srcs = await main.locator('img').evaluateAll((els) => els.map((e) => decodeURIComponent((e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src)))
      expect(srcs.filter((s) => /archive-assets|images\/reference/.test(s))).toEqual([])
      await page.getByRole('button', { name: 'Chiếu đương đại' }).click()
      await expect(cards).toHaveCount(1)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width)
    })

    test('axe: không có vi phạm serious/critical', async ({ page }) => {
      await openProducts(page)
      const { violations } = await new AxeBuilder({ page }).analyze()
      expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
    })

    test('chụp toàn trang sản phẩm public', async ({ page }) => {
      test.skip(!process.env.SHOTS_DIR, 'đặt SHOTS_DIR để lưu ảnh chụp')
      await openProducts(page)
      await page.screenshot({ path: `${process.env.SHOTS_DIR}/san-pham-public-${vp.name}.png`, fullPage: true })
    })
  })
}

// /san-pham/[slug] ở public: ảnh chưa được phép nên không có ảnh, không có khối khám phá, không tên/liên hệ cơ sở.
for (const vp of [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]) {
  test.describe(`hiện vật public ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    async function openProduct(page: Page) {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      const res = await page.goto('/san-pham/chieu-cap-dieu')
      expect(res?.status()).toBe(200)
      await page.locator('main h1').waitFor()
    }

    test('200, không ảnh tham khảo, không khối khám phá, không chữ chưa xác minh, câu chưa có cơ sở', async ({ page }) => {
      await openProduct(page)
      const main = page.locator('main')
      await expect(main.locator('h1')).toHaveText('Chiếu cạp điều')
      const html = await page.content()
      expect(html).not.toMatch(/images\/reference/)
      const srcs = await main.locator('img').evaluateAll((els) => els.map((e) => decodeURIComponent((e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src)))
      expect(srcs.filter((s) => /archive-assets|images\/reference/.test(s))).toEqual([])
      await expect(page.getByRole('button', { name: /^Chi tiết \d/ })).toHaveCount(0)
      await expect(main.getByText('KHÁM PHÁ ĐƯỜNG DỆT')).toHaveCount(0)
      await expect(main.getByRole('button', { name: 'Đóng chi tiết' })).toHaveCount(0)
      const text = await main.evaluate((el) => el.textContent ?? '')
      expect(text).not.toMatch(/\[[^\]]*(cần|chờ)[^\]]*\]/i)
      expect(text).not.toContain('[chỉ ghi khi đã đo]')
      expect(text).not.toContain('[hướng dẫn từ cơ sở dệt]')
      if (vp.width >= 768) {
        await expect(main.getByText('Chưa có cơ sở được xác minh và đồng ý công khai').filter({ visible: true })).toBeVisible()
      }
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(0)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width)
    })

    test('axe: không có vi phạm serious/critical', async ({ page }) => {
      await openProduct(page)
      const { violations } = await new AxeBuilder({ page }).analyze()
      expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
    })

    test('chụp toàn trang hiện vật public', async ({ page }) => {
      test.skip(!process.env.SHOTS_DIR, 'đặt SHOTS_DIR để lưu ảnh chụp')
      await openProduct(page)
      await page.screenshot({ path: `${process.env.SHOTS_DIR}/san-pham-slug-public-${vp.name}.png`, fullPage: true })
    })
  })
}

test('/san-pham/khong-co trả 404', async ({ page }) => {
  const res = await page.goto('/san-pham/khong-co')
  expect(res?.status()).toBe(404)
})

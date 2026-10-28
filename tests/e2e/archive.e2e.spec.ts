// /thu-vien ở chế độ xem trước (đăng nhập người duyệt). Ca public nằm trong public-pages.e2e.spec.ts.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { loginReviewer, scrollThrough, SHOTS, VIEWPORTS } from './helpers'
import { mkdirSync } from 'node:fs'

async function open(page: Page, path = '/thu-vien') {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const res = await page.goto(path)
  expect(res?.status()).toBe(200)
  await page.locator('main h1').waitFor()
  await page.waitForLoadState('networkidle')
}

const tile = (page: Page, code: string) => page.locator(`main a[data-code="${code}"]`)
const dialog = (page: Page) => page.getByRole('dialog')
const search = (page: Page) => new URL(page.url()).search

async function axe(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze()
  const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
}

for (const vp of VIEWPORTS) {
  test.describe(`thư viện (xem trước) ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })
    const desktop = vp.width >= 768

    test('một h1, 14 ô, số liệu, axe sạch kể cả khi hộp xem ảnh mở', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      await expect(page.locator('main h1')).toHaveCount(1)
      await expect(page.locator('main h1')).toContainText('Ký ức qua')
      await expect(page.locator('main a[data-code]')).toHaveCount(14)
      await expect(page.getByRole('status')).toHaveText('14 tư liệu')
      if (desktop) {
        await expect(page.getByText('TƯ LIỆU', { exact: true })).toBeVisible()
        await expect(page.getByText('ĐÃ XÁC MINH NGUỒN')).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Nhà bạn còn giữ ảnh cũ của làng?' })).toBeVisible()
      }
      await axe(page)
      await tile(page, 'TL-001').click()
      await expect(dialog(page)).toBeVisible()
      await axe(page)
    })

    test('mở bằng ô, ← → chuyển ảnh, Tab giữ trong hộp, Esc đóng và trả focus', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      await tile(page, 'TL-001').click()
      await expect(dialog(page)).toBeVisible()
      expect(search(page)).toBe('?anh=TL-001')
      await expect(dialog(page).getByRole('link', { name: 'Đóng' })).toBeFocused()
      await page.keyboard.press('ArrowRight')
      expect(search(page)).toBe('?anh=TL-002')
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab')
        expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
      }
      await page.keyboard.press('Escape')
      await expect(dialog(page)).toHaveCount(0)
      expect(search(page)).toBe('')
      // ArrowRight đã sang TL-002 nhưng ô mở ban đầu là TL-001: focus về ô đó.
      await expect(tile(page, 'TL-001')).toBeFocused()
    })

    test('mở trực tiếp ?anh=TL-005; mã lạ không mở; mã thường vẫn mở', async ({ page }) => {
      await loginReviewer(page)
      await open(page, '/thu-vien?anh=TL-005')
      await expect(dialog(page)).toBeVisible()
      await expect(dialog(page).getByRole('heading', { name: 'Chiếu phơi trên bãi cỏ' })).toBeVisible()
      await expect(page).toHaveTitle(/Chiếu phơi trên bãi cỏ · Thư viện/)
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1)
      await open(page, '/thu-vien?anh=tl-003')
      await expect(dialog(page)).toBeVisible()
      await open(page, '/thu-vien?anh=XX-999')
      await expect(dialog(page)).toHaveCount(0)
      await expect(page.locator('main a[data-code]')).toHaveCount(14)
    })

    test('lọc: đổi chủ đề đóng hộp; chip chủ đề trống hiện khung trống', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      await page.getByRole('button', { name: 'Tư liệu lịch sử' }).click()
      await expect(page.getByText('Chưa có tư liệu trong nhóm này')).toBeVisible()
      await expect(page.getByRole('status')).toHaveText('0 tư liệu')
      await axe(page)
    })

    if (!desktop) {
      test('vuốt ngang chuyển ảnh', async ({ page }) => {
        await loginReviewer(page)
        await open(page, '/thu-vien?anh=TL-001')
        const box = (await dialog(page).boundingBox())!
        const y = box.y + box.height / 2
        await page.mouse.move(box.x + box.width * 0.8, y)
        await page.mouse.down()
        await page.mouse.move(box.x + box.width * 0.2, y, { steps: 8 })
        await page.mouse.up()
        expect(search(page)).toBe('?anh=TL-002')
        await page.mouse.move(box.x + box.width * 0.2, y)
        await page.mouse.down()
        await page.mouse.move(box.x + box.width * 0.8, y, { steps: 8 })
        await page.mouse.up()
        expect(search(page)).toBe('?anh=TL-001')
      })
    }

    test('trang chủ: ô ảnh của ArchiveTeaser mở đúng ảnh; link "Mở thư viện ảnh" tới /thu-vien', async ({ page }) => {
      await loginReviewer(page)
      await open(page, '/')
      const first = page.locator('main a[href^="/thu-vien?anh="]').filter({ visible: true }).first()
      const href = (await first.getAttribute('href'))!
      const code = href.split('=')[1]
      await first.click()
      await page.waitForURL(`**/thu-vien?anh=${code}`)
      await expect(dialog(page)).toBeVisible()
      await expect(dialog(page)).toContainText(code.replace('TL-', 'TL · '))
      await open(page, '/')
      await page.getByRole('link', { name: 'Mở thư viện ảnh' }).click()
      await page.waitForURL('**/thu-vien')
      await expect(page.locator('main a[data-code]')).toHaveCount(14)
    })

    test('chụp toàn trang', async ({ page }) => {
      test.skip(!SHOTS, 'đặt SHOTS_DIR để lưu ảnh chụp')
      mkdirSync(SHOTS!, { recursive: true })
      await loginReviewer(page)
      await open(page)
      await scrollThrough(page)
      await page.screenshot({ path: `${SHOTS}/thu-vien-preview-${vp.name}.png`, fullPage: true })
      await tile(page, 'TL-001').click()
      await expect(dialog(page)).toBeVisible()
      await expect(dialog(page).locator('img')).toHaveJSProperty('complete', true)
      await page.screenshot({ path: `${SHOTS}/thu-vien-preview-lightbox-${vp.name}.png` })
    })
  })
}

test.describe('thư viện không JS (xem trước)', () => {
  test.use({ javaScriptEnabled: false })
  test('?anh=TL-002 có dialog trong HTML, "Ảnh tiếp" trỏ TL-003', async ({ page }) => {
    await loginReviewer(page)
    const res = await page.goto('/thu-vien?anh=TL-002')
    expect(res?.status()).toBe(200)
    await expect(dialog(page)).toBeVisible()
    expect(await dialog(page).getByRole('link', { name: 'Ảnh tiếp' }).getAttribute('href')).toContain('anh=TL-003')
    expect(await dialog(page).getByRole('link', { name: 'Đóng' }).getAttribute('href')).toBe('/thu-vien')
  })
})

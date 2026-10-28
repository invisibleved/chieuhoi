// /ket-noi ở chế độ xem trước (đăng nhập người duyệt). Ca public nằm trong public-pages.e2e.spec.ts.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { loginReviewer, SHOTS, smallTargets, VIEWPORTS } from './helpers'

async function open(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const res = await page.goto('/ket-noi')
  expect(res?.status()).toBe(200)
  await page.waitForLoadState('networkidle')
}

const submitBtn = (page: Page) => page.getByRole('button', { name: 'Gửi đóng góp' })
const fillValid = async (page: Page) => {
  await page.getByLabel('Họ và tên').fill('Lan')
  await page.getByLabel('Số điện thoại hoặc email').fill('lan@example.com')
  await page.getByText(/Tôi là chủ sở hữu/).click()
}
async function axeClean(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze()
  const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
}
async function shoot(page: Page, name: string, vp: { name: string }) {
  if (!SHOTS) return
  mkdirSync(`${SHOTS}/ket-noi`, { recursive: true })
  await page.screenshot({ path: `${SHOTS}/ket-noi/preview-${name}-${vp.name}.png`, fullPage: true })
}

for (const vp of VIEWPORTS) {
  test.describe(`kết nối (xem trước) ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })
    const desktop = vp.width >= 768

    test('một h1 có em, placeholder liên hệ, bốn cách chỉ ở desktop, axe sạch', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      await expect(page.locator('main h1')).toHaveCount(1)
      await expect(page.locator('main h1 em')).toHaveText('Chuyện nghề vẫn được kể tiếp.')
      await expect(page.getByText('[Email liên hệ]').filter({ visible: true })).toHaveCount(1)
      await expect(page.getByText('Hợp tác văn hoá'))[desktop ? 'toBeVisible' : 'toBeHidden']()
      await expect(page.getByRole('note').filter({ visible: true })).toContainText('Bản minh hoạ')
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width)
      if (!desktop) expect(await smallTargets(page)).toEqual([])
      await axeClean(page)
      await shoot(page, 'default', vp)
    })

    test('gửi trống: 3 lỗi, khung tổng hợp được focus; điền tên thì còn 2; axe sạch', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      await submitBtn(page).click()
      const alert = page.locator('main [role=alert]')
      await expect(alert).toContainText('Còn 3 mục cần bổ sung.')
      await expect(alert).toBeFocused()
      await expect(page.getByText('Vui lòng cho biết tên để chúng tôi xưng hô.')).toBeVisible()
      await expect(page.getByText('Cần một cách liên lạc để xác minh đóng góp.')).toBeVisible()
      await expect(page.getByText('Cần xác nhận quyền chia sẻ trước khi gửi.')).toBeVisible()
      await axeClean(page)
      await shoot(page, 'error', vp)
      await page.getByLabel('Họ và tên').fill('Lan')
      await expect(alert).toContainText('Còn 2 mục cần bổ sung.')
    })

    test('điền đủ: màn hình thành công có minh hoạ, không request, URL không đổi, axe sạch', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      const url = page.url()
      const requests: string[] = []
      page.on('request', (r) => {
        if (['fetch', 'xhr', 'document'].includes(r.resourceType())) requests.push(`${r.resourceType()} ${r.url()}`)
      })
      await fillValid(page)
      await submitBtn(page).click()
      const status = page.getByRole('status')
      await expect(status).toContainText('Cảm ơn Lan.')
      await expect(status).toContainText('minh hoạ')
      await expect(status).toContainText('lan@example.com')
      await page.waitForTimeout(400)
      expect(requests).toEqual([])
      expect(page.url()).toBe(url)
      expect(await page.evaluate(() => localStorage.length)).toBe(0)
      await axeClean(page)
      await shoot(page, 'success', vp)
      await page.getByRole('button', { name: 'Góp thêm một ký ức' }).click()
      await expect(page.getByLabel('Họ và tên')).toBeFocused()
      await expect(page.getByLabel('Họ và tên')).toHaveValue('')
    })

    test('bàn phím: Tab theo thứ tự nhìn thấy, Space tick đồng ý, mũi tên đổi lựa chọn', async ({ page }) => {
      await loginReviewer(page)
      await open(page)
      await page.getByLabel('Họ và tên').focus()
      const order: string[] = []
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab')
        order.push(
          await page.evaluate(() => {
            const el = document.activeElement as HTMLInputElement
            return el.id || `${el.tagName.toLowerCase()}:${el.type}:${el.value}`
          }),
        )
      }
      expect(order).toEqual(['c-contact', 'input:radio:photo', 'c-story', 'c-consent', 'button:submit:'])
      await page.getByLabel(/Tôi là chủ sở hữu/).focus()
      await page.keyboard.press('Space')
      await expect(page.getByLabel(/Tôi là chủ sở hữu/)).toBeChecked()
      // Radio: focus ô đầu, ↓ thì ô thứ hai được chọn (jsdom không thử được, Task 6).
      const radios = page.getByRole('radio')
      await radios.first().focus()
      await page.keyboard.press('ArrowDown')
      await expect(radios.nth(1)).toBeChecked()
      await expect(radios.nth(1)).toBeFocused()
    })
  })
}

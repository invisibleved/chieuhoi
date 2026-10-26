import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const LABELS = ['Làng Hới', 'Câu chuyện', 'Nghề dệt chiếu', 'Con người', 'Sản phẩm', 'Thư viện']

test.describe('desktop 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('header desktop có 6 mục đánh số và Kết nối', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Điều hướng chính' })
    await expect(nav.getByRole('link')).toHaveCount(6)
    for (const [i, label] of LABELS.entries()) {
      const link = nav.getByRole('link').nth(i)
      await expect(link).toContainText(`0${i + 1}`)
      await expect(link).toContainText(label)
    }
    await expect(page.locator('header').getByRole('link', { name: 'Kết nối' })).toHaveAttribute(
      'href',
      '/ket-noi',
    )
  })

  test('trang hiện tại có aria-current', async ({ page }) => {
    await page.goto('/lang-hoi')
    const nav = page.getByRole('navigation', { name: 'Điều hướng chính' })
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1)
    await expect(nav.locator('[aria-current="page"]')).toContainText('Làng Hới')
    await page.goto('/')
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(0)
  })

  test('EN bị vô hiệu', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header').getByRole('button', { name: 'EN', exact: true })).toBeDisabled()
  })

  test('footer full ở / và compact ở trang khác', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Khám phá' })).toBeVisible()
    await page.goto('/lang-hoi')
    await expect(page.getByRole('navigation', { name: 'Khám phá' })).toHaveCount(0)
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Đường dẫn' })).toBeVisible()
  })

  test('axe không có lỗi serious/critical ở / (1440)', async ({ page }) => {
    await page.goto('/')
    const r = await new AxeBuilder({ page }).analyze()
    expect(r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([])
  })
})

test.describe('mobile 390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('menu mobile mở/đóng bằng bàn phím', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'Mở menu' })
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const menu = page.getByRole('dialog', { name: 'Menu' })
    await expect(menu.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link')).toHaveCount(6)
    await expect(menu.getByRole('button', { name: 'Đóng menu' })).toBeFocused()
    // Tab giữ trong menu
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toBeFocused()
    await expect(menu).toBeHidden()
  })

  test('nút menu ≥ 44px', async ({ page }) => {
    await page.goto('/')
    const box = await page.getByRole('button', { name: 'Mở menu' }).boundingBox()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  test('không có nav desktop ở mobile; EN trong menu bị vô hiệu', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Mở menu' }).click()
    await expect(page.getByRole('dialog').getByRole('button', { name: 'EN', exact: true })).toBeDisabled()
  })

  test('axe không có lỗi serious/critical ở / (390)', async ({ page }) => {
    await page.goto('/')
    const r = await new AxeBuilder({ page }).analyze()
    expect(r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([])
  })
})

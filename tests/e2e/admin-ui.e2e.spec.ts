import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { loginReviewer, VIEWPORTS } from './helpers'

test.describe('nhận diện', () => {
  test('trang đăng nhập có logo Chiếu Hới và hướng dẫn quên mật khẩu', async ({ page }) => {
    await page.goto('/admin/login')
    const logo = page.locator('.ch-admin-logo')
    await expect(logo).toContainText('CHIẾU HỚI')
    await expect(logo).toContainText('Quản lý nội dung')
    await expect(logo.locator('img, svg')).toHaveCount(0)
    await expect(logo).not.toContainText('Payload')
    await expect(page.getByText('Quên mật khẩu? Nhờ người duyệt đặt lại.')).toBeVisible()
    await expect(page.getByRole('link', { name: /Quên mật khẩu/ })).toHaveCount(0)
  })

  for (const vp of VIEWPORTS) {
    test(`đăng nhập không vi phạm axe ở ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/admin/login')
      await expect(page.locator('.ch-admin-logo')).toBeVisible()
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
      expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
    })
  }

  test('thanh trên của /admin có biểu tượng CH', async ({ page }) => {
    await loginReviewer(page)
    await page.goto('/admin')
    const icon = page.locator('.step-nav__home .ch-admin-icon:visible').first()
    await expect(icon).toContainText('CH')
    await expect.poll(async () => (await icon.boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(24)
  })
})

import { expect, test } from '@playwright/test'

import { loginReviewer } from './helpers'

const bar = (page: import('@playwright/test').Page) => page.getByRole('complementary', { name: 'Chế độ xem trước' })

test('chưa đăng nhập: /preview trả 401 và không đặt cookie __prerender_bypass', async ({ page, context }) => {
  const res = await page.request.get('/preview?path=/', { maxRedirects: 0 })
  expect(res.status()).toBe(401)
  expect((await context.cookies()).some((c) => c.name === '__prerender_bypass')).toBe(false)
})

test('người duyệt: /preview?path=/cau-chuyen bật Draft Mode, hiện PreviewBar, thoát thì mất', async ({ page }) => {
  await loginReviewer(page)
  await page.goto('/preview?path=/cau-chuyen')
  await expect(page).toHaveURL(/\/cau-chuyen$/)
  await expect(bar(page)).toBeVisible()
  await page.getByRole('link', { name: 'Thoát xem trước' }).click()
  await expect(page).toHaveURL(/\/cau-chuyen$/)
  await expect(bar(page)).toHaveCount(0)
})

test('path ngoài bị đưa về /', async ({ page }) => {
  await loginReviewer(page)
  await page.goto('/preview?path=//evil.example')
  expect(new URL(page.url()).pathname).toBe('/')
  expect(new URL(page.url()).hostname).toBe('localhost')
})

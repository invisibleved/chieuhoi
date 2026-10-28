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

test('/preview và /preview/exit: 307 không cho cache', async ({ page }) => {
  await loginReviewer(page)
  for (const path of ['/preview?path=/cau-chuyen', '/preview/exit?path=/cau-chuyen']) {
    const res = await page.request.get(path, { maxRedirects: 0 })
    expect(res.status()).toBe(307)
    expect(res.headers()['location']).toBe('/cau-chuyen')
    expect(res.headers()['cache-control']).toContain('no-store')
    expect(res.headers()['cache-control']).toContain('private')
  }
})

test('đăng xuất admin thì cookie Draft Mode còn lại không mở được xem trước', async ({ page, browser }) => {
  // Dùng biên tập viên tạm có phiên riêng: đăng xuất phiên người duyệt dùng chung sẽ làm hỏng test khác.
  await loginReviewer(page)
  const rand = Math.random().toString(36).slice(2, 8)
  const email = `editor-e2e-preview-${rand}@example.com`
  const password = `E2e-${rand}-Passw0rd!`
  const created = await page.request.post('/api/users', { data: { email, password, role: 'editor' } })
  expect(created.ok(), await created.text()).toBe(true)
  const userId = (await created.json()).doc.id
  const ctx = await browser.newContext({ baseURL: 'http://localhost:3000' })
  try {
    const login = await ctx.request.post('/api/users/login', { data: { email, password } })
    expect(login.ok(), await login.text()).toBe(true)
    const editor = await ctx.newPage()
    await editor.goto('/preview?path=/cau-chuyen')
    await expect(editor).toHaveURL(/\/cau-chuyen$/)
    await expect(bar(editor)).toBeVisible()
    const logout = await ctx.request.post('/api/users/logout')
    expect(logout.ok(), await logout.text()).toBe(true)
    expect((await ctx.cookies()).some((c) => c.name === '__prerender_bypass')).toBe(true)
    await editor.reload()
    await expect(editor).toHaveURL(/\/cau-chuyen$/)
    await expect(bar(editor)).toHaveCount(0)
  } finally {
    await ctx.close()
    await page.request.delete(`/api/users/${userId}`)
  }
})

test('path ngoài bị đưa về /', async ({ page }) => {
  await loginReviewer(page)
  await page.goto('/preview?path=//evil.example')
  expect(new URL(page.url()).pathname).toBe('/')
  expect(new URL(page.url()).hostname).toBe('localhost')
})

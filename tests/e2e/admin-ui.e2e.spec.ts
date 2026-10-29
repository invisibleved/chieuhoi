import AxeBuilder from '@axe-core/playwright'
import { expect, test, type BrowserContext, type Page } from '@playwright/test'

import { loginReviewer, smallTargets, VIEWPORTS } from './helpers'

test.describe('giao diện gốc', () => {
  test('trang đăng nhập dùng logo Payload gốc, không còn ghi đè', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('.graphic-logo')).toBeVisible()
    await expect(page.locator('.ch-admin-logo')).toHaveCount(0)
  })
})

test.describe('hướng dẫn', () => {
  test.describe.configure({ mode: 'serial' })

  const rand = Math.random().toString(36).slice(2, 8)
  const editorEmail = `editor-guide-${rand}@example.com`
  const editorPassword = `E2e-${rand}-Passw0rd!`

  let reviewerCtx: BrowserContext
  let editorCtx: BrowserContext
  let reviewerPage: Page
  let editorPage: Page
  let userId: number | string | undefined

  test.beforeAll(async ({ browser, baseURL }) => {
    reviewerCtx = await browser.newContext({ baseURL })
    reviewerPage = await reviewerCtx.newPage()
    await loginReviewer(reviewerPage)
    const created = await reviewerCtx.request.post('/api/users', {
      data: { email: editorEmail, password: editorPassword, role: 'editor' },
    })
    expect(created.ok(), await created.text()).toBe(true)
    userId = (await created.json()).doc.id
    editorCtx = await browser.newContext({ baseURL })
    const login = await editorCtx.request.post('/api/users/login', {
      data: { email: editorEmail, password: editorPassword },
    })
    expect(login.ok(), await login.text()).toBe(true)
    editorPage = await editorCtx.newPage()
  })

  test.afterAll(async () => {
    try {
      if (userId !== undefined) await reviewerCtx.request.delete(`/api/users/${userId}`)
    } finally {
      await editorCtx?.close()
      await reviewerCtx?.close()
    }
  })

  const sectionTitles = (page: Page) => page.locator('.ch-guide__section-title')

  test('biên tập viên mở Hướng dẫn từ menu, thấy 8 mục, không có phần người duyệt', async () => {
    await editorPage.setViewportSize({ width: 1440, height: 900 })
    await editorPage.goto('/admin')
    // ở 1440 Payload thu gọn menu: người dùng mới phải bấm nút ba gạch trước
    await editorPage.getByRole('button', { name: 'Mở Menu' }).first().click()
    await editorPage.locator('nav a').filter({ hasText: /^Hướng dẫn$/ }).click()
    await expect(editorPage).toHaveURL(/\/admin\/huong-dan$/)
    await expect(editorPage.getByRole('heading', { level: 1, name: 'Hướng dẫn' })).toBeVisible()
    // câu mở đầu chỉ chỗ mở menu
    await expect(editorPage.locator('.ch-guide__intro').first()).toContainText('ba gạch ngang ở góc trên bên trái')
    await expect(sectionTitles(editorPage)).toHaveCount(8)
    // exact: bước "Nút đó chỉ dành cho người duyệt." có cụm chữ này nhưng không phải tiêu đề phần
    await expect(editorPage.getByText('Dành cho người duyệt', { exact: true })).toHaveCount(0)
    await expect(editorPage.getByText('Dành cho mọi người', { exact: true })).toHaveCount(2)
    // mục lục là danh sách link neo tới từng mục
    const toc = editorPage.getByRole('navigation', { name: 'Mục lục' }).getByRole('link')
    await expect(toc).toHaveCount(8)
    await expect(toc.first()).toHaveAttribute('href', '#dang-nhap')
  })

  test('người duyệt thấy đủ 12 mục, chia hai phần', async () => {
    await reviewerPage.setViewportSize({ width: 1440, height: 900 })
    await reviewerPage.goto('/admin/huong-dan')
    await expect(sectionTitles(reviewerPage)).toHaveCount(12)
    await expect(reviewerPage.getByRole('heading', { level: 2, name: 'Dành cho mọi người' })).toBeVisible()
    await expect(reviewerPage.getByRole('heading', { level: 2, name: 'Dành cho người duyệt' })).toBeVisible()
  })

  test('mọi ảnh trên trang tải được ở 1440 và 390', async () => {
    for (const vp of VIEWPORTS) {
      await reviewerPage.setViewportSize({ width: vp.width, height: vp.height })
      await reviewerPage.goto('/admin/huong-dan')
      const imgs = reviewerPage.locator('.ch-guide img')
      expect(await imgs.count()).toBeGreaterThan(0)
      await expect
        .poll(() =>
          imgs.evaluateAll((els) =>
            (els as HTMLImageElement[]).filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc),
          ),
        )
        .toEqual([])
    }
  })

  test('ở 390px trang không cuộn ngang, ảnh có bản điện thoại thì dùng bản đó', async () => {
    await reviewerPage.setViewportSize({ width: 390, height: 844 })
    await reviewerPage.goto('/admin/huong-dan')
    await expect(sectionTitles(reviewerPage)).toHaveCount(12)
    expect(await reviewerPage.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    const mobile = reviewerPage.locator('.ch-guide img[src="/admin-guide/mo-menu.png"]')
    await expect
      .poll(() => mobile.evaluate((i) => (i as HTMLImageElement).currentSrc))
      .toMatch(/mo-menu-mobile\.png$/)
    expect(await smallTargets(reviewerPage, '.ch-guide__toc')).toEqual([])
  })

  for (const role of ['biên tập viên', 'người duyệt'] as const) {
    for (const vp of VIEWPORTS) {
      test(`trang hướng dẫn của ${role} không vi phạm axe ở ${vp.name}`, async () => {
        const page = role === 'người duyệt' ? reviewerPage : editorPage
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.goto('/admin/huong-dan')
        await expect(sectionTitles(page)).toHaveCount(role === 'người duyệt' ? 12 : 8)
        // Chỉ quét nội dung trang hướng dẫn: khung admin gốc của Payload (bộ chọn ngôn ngữ...) không thuộc phần mình viết.
        const res = await new AxeBuilder({ page })
          .include('.ch-guide')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
        expect(
          res.violations.map(
            (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
          ),
        ).toEqual([])
      })
    }
  }

  test('chưa đăng nhập mà mở /admin/huong-dan thì về trang đăng nhập', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ baseURL })
    try {
      const page = await ctx.newPage()
      await page.goto('/admin/huong-dan')
      await expect(page).toHaveURL(/\/admin\/login\?redirect=%2Fadmin%2Fhuong-dan$/)
      await expect(page.locator('.ch-guide')).toHaveCount(0)
    } finally {
      await ctx.close()
    }
  })
})

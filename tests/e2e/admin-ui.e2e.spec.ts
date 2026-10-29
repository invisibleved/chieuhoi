import AxeBuilder from '@axe-core/playwright'
import { expect, test, type APIRequestContext, type BrowserContext, type Page } from '@playwright/test'

import { loginReviewer, smallTargets, VIEWPORTS } from './helpers'

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

test.describe('menu theo vai trò', () => {
  test.describe.configure({ mode: 'serial' })

  const rand = Math.random().toString(36).slice(2, 8)
  const editorEmail = `editor-menu-${rand}@example.com`
  const editorPassword = `E2e-${rand}-Passw0rd!`
  const sourceTitle = `Nguồn e2e menu ${rand}`
  const HIDDEN = ['Người dùng', 'Nguồn', 'Thông tin site', 'Phần mở đầu trang']

  let reviewerCtx: BrowserContext
  let editorCtx: BrowserContext
  let reviewerPage: Page
  let editorPage: Page
  let reviewerApi: APIRequestContext
  let userId: number | string | undefined

  test.beforeAll(async ({ browser, baseURL }) => {
    reviewerCtx = await browser.newContext({ baseURL })
    reviewerPage = await reviewerCtx.newPage()
    await loginReviewer(reviewerPage)
    reviewerApi = reviewerCtx.request

    const created = await reviewerApi.post('/api/users', { data: { email: editorEmail, password: editorPassword, role: 'editor' } })
    expect(created.ok(), await created.text()).toBe(true)
    userId = (await created.json()).doc.id

    editorCtx = await browser.newContext({ baseURL })
    const login = await editorCtx.request.post('/api/users/login', { data: { email: editorEmail, password: editorPassword } })
    expect(login.ok(), await login.text()).toBe(true)
    editorPage = await editorCtx.newPage()
  })

  test.afterAll(async () => {
    try {
      const found = await reviewerApi.get(`/api/sources?where[title][equals]=${encodeURIComponent(sourceTitle)}&limit=10&depth=0`)
      for (const doc of (await found.json()).docs ?? []) await reviewerApi.delete(`/api/sources/${doc.id}`)
    } finally {
      try {
        if (userId !== undefined) await reviewerApi.delete(`/api/users/${userId}`)
      } finally {
        await editorCtx?.close()
        await reviewerCtx?.close()
      }
    }
  })

  const navLink = (page: Page, name: string) => page.locator('nav a').filter({ hasText: new RegExp(`^${name}$`) })

  test('biên tập viên không thấy 4 mục quản trị, vẫn thấy Bài viết', async () => {
    await editorPage.goto('/admin')
    await expect(navLink(editorPage, 'Bài viết')).toBeVisible()
    for (const name of HIDDEN) await expect(navLink(editorPage, name)).toHaveCount(0)
  })

  test('người duyệt thấy cả 4 mục', async () => {
    await reviewerPage.goto('/admin')
    await expect(navLink(reviewerPage, 'Bài viết')).toBeVisible()
    for (const name of HIDDEN) await expect(navLink(reviewerPage, name)).toBeVisible()
  })

  test('URL của mục ẩn vẫn mở được với biên tập viên', async () => {
    const account = await editorPage.goto('/admin/account')
    expect(account?.status()).toBe(200)
    await expect(editorPage.locator('#field-email')).toBeVisible()
    const create = await editorPage.goto('/admin/collections/sources/create')
    expect(create?.status()).toBe(200)
    await expect(editorPage.locator('#field-sourceId')).toBeVisible()
  })

  test('nút "+" cạnh ô Nguồn của bài viết vẫn tạo được nguồn mới', async () => {
    await editorPage.goto('/admin/collections/stories/create')
    const add = editorPage.getByRole('button', { name: 'Thêm mới: Nguồn' })
    const field = editorPage.locator('.field-type.relationship').filter({ has: add })
    await add.click()
    const drawer = editorPage.locator('.drawer__content')
    await expect(drawer).toBeVisible()
    await drawer.locator('#field-sourceId').fill(`e2e-menu-${rand}`)
    await drawer.locator('#field-title').fill(sourceTitle)
    await drawer.locator('#action-save').click()
    // Payload giữ hộp mở sau khi lưu (hiện bản ghi vừa tạo); biên tập viên không có quyền sửa nguồn nên các ô bị khoá.
    await expect(drawer.locator('#field-title')).toBeDisabled()
    await drawer.getByRole('button', { name: 'Đóng' }).first().click()
    await expect(drawer).toBeHidden()
    await expect(field).toContainText(sourceTitle)
  })
})

test.describe('trang đầu', () => {
  test.describe.configure({ mode: 'serial' })

  const rand = Math.random().toString(36).slice(2, 8)
  const editorEmail = `editor-home-${rand}@example.com`
  const editorPassword = `E2e-${rand}-Passw0rd!`
  const BUTTONS = ['Tải ảnh lên', 'Viết bài mới', 'Thêm người', 'Thêm sản phẩm', 'Xem hướng dẫn']

  let reviewerCtx: BrowserContext
  let editorCtx: BrowserContext
  let reviewerPage: Page
  let editorPage: Page
  let userId: number | string | undefined
  let storyId: number | string | undefined

  test.beforeAll(async ({ browser, baseURL }) => {
    reviewerCtx = await browser.newContext({ baseURL })
    reviewerPage = await reviewerCtx.newPage()
    await loginReviewer(reviewerPage)
    const created = await reviewerCtx.request.post('/api/users', {
      data: { email: editorEmail, password: editorPassword, role: 'editor' },
    })
    expect(created.ok(), await created.text()).toBe(true)
    userId = (await created.json()).doc.id
    // một bài đang chờ duyệt để widget Đang chờ duyệt có nội dung xác định
    const story = await reviewerCtx.request.post('/api/stories?draft=true', {
      data: { title: `Bài e2e trang đầu ${rand}`, slug: `e2e-trang-dau-${rand}`, category: 'history', workflow: 'in_review', _status: 'draft' },
    })
    expect(story.ok(), await story.text()).toBe(true)
    storyId = (await story.json()).doc.id
    editorCtx = await browser.newContext({ baseURL })
    const login = await editorCtx.request.post('/api/users/login', {
      data: { email: editorEmail, password: editorPassword },
    })
    expect(login.ok(), await login.text()).toBe(true)
    editorPage = await editorCtx.newPage()
  })

  test.afterAll(async () => {
    try {
      if (storyId !== undefined) await reviewerCtx.request.delete(`/api/stories/${storyId}`)
    } finally {
      try {
        if (userId !== undefined) await reviewerCtx.request.delete(`/api/users/${userId}`)
      } finally {
        await editorCtx?.close()
        await reviewerCtx?.close()
      }
    }
  })

  const widget = (page: Page, name: string) =>
    page
      .locator('section.ch-widget')
      .filter({ has: page.getByRole('heading', { name, exact: true }) })

  test('biên tập viên thấy 5 nút việc thường làm, Tất cả mục không có Người dùng', async () => {
    await editorPage.goto('/admin')
    const tasks = widget(editorPage, 'Việc thường làm')
    await expect(tasks).toBeVisible()
    await expect(tasks.getByRole('link')).toHaveText(BUTTONS)
    await expect(
      editorPage.getByRole('heading', { name: 'Đang chờ duyệt', exact: true }),
    ).toHaveCount(0)
    const all = widget(editorPage, 'Tất cả mục')
    await expect(all).toBeVisible()
    await expect(all.getByRole('heading', { name: 'Bài viết' })).toBeVisible()
    await expect(all.getByRole('heading', { name: 'Người dùng' })).toHaveCount(0)
    await expect(all.getByRole('heading', { name: 'Nguồn', exact: true })).toHaveCount(0)
    // widget `collections` mặc định của Payload đã được gỡ: chỉ có một lưới mục
    await expect(editorPage.locator('.collections')).toHaveCount(0)
  })

  test('bấm Viết bài mới mở trang tạo bài viết', async () => {
    await editorPage.goto('/admin')
    await widget(editorPage, 'Việc thường làm').getByRole('link', { name: 'Viết bài mới' }).click()
    await expect(editorPage).toHaveURL(/\/admin\/collections\/stories\/create$/)
  })

  test('người duyệt thấy Đang chờ duyệt và Người dùng trong Tất cả mục', async () => {
    await reviewerPage.goto('/admin')
    const pending = widget(reviewerPage, 'Đang chờ duyệt')
    await expect(pending).toBeVisible()
    await expect(pending.getByRole('link', { name: /^Bài viết — [1-9]\d*$/ })).toBeVisible()
    await expect(
      widget(reviewerPage, 'Tất cả mục').getByRole('heading', { name: 'Người dùng' }),
    ).toBeVisible()
  })

  test('ở 390px các nút xếp một cột và đủ lớn', async () => {
    await editorPage.setViewportSize({ width: 390, height: 844 })
    await editorPage.goto('/admin')
    const links = widget(editorPage, 'Việc thường làm').getByRole('link')
    const boxes = await links.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()))
    expect(boxes).toHaveLength(5)
    expect(new Set(boxes.map((b) => Math.round(b.x))).size).toBe(1)
    // admin không có <main>: quét trong widget, và bảo đảm phạm vi quét có đủ 5 nút việc
    const scope = 'section.ch-widget'
    expect(await editorPage.locator(`${scope} .ch-tasks__btn`).count()).toBe(5)
    expect(await smallTargets(editorPage, scope)).toEqual([])
  })

  for (const role of ['biên tập viên', 'người duyệt'] as const) {
    for (const vp of VIEWPORTS) {
      test(`trang đầu của ${role} không vi phạm axe ở ${vp.name}`, async () => {
        const page = role === 'người duyệt' ? reviewerPage : editorPage
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.goto('/admin')
        await expect(widget(page, 'Tất cả mục')).toBeVisible()
        const res = await new AxeBuilder({ page })
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
})

// Quy trình biên tập viên -> người duyệt trên bản build production (cổng 3100, PREVIEW_ALL=false). Project "workflow".
import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from '@playwright/test'

import { loginReviewer } from './helpers'

test.describe.configure({ mode: 'serial' })

const rand = Math.random().toString(36).slice(2, 8)
const slug = `e2e-quy-trinh-${rand}`
const title = `Bài e2e quy trình ${rand}`
const editedTitle = `${title} (nháp)`
const editorEmail = `editor-e2e-${rand}@example.com`
const editorPassword = `E2e-${rand}-Passw0rd!`

let reviewerCtx: BrowserContext
let editorCtx: BrowserContext
let reviewerPage: Page
let editorPage: Page
let reviewerApi: APIRequestContext
let storyId: number | string | undefined
let userId: number | string | undefined

const BASE = 'http://localhost:3100'

/** Context sạch, không cookie, để xem như khách. */
async function publicStatus(browser: Browser, path: string) {
  const ctx = await browser.newContext({ baseURL: BASE })
  try {
    const res = await ctx.request.get(path)
    return { status: res.status(), text: await res.text() }
  } finally {
    await ctx.close()
  }
}

test.beforeAll(async ({ browser }) => {
  reviewerCtx = await browser.newContext({ baseURL: BASE })
  reviewerPage = await reviewerCtx.newPage()
  await loginReviewer(reviewerPage)
  reviewerApi = reviewerCtx.request

  const created = await reviewerApi.post('/api/users', {
    data: { email: editorEmail, password: editorPassword, role: 'editor' },
  })
  expect(created.ok(), await created.text()).toBe(true)
  userId = (await created.json()).doc.id

  editorCtx = await browser.newContext({ baseURL: BASE })
  const login = await editorCtx.request.post('/api/users/login', { data: { email: editorEmail, password: editorPassword } })
  expect(login.ok(), await login.text()).toBe(true)
  editorPage = await editorCtx.newPage()
})

test.afterAll(async () => {
  try {
    // Xoá theo id nếu còn; luôn quét thêm theo đường dẫn để không sót bản nháp tạo bởi autosave/lỗi giữa chừng.
    if (storyId !== undefined) await reviewerApi.delete(`/api/stories/${storyId}`)
    const found = await reviewerApi.get(`/api/stories?where[slug][equals]=${slug}&draft=true&limit=10&depth=0`)
    for (const doc of (await found.json()).docs ?? []) await reviewerApi.delete(`/api/stories/${doc.id}`)
  } finally {
    try {
      if (userId !== undefined) await reviewerApi.delete(`/api/users/${userId}`)
    } finally {
      await editorCtx?.close()
      await reviewerCtx?.close()
    }
  }
})

test('biên tập viên tạo nháp, gửi duyệt, không đăng được', async ({ browser }) => {
  await editorPage.goto('/admin/collections/stories/create')
  await editorPage.locator('#field-title').fill(title)
  await editorPage.locator('#field-slug').fill(slug)
  await editorPage.locator('#field-workflow').click()
  await editorPage.getByRole('option', { name: 'Chờ duyệt' }).click()
  await editorPage.getByRole('button', { name: 'Lưu bản nháp' }).click()
  await expect(editorPage).toHaveURL(/\/admin\/collections\/stories\/(?!create)[^/?]+$/, { timeout: 20_000 })
  storyId = editorPage.url().split('/').pop()!
  await expect(editorPage.locator('#field-slug')).toHaveValue(slug)

  const publish = await editorCtx.request.patch(`/api/stories/${storyId}`, { data: { _status: 'published' } })
  expect(publish.status(), await publish.text()).toBe(403)

  expect((await publicStatus(browser, `/cau-chuyen/${slug}`)).status).toBe(404)
})

test('người duyệt xem trước bản nháp từ admin', async () => {
  await reviewerPage.goto(`/admin/collections/stories/${storyId}`)
  const [tab] = await Promise.all([
    reviewerCtx.waitForEvent('page'),
    reviewerPage.getByRole('link', { name: 'Bản xem trước' }).click(),
  ])
  await expect(tab).toHaveURL(new RegExp(`/cau-chuyen/${slug}$`), { timeout: 20_000 })
  await expect(tab.getByRole('heading', { level: 1, name: title })).toBeVisible()
  await expect(tab.getByRole('complementary', { name: 'Chế độ xem trước' })).toBeVisible()
  await tab.close()
})

test('người duyệt đăng → công khai hiện ngay; nháp của biên tập viên không lộ; đăng bản sửa → công khai đổi', async ({ browser }) => {
  test.setTimeout(120_000)
  await reviewerPage.goto(`/admin/collections/stories/${storyId}`)
  await reviewerPage.getByRole('button', { name: 'Xuất bản tài liệu', exact: true }).click()

  const pub = await browser.newContext({ baseURL: BASE })
  try {
    const page = await pub.newPage()
    await expect
      .poll(async () => (await page.goto(`/cau-chuyen/${slug}`))?.status(), { timeout: 15_000 })
      .toBe(200)
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
    await page.goto('/cau-chuyen')
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible()

    // Biên tập viên lưu bản nháp mới: công khai vẫn bản cũ.
    await editorPage.goto(`/admin/collections/stories/${storyId}`)
    await editorPage.locator('#field-title').fill(editedTitle)
    await editorPage.getByRole('button', { name: 'Lưu bản nháp' }).click()
    await expect
      .poll(async () => (await (await reviewerApi.get(`/api/stories/${storyId}?draft=true`)).json()).title, { timeout: 20_000 })
      .toBe(editedTitle)

    // Bản nháp đã lưu; một revalidate muộn có thể đến sau, nên đọc nhiều lần cách nhau và đều phải còn bản cũ.
    for (let i = 0; i < 4; i++) {
      await page.goto(`/cau-chuyen/${slug}`)
      await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible()
      expect(await page.content()).not.toContain('(nháp)')
      const list = await page.goto('/cau-chuyen')
      expect(await list!.text()).not.toContain(editedTitle)
      await page.waitForTimeout(1000)
    }

    // Người duyệt đăng bản sửa.
    await reviewerPage.goto(`/admin/collections/stories/${storyId}`)
    await expect(reviewerPage.locator('#field-title')).toHaveValue(editedTitle)
    await reviewerPage.getByRole('button', { name: 'Xuất bản tài liệu', exact: true }).click()
    await expect
      .poll(async () => {
        await page.goto(`/cau-chuyen/${slug}`)
        return page.getByRole('heading', { level: 1 }).first().textContent()
      }, { timeout: 15_000 })
      .toBe(editedTitle)
    // Thẻ ở danh sách cũng đổi theo (điều kiện đầu cho kiểm tra gỡ đăng ở test sau).
    await expect
      .poll(async () => (await publicStatus(browser, '/cau-chuyen')).text.includes(editedTitle), { timeout: 15_000 })
      .toBe(true)
  } finally {
    await pub.close()
  }
})

test('gỡ đăng và xoá biến khỏi công khai', async ({ browser }) => {
  test.setTimeout(90_000)
  await reviewerPage.goto(`/admin/collections/stories/${storyId}`)
  // Payload 3.92 đặt "Ẩn tài liệu" trong menu thao tác của tài liệu (nút ba chấm), không phải menu nút đăng.
  await reviewerPage.locator('.doc-controls__popup .popup-button').click()
  await reviewerPage.getByRole('button', { name: 'Ẩn tài liệu' }).click()
  await reviewerPage.getByRole('button', { name: 'Xác nhận', exact: true }).click()

  const cardShown = async () => (await publicStatus(browser, '/cau-chuyen')).text.includes(editedTitle)
  await expect.poll(async () => (await publicStatus(browser, `/cau-chuyen/${slug}`)).status, { timeout: 15_000 }).toBe(404)
  await expect.poll(cardShown, { timeout: 15_000 }).toBe(false)
  // Trang danh sách vẫn là trang thật (không phải lỗi).
  expect((await publicStatus(browser, '/cau-chuyen')).status).toBe(200)

  const republish = await reviewerApi.patch(`/api/stories/${storyId}?draft=false`, { data: { _status: 'published' } })
  expect(republish.ok(), await republish.text()).toBe(true)
  await expect.poll(async () => (await publicStatus(browser, `/cau-chuyen/${slug}`)).status, { timeout: 15_000 }).toBe(200)
  await expect.poll(cardShown, { timeout: 15_000 }).toBe(true)

  const del = await reviewerApi.delete(`/api/stories/${storyId}`)
  expect(del.ok(), await del.text()).toBe(true)
  storyId = undefined
  await expect.poll(async () => (await publicStatus(browser, `/cau-chuyen/${slug}`)).status, { timeout: 15_000 }).toBe(404)
  await expect.poll(cardShown, { timeout: 15_000 }).toBe(false)
})

test('sửa Thông tin site hiện ở /ket-noi', async ({ browser }) => {
  const before = await reviewerApi.get('/api/globals/site-settings?draft=false')
  expect(before.ok()).toBe(true)
  const oldEmail: string | null = (await before.json()).email ?? null
  const newEmail = `e2e-${rand}@example.com`
  try {
    const set = await reviewerApi.post('/api/globals/site-settings?draft=false', { data: { email: newEmail, _status: 'published' } })
    expect(set.ok(), await set.text()).toBe(true)
    await expect
      .poll(async () => (await publicStatus(browser, '/ket-noi')).text.includes(newEmail), { timeout: 15_000 })
      .toBe(true)
  } finally {
    // Không dùng expect ở đây để không che lỗi gốc của bài; chỉ báo nếu không trả lại được.
    const back = await reviewerApi.post('/api/globals/site-settings?draft=false', { data: { email: oldEmail, _status: 'published' } })
    if (!back.ok()) console.error(`Không trả lại email site-settings (${oldEmail}): ${back.status()} ${await back.text()}`)
  }
})

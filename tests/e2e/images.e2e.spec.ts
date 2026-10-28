// Ảnh ở chế độ public: file phục vụ qua Payload, không qua bộ tối ưu của Next. Chạy bằng project "public" (cổng 3100).
import { expect, request as pwRequest, test, type APIRequestContext } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { loginReviewer } from './helpers'

const CODE = `TL-E2E-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
let assetId: number | undefined
let assetFileUrl = ''

// Đăng nhập người duyệt seed bằng phiên global-setup (cookie dùng được trên cả hai cổng), không in thông tin đăng nhập.
async function reviewerApi(browserPage: Parameters<typeof loginReviewer>[0]): Promise<APIRequestContext> {
  await loginReviewer(browserPage)
  return browserPage.request
}

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ baseURL })
  const page = await ctx.newPage()
  const api = await reviewerApi(page)
  const res = await api.post('/api/archive-assets', {
    multipart: {
      _payload: JSON.stringify({
        code: CODE,
        title: 'Ảnh thử e2e',
        description: 'Ảnh sinh ra bởi e2e, tự xoá sau khi chạy.',
        alt: 'Ảnh thử e2e',
        category: 'weaving',
        era: 'now',
        takenAt: '2026',
        photographer: 'e2e',
        owner: 'e2e',
        source: 'e2e',
        rights: 'permitted',
        subjectConsent: 'not_applicable',
        inArchive: true,
        _status: 'published',
      }),
      file: { name: 'tiny.webp', mimeType: 'image/webp', buffer: readFileSync('tests/fixtures/tiny.webp') },
    },
  })
  expect(res.ok(), await res.text()).toBe(true)
  const { doc } = (await res.json()) as { doc: { id: number; url: string } }
  assetId = doc.id
  assetFileUrl = doc.url
  await ctx.close()
})

test.afterAll(async ({ browser, baseURL }) => {
  if (assetId === undefined) return
  const ctx = await browser.newContext({ baseURL })
  const page = await ctx.newPage()
  const api = await reviewerApi(page)
  await api.delete(`/api/archive-assets/${assetId}`)
  await ctx.close()
})

test('khách thấy ảnh được phép ở /thu-vien và tải được file', async ({ page, baseURL }) => {
  const res = await page.goto('/thu-vien')
  expect(res?.status()).toBe(200)
  const img = page.locator(`main a[data-code="${CODE}"] img`).first()
  await expect(img).toBeAttached()
  const src = (await img.getAttribute('src')) ?? ''
  expect(src).toContain('/api/archive-assets/file/')
  const file = await pwRequest.newContext({ baseURL })
  const got = await file.get(src)
  expect(got.status()).toBe(200)
  expect(got.headers()['content-type']).toMatch(/^image\//)
  await file.dispose()
})

test('file ảnh rights unknown: người duyệt thấy, khách bị 403', async ({ page, baseURL }) => {
  const api = await reviewerApi(page)
  const list = await api.get('/api/archive-assets?where[rights][equals]=unknown&limit=1&depth=0')
  expect(list.ok()).toBe(true)
  const { docs } = (await list.json()) as { docs: { url: string }[] }
  expect(docs.length, 'seed phải có asset rights=unknown').toBeGreaterThan(0)
  expect((await api.get(docs[0].url)).status()).toBe(200)
  const anon = await pwRequest.newContext({ baseURL })
  expect((await anon.get(docs[0].url)).status()).toBe(403)
  await anon.dispose()
  expect(assetFileUrl).toContain('/api/archive-assets/file/')
})

test('R6: HTML của các route public không chứa /_next/image', async ({ baseURL }) => {
  const anon = await pwRequest.newContext({ baseURL })
  for (const route of ['/', '/nghe-det-chieu', '/lang-hoi', '/san-pham', '/cau-chuyen', '/con-nguoi', '/thu-vien']) {
    const res = await anon.get(route)
    expect(res.status(), route).toBe(200)
    expect(await res.text(), route).not.toContain('/_next/image')
  }
  await anon.dispose()
})

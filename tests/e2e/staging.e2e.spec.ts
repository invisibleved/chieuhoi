// Kiểm site staging (deploy thật hoặc diễn tập :3200). Project "staging"; cả file bỏ qua khi thiếu STAGING_URL.
// Chạy: STAGING_URL=... STAGING_AUTH=user:password STAGING_REVIEWER_EMAIL=... STAGING_REVIEWER_PASSWORD=... \
//   npm run test:e2e -- --project=staging
// Không in mật khẩu: mọi giá trị bí mật chỉ đọc từ biến môi trường.
import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'

import { expectVisibleImagesLoaded, scrollThrough } from './helpers'

const STAGING_URL = process.env.STAGING_URL
const REVIEWER_EMAIL = process.env.STAGING_REVIEWER_EMAIL
const REVIEWER_PASSWORD = process.env.STAGING_REVIEWER_PASSWORD

test.skip(!STAGING_URL, 'Thiếu STAGING_URL: bỏ qua kiểm staging.')

test.describe('khách chưa nhập mật khẩu', () => {
  for (const path of ['/', '/admin', '/api/archive-assets/file/x.webp']) {
    test(`${path} trả 401`, async () => {
      // fetch thuần: không cookie, không httpCredentials (request.newContext của Playwright kế thừa httpCredentials của project).
      const res = await fetch(new URL(path, STAGING_URL), { redirect: 'manual' })
      expect(res.status).toBe(401)
      expect(res.headers.get('www-authenticate')).toContain('Basic')
    })
  }
})

test.describe('đã nhập mật khẩu', () => {
  test('/ trả 200, có noindex ở header và thẻ meta, có nhãn [cần xác minh] (R3, R4)', async ({ page }) => {
    const res = await page.goto('/')
    expect(res?.status()).toBe(200)
    expect(res?.headers()['x-robots-tag']).toBe('noindex, nofollow')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
    await expect(page.getByText('[cần xác minh]').first()).toBeAttached()
  })

  test('/robots.txt chặn tất cả', async ({ page }) => {
    const res = await page.request.get('/robots.txt')
    expect(res.status()).toBe(200)
    expect(await res.text()).toContain('Disallow: /')
  })

  for (const path of ['/', '/thu-vien', '/nghe-det-chieu']) {
    test(`mọi ảnh trên ${path} tải được (R5, ảnh qua S3)`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)
      await scrollThrough(page)
      expect(await page.locator('main img').count()).toBeGreaterThan(0)
      await expectVisibleImagesLoaded(page)
    })
  }

  test('ảnh OG là URL tuyệt đối theo SITE_URL', async ({ page }) => {
    await page.goto('/san-pham')
    const hrefs = await page
      .locator('main a[href^="/san-pham/"]')
      .evaluateAll((els) => [...new Set(els.map((el) => el.getAttribute('href') ?? ''))])
    expect(hrefs.length, 'cần ít nhất một trang sản phẩm').toBeGreaterThan(0)
    await page.goto(hrefs[0])
    const og = await page.locator('meta[property="og:image"]').first().getAttribute('content')
    expect(og ?? '').toMatch(new RegExp(`^${new URL(STAGING_URL!).origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`))
  })
})

test.describe('admin: tải ảnh lên qua giao diện (R8, clientUploads)', () => {
  test('ảnh tải lên sinh đủ cỡ thumb, card, wide', async ({ page }, testInfo) => {
    test.skip(!REVIEWER_EMAIL || !REVIEWER_PASSWORD, 'Thiếu STAGING_REVIEWER_EMAIL / STAGING_REVIEWER_PASSWORD.')
    test.setTimeout(120_000)

    // Ảnh đủ lớn (một màu, không phải ảnh tham khảo) để cả ba cỡ phải được sinh dù có withoutEnlargement.
    mkdirSync(testInfo.outputDir, { recursive: true })
    const file = testInfo.outputPath('staging-upload.webp')
    await sharp({ create: { width: 2000, height: 1400, channels: 3, background: { r: 120, g: 90, b: 40 } } })
      .webp()
      .toFile(file)

    const code = `TL-STG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    let id: string | undefined
    try {
      await page.goto('/admin/login')
      await page.locator('#field-email').fill(REVIEWER_EMAIL!)
      await page.locator('#field-password').fill(REVIEWER_PASSWORD!)
      await page.locator('button[type="submit"]').click()
      await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 20_000 })

      // Ghi lại đường đi của file: phải là trình duyệt PUT thẳng lên bucket (URL ký sẵn), không gửi qua app.
      const appOrigin = new URL(STAGING_URL!).origin
      const signed: string[] = []
      const directPuts: string[] = []
      page.on('request', (req) => {
        if (req.url().includes('/api/storage-s3-generate-signed-url')) signed.push(req.method())
        if (req.method() === 'PUT' && new URL(req.url()).origin !== appOrigin) directPuts.push(new URL(req.url()).origin)
      })

      await page.goto('/admin/collections/archive-assets/create')
      await page.locator('input[type="file"]').setInputFiles(file)
      await page.locator('#field-code').fill(code)
      await page.locator('#field-alt').fill('Ảnh thử staging (e2e, tự xoá)')
      await page.getByRole('button', { name: 'Lưu', exact: true }).click()
      await expect(page).toHaveURL(/\/admin\/collections\/archive-assets\/(?!create)[^/?]+$/, { timeout: 60_000 })
      id = page.url().split('/').pop()!
      expect(signed, 'admin phải xin URL ký sẵn (clientUploads)').toContain('POST')
      expect(directPuts.length, 'trình duyệt phải PUT file thẳng lên bucket').toBeGreaterThan(0)

      const res = await page.request.get(`/api/archive-assets/${id}?depth=0`)
      expect(res.ok(), await res.text()).toBe(true)
      const doc = (await res.json()) as { filename?: string; sizes?: Record<string, { url?: string | null } | undefined> }
      // R24: tên file công khai là mã tư liệu, không phải tên file gốc, cả khi tải thẳng lên bucket.
      expect(doc.filename).toBe(`${code}.webp`)
      for (const size of ['thumb', 'card', 'wide']) {
        expect(doc.sizes?.[size]?.url, `thiếu sizes.${size}.url`).toBeTruthy()
        const got = await page.request.get(doc.sizes![size]!.url!)
        expect(got.status(), `tải sizes.${size}`).toBe(200)
        expect(got.headers()['content-type']).toMatch(/^image\//)
      }
    } finally {
      if (id) {
        const del = await page.request.delete(`/api/archive-assets/${id}`)
        expect(del.ok()).toBe(true)
      }
    }
  })
})

import { expect, test, type Browser, type Page } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

import { GUIDE_SHOTS } from '../../src/admin/guide/shots'
import { sampleImage } from '../../src/seed/sampleImage'
import { highlight } from './helpers/highlight'

// Ảnh chụp cho trang Hướng dẫn trong admin, trên bản build trỏ vào DB test với dữ liệu mẫu của src/seed/guide.ts.
// Chạy: npm run guide:seed && npm run guide:shots (script tự build, chạy :3300 và đặt GUIDE_SHOTS=1).
const ON = process.env.GUIDE_SHOTS === '1'
const OUT = 'public/admin-guide'
const USERS_FILE = '.superpowers/guide-users.json'
const MAX_BYTES = 400 * 1024

type Role = 'editor' | 'reviewer' | null
type Users = Record<'editor' | 'reviewer', { email: string; password: string }>

const VIEWPORT = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}

/** Đưa trang tới đúng trạng thái và trả về chữ của phần tử được khung đỏ. */
type Step = (page: Page) => Promise<string>
type Recipe = { role: Role; step: Step }

const widget = (page: Page, name: string) =>
  page.locator('section.ch-widget').filter({ has: page.getByRole('heading', { name, exact: true }) })
/** Khối một ô nhập trong form, tìm theo nhãn. */
const field = (page: Page, label: string) =>
  page.locator('.field-type').filter({ has: page.locator('label.field-label', { hasText: label }) }).first()

async function idOf(page: Page, collection: string, where: string): Promise<string | number> {
  const res = await page.request.get(`/api/${collection}?${where}&limit=1&depth=0&draft=true`)
  expect(res.ok(), await res.text()).toBe(true)
  const doc = (await res.json()).docs[0]
  expect(doc, `không thấy ${collection} mẫu (${where}); chạy npm run guide:seed`).toBeTruthy()
  return doc.id
}

async function openStory(page: Page, slug: string) {
  const id = await idOf(page, 'stories', `where[slug][equals]=${slug}`)
  await page.goto(`/admin/collections/stories/${id}`)
  await expect(page.locator('#field-slug')).toHaveValue(slug)
}

async function chooseWorkflow(page: Page, label: string) {
  const wf = field(page, 'Quy trình')
  await wf.locator('.rs__control').click()
  await page.locator('.rs__option', { hasText: label }).click()
  await expect(wf.locator('.rs__single-value')).toHaveText(label)
  // Rời ô chọn để thông báo đọc màn hình ("option …, selected") không lọt vào chữ của khung đỏ.
  await page.keyboard.press('Escape')
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
}

const RECIPES: Record<string, Recipe> = {
  'dang-nhap': {
    role: null,
    step: async (page) => {
      await page.goto('/admin/login')
      await page.locator('#field-email').fill('bien-tap@example.com')
      await page.locator('#field-password').fill('mat-khau-mau')
      return highlight(page, page.locator('form button[type="submit"]'))
    },
  },
  'trang-dau': {
    role: 'editor',
    step: async (page) => {
      await page.goto('/admin')
      return highlight(page, widget(page, 'Việc thường làm'))
    },
  },
  'tai-anh-chon-file': {
    role: 'editor',
    step: async (page) => {
      await page.goto('/admin/collections/archive-assets/create')
      return highlight(page, page.getByRole('button', { name: 'Chọn một file' }))
    },
  },
  'tai-anh-luu': {
    role: 'editor',
    step: async (page) => {
      await page.goto('/admin/collections/archive-assets/create')
      const png = await sampleImage('#344B3D', '#F3EBDD')
      await page.locator('input[type="file"]').setInputFiles({ name: 'anh-mau.png', mimeType: 'image/png', buffer: png })
      await page.locator('#field-alt').fill('Ô màu xanh có chữ Ảnh mẫu (mẫu).')
      await expect(page.locator('#action-save')).toBeEnabled()
      return highlight(page, page.locator('#action-save'))
    },
  },
  'viet-bai-mo': {
    role: 'editor',
    step: async (page) => {
      await page.goto('/admin')
      return highlight(page, widget(page, 'Việc thường làm').getByRole('link', { name: 'Viết bài mới' }))
    },
  },
  'viet-bai-noi-dung': {
    role: 'editor',
    step: async (page) => {
      await openStory(page, 'bai-nhap-mau')
      return highlight(page, field(page, 'Nội dung'))
    },
  },
  'xem-truoc': {
    role: 'editor',
    step: async (page) => {
      await openStory(page, 'bai-nhap-mau')
      return highlight(page, page.locator('#preview-button'))
    },
  },
  'gui-duyet-quy-trinh': {
    role: 'editor',
    step: async (page) => {
      await openStory(page, 'bai-nhap-mau')
      await chooseWorkflow(page, 'Chờ duyệt')
      return highlight(page, field(page, 'Quy trình'))
    },
  },
  'gui-duyet-luu': {
    role: 'editor',
    step: async (page) => {
      await openStory(page, 'bai-nhap-mau')
      await chooseWorkflow(page, 'Chờ duyệt')
      await expect(page.locator('#action-save-draft')).toBeEnabled()
      return highlight(page, page.locator('#action-save-draft'))
    },
  },
  'menu-dien-thoai': {
    role: 'editor',
    step: async (page) => {
      await page.goto('/admin')
      await expect(widget(page, 'Việc thường làm')).toBeVisible()
      return highlight(page, page.locator('.nav-toggler:visible').first())
    },
  },
  'duyet-danh-sach': {
    role: 'reviewer',
    step: async (page) => {
      await page.goto('/admin')
      const pending = widget(page, 'Đang chờ duyệt')
      await expect(pending).toContainText(/Bài viết\s*—\s*1/)
      return highlight(page, pending)
    },
  },
  'duyet-quyen-anh': {
    role: 'reviewer',
    step: async (page) => {
      const id = await idOf(page, 'archive-assets', 'where[code][equals]=TL-MAU-02')
      await page.goto(`/admin/collections/archive-assets/${id}`)
      await expect(page.locator('#field-code')).toHaveValue('TL-MAU-02')
      return highlight(page, field(page, 'Quyền sử dụng'))
    },
  },
  'duyet-dang': {
    role: 'reviewer',
    step: async (page) => {
      await openStory(page, 'bai-cho-duyet-mau')
      return highlight(page, page.locator('#action-save'))
    },
  },
  'tao-tai-khoan': {
    role: 'reviewer',
    step: async (page) => {
      await page.goto('/admin/collections/users/create')
      await expect(page.locator('#field-email')).toBeVisible()
      return highlight(page, field(page, 'Vai trò'))
    },
  },
}

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g

/** Không ảnh tham khảo, không email ngoài tài khoản mẫu @example.com trên trang sắp chụp. */
async function assertSafe(page: Page) {
  await expect(
    page.locator('img[src*="/images/reference/"], img[srcset*="/images/reference/"], source[srcset*="/images/reference/"]'),
  ).toHaveCount(0)
  const text = await page.evaluate(
    () =>
      document.body.innerText +
      ' ' +
      [...document.querySelectorAll('input, textarea')].map((el) => (el as HTMLInputElement).value).join(' '),
  )
  const foreign = (text.match(EMAIL) ?? []).filter((e) => !e.toLowerCase().endsWith('@example.com'))
  expect(foreign, 'email lạ trên ảnh chụp').toEqual([])
}

async function settle(page: Page) {
  // Bỏ viền focus của ô vừa gõ để ảnh chỉ có một khung nổi bật là khung đỏ.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await page.evaluate(() => document.fonts.ready)
  await page.waitForLoadState('networkidle')
  // Toast của Payload (vd. "đã lưu") không được lọt vào ảnh.
  await expect(page.locator('.payload-toast-item')).toHaveCount(0)
}

/** PNG bảng màu nén, ≤ 400KB. */
async function save(page: Page, file: string) {
  const raw = await page.screenshot({ animations: 'disabled', caret: 'hide' })
  const png = await sharp(raw).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer()
  expect(png.length, `${file} vượt 400KB`).toBeLessThanOrEqual(MAX_BYTES)
  writeFileSync(path.join(OUT, file), png)
}

async function shoot(browser: Browser, baseURL: string, users: Users, id: string, kind: keyof typeof VIEWPORT) {
  const recipe = RECIPES[id]
  const ctx = await browser.newContext({ ...VIEWPORT[kind], baseURL, locale: 'vi-VN', reducedMotion: 'reduce' })
  try {
    if (recipe.role) {
      const res = await ctx.request.post('/api/users/login', { data: users[recipe.role] })
      expect(res.ok(), `đăng nhập ${users[recipe.role].email} thất bại (${res.status()})`).toBe(true)
    }
    const page = await ctx.newPage()
    const label = await recipe.step(page)
    await settle(page)
    await assertSafe(page)
    await save(page, kind === 'desktop' ? `${id}.png` : `${id}-mobile.png`)
    return label
  } finally {
    await ctx.close()
  }
}

test.describe('ảnh chụp cho trang Hướng dẫn', () => {
  test.skip(!ON, 'chạy bằng npm run guide:shots')
  test.describe.configure({ mode: 'serial' })

  const labels: Record<string, string> = {}
  let users: Users

  test.beforeAll(() => {
    expect(existsSync(USERS_FILE), `thiếu ${USERS_FILE}: chạy npm run guide:seed trước`).toBe(true)
    users = JSON.parse(readFileSync(USERS_FILE, 'utf8')) as Users
    mkdirSync(OUT, { recursive: true })
  })

  test('mọi ảnh trong GUIDE_SHOTS có cách chụp', () => {
    expect(Object.keys(RECIPES).sort()).toEqual(GUIDE_SHOTS.map((s) => s.id).sort())
  })

  for (const shot of GUIDE_SHOTS) {
    test(shot.id, async ({ browser, baseURL }) => {
      const label = await shoot(browser, baseURL!, users, shot.id, 'desktop')
      expect(label, `${shot.id}: phần tử khung đỏ không có chữ`).not.toBe('')
      if (shot.mobile) {
        expect(await shoot(browser, baseURL!, users, shot.id, 'mobile'), `${shot.id}: chữ ở điện thoại khác máy tính`).toBe(label)
      }
      labels[shot.id] = label
    })
  }

  test('ghi labels.json', () => {
    const ordered = Object.fromEntries(GUIDE_SHOTS.map((s) => [s.id, labels[s.id]]))
    expect(Object.values(ordered).every(Boolean)).toBe(true)
    writeFileSync(path.join(OUT, 'labels.json'), `${JSON.stringify(ordered, null, 2)}\n`)
  })
})

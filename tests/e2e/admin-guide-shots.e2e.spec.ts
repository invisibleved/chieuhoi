import { expect, test, type Browser, type Locator, type Page } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

import { GUIDE_SHOTS } from '../../src/admin/guide/shots'
import { sampleImage } from '../../src/seed/sampleImage'
import { forbiddenImageSources, srcsetUrls } from './helpers/guideSafety'
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
/** `keepToast`: ảnh này chụp chính thông báo của Payload, nên không đòi trang hết thông báo. */
type Recipe = { role: Role; step: Step; keepToast?: boolean }

/** Thẻ của một loại nội dung ở trang đầu gốc của Payload (có nút dấu cộng để tạo mới). */
const card = (page: Page, collection: string) => page.locator(`#card-${collection}`)
/** Một nhóm thẻ ở trang đầu, tìm theo tên nhóm. */
const group = (page: Page, name: string | RegExp) =>
  page.locator('.collections__group').filter({ has: page.locator('.collections__label', { hasText: name }) })
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

/** Các ảnh trước vừa mở bài nháp mẫu nên bài đó đang bị khoá (hiện ổ khoá trong danh sách); gỡ khoá cho ảnh gọn. */
async function unlockAll(page: Page) {
  const res = await page.request.delete('/api/payload-locked-documents?where[id][exists]=true')
  expect(res.ok(), await res.text()).toBe(true)
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

/** Trang Làng Hới, mở dòng Địa giới hiện nay của Bảng thông tin đầu trang; trả về dòng đó. */
async function openFactRow(page: Page): Promise<Locator> {
  // Payload nhớ dòng nào đang đóng hay mở theo từng người dùng; xoá đi để dòng nào cũng mở sẵn như lần đầu vào trang.
  const cleared = await page.request.delete('/api/payload-preferences?where[key][exists]=true')
  expect(cleared.ok(), await cleared.text()).toBe(true)
  const id = await idOf(page, 'pages', 'where[slug][equals]=lang-hoi')
  await page.goto(`/admin/collections/pages/${id}`)
  // Tên dòng là chữ ở ô Mục.
  const row = page.locator('.array-field__row').filter({ has: page.locator('.array-field__row-header', { hasText: /^ĐỊA GIỚI HIỆN NAY$/ }) }).first()
  await expect(row).toBeVisible()
  await page.waitForLoadState('networkidle')
  const input = row.locator('input[value="ĐỊA GIỚI HIỆN NAY"]')
  // "Hiển thị toàn bộ" luôn mở mọi dòng (không đảo trạng thái như nút của từng dòng, vốn bị Payload đóng lại khi lưu lựa chọn).
  await page.waitForLoadState('networkidle')
  await page.locator('.array-field').filter({ has: row }).last().getByRole('button', { name: 'Hiển thị toàn bộ' }).click()
  await expect(input).toBeVisible()
  await page.waitForLoadState('networkidle')
  await expect(input).toBeVisible()
  return row
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
  'mo-menu': {
    role: 'editor',
    step: async (page) => {
      await page.goto('/admin')
      await expect(card(page, 'stories')).toBeVisible()
      return highlight(page, page.locator('.nav-toggler:visible').first())
    },
  },
  'menu-huong-dan': {
    role: 'editor',
    step: async (page) => {
      await page.goto('/admin')
      await page.locator('.nav-toggler:visible').first().click()
      const link = page.locator('nav a').filter({ hasText: /^Hướng dẫn$/ })
      await expect(link).toBeVisible()
      // Chờ menu trượt ra hẳn rồi mới vẽ khung.
      await expect.poll(() => link.evaluate((el) => el.getBoundingClientRect().left)).toBeGreaterThanOrEqual(0)
      return highlight(page, link)
    },
  },
  'trang-dau': {
    role: 'editor',
    step: async (page) => {
      await page.goto('/admin')
      // Việc của biên tập viên nằm ở hai nhóm: Tư liệu (Kho tư liệu ảnh) và Nội dung (Bài viết, Con người, Sản phẩm).
      return highlight(page, group(page, /^(Tư liệu|Nội dung)$/))
    },
  },
  'tai-anh-mo': {
    role: 'editor',
    step: async (page) => {
      await page.goto('/admin')
      return highlight(page, card(page, 'archive-assets'))
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
      return highlight(page, card(page, 'stories'))
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
  'loi-o-thieu': {
    role: 'editor',
    keepToast: true,
    step: async (page) => {
      // Ảnh không có bản nháp: bấm Lưu khi chưa điền Văn bản thay thế thì không lưu được, Payload báo lỗi bằng
      // thông báo đỏ ở phía dưới màn hình, ghi tên ô đang thiếu. (Viền đỏ ở ô không phải lúc nào cũng hiện, nên chụp thông báo.)
      await page.goto('/admin/collections/archive-assets/create')
      const png = await sampleImage('#C3A46C', '#1F1A14')
      await expect(page.locator('#field-alt')).toBeEditable()
      await page.locator('input[type="file"]').setInputFiles({ name: 'anh-mau.png', mimeType: 'image/png', buffer: png })
      await expect(page.locator('#action-save')).toBeEnabled()
      await page.locator('#action-save').click()
      const toast = page.locator('.payload-toast-item').filter({ hasText: 'Văn bản thay thế' })
      await expect(toast).toBeVisible()
      await expect(page).toHaveURL(/\/archive-assets\/create$/)
      // Để chuột trên thông báo cho nó không tự tắt trước khi chụp.
      await toast.hover()
      return highlight(page, toast)
    },
  },
  'duyet-danh-sach': {
    role: 'reviewer',
    step: async (page) => {
      await unlockAll(page)
      await page.goto('/admin/collections/stories')
      const cell = page.locator('td.cell-workflow').filter({ hasText: /^Chờ duyệt$/ })
      await expect(cell).toHaveCount(1)
      return highlight(page, cell)
    },
  },
  'dang-bai-mo': {
    role: 'reviewer',
    step: async (page) => {
      await unlockAll(page)
      await page.goto('/admin/collections/stories')
      const row = page.locator('tbody tr').filter({ has: page.locator('td.cell-workflow', { hasText: /^Chờ duyệt$/ }) })
      await expect(row).toHaveCount(1)
      // Chỉ tên bài là link mở bài; khung đỏ vào đúng ô đó.
      return highlight(page, row.locator('td.cell-title a'))
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
  'du-kien-dia-gioi': {
    role: 'editor',
    step: async (page) => {
      const row = await openFactRow(page)
      return highlight(page, row)
    },
  },
  'du-kien-nguon': {
    role: 'editor',
    step: async (page) => {
      const row = await openFactRow(page)
      const sources = row
        .locator('.field-type')
        .filter({ has: page.locator('label.field-label', { hasText: /^Nguồn$/ }) })
        .first()
      return highlight(page, sources)
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
  const images = await page.evaluate(() =>
    [...document.querySelectorAll('img, source')].map((el) => ({
      src: (el as HTMLImageElement).getAttribute('src') ?? '',
      current: (el as HTMLImageElement).currentSrc ?? '',
      srcset: el.getAttribute('srcset') ?? '',
    })),
  )
  const sources = images.flatMap((i) => [i.src, i.current, ...srcsetUrls(i.srcset)]).filter(Boolean)
  expect(forbiddenImageSources(sources), 'ảnh tham khảo hoặc ảnh không phải ảnh mẫu trên ảnh chụp').toEqual([])
  const text = await page.evaluate(
    () =>
      document.body.innerText +
      ' ' +
      [...document.querySelectorAll('input, textarea')].map((el) => (el as HTMLInputElement).value).join(' '),
  )
  const foreign = (text.match(EMAIL) ?? []).filter((e) => !e.toLowerCase().endsWith('@example.com'))
  expect(foreign, 'email lạ trên ảnh chụp').toEqual([])
}

async function settle(page: Page, keepToast = false) {
  // Bỏ viền focus của ô vừa gõ để ảnh chỉ có một khung nổi bật là khung đỏ.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await page.evaluate(() => document.fonts.ready)
  await page.waitForLoadState('networkidle')
  // Toast của Payload (vd. "đã lưu") không được lọt vào ảnh, trừ ảnh chụp chính thông báo đó.
  if (!keepToast) await expect(page.locator('.payload-toast-item')).toHaveCount(0)
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
  // Payload chọn giao diện sáng/tối theo máy người xem; ghim sáng để ảnh giống máy thường gặp (trang đăng nhập cũng vậy).
  const ctx = await browser.newContext({
    ...VIEWPORT[kind],
    baseURL,
    locale: 'vi-VN',
    reducedMotion: 'reduce',
    colorScheme: 'light',
  })
  // Payload đọc cookie theme trước gợi ý trình duyệt (Sec-CH-Prefers-Color-Scheme): kênh chromium đầy đủ gửi theo máy
  // chạy chụp, nên trang đăng nhập (chưa có cookie) ra tối. Cookie ghim sáng cho mọi ảnh.
  await ctx.addCookies([{ name: 'payload-theme', value: 'light', url: baseURL }])
  try {
    if (recipe.role) {
      const res = await ctx.request.post('/api/users/login', { data: users[recipe.role] })
      expect(res.ok(), `đăng nhập ${users[recipe.role].email} thất bại (${res.status()})`).toBe(true)
    }
    const page = await ctx.newPage()
    const label = await recipe.step(page)
    await settle(page, recipe.keepToast)
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

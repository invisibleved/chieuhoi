import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const SHOTS = process.env.SHOTS_DIR

async function open(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const res = await page.goto('/lang-hoi')
  expect(res?.status()).toBe(200)
  await page.waitForLoadState('networkidle')
}

async function axe(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze()
  const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
}

for (const vp of [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]) {
  test.describe(`làng Hới ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test('một h1 và axe không có vi phạm serious/critical', async ({ page }) => {
      await open(page)
      await expect(page.locator('main h1')).toHaveCount(1)
      await axe(page)
    })

    test('chú thích "Nguồn 1" dẫn tới mục nguồn 1', async ({ page }) => {
      await open(page)
      const ref = page.getByRole('link', { name: 'Nguồn 1', exact: true }).filter({ visible: true }).first()
      await ref.scrollIntoViewIfNeeded()
      await ref.click()
      await expect(page).toHaveURL(/#nguon-1$/)
      await expect(page.locator('#nguon-1')).toBeInViewport()
    })
  })
}

test.describe('làng Hới 1440: dòng thời gian', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('bấm mốc "Thời Lê" hiện chi tiết và badge Truyền khẩu', async ({ page }) => {
    await open(page)
    const list = page.getByRole('list', { name: 'Các mốc' }).filter({ visible: true })
    await list.scrollIntoViewIfNeeded()
    await list.getByRole('button', { name: /Thời Lê/ }).click()
    await expect(page.getByRole('heading', { level: 3, name: 'Khung dệt về làng' }).filter({ visible: true })).toBeVisible()
    await expect(page.getByText('Truyền khẩu', { exact: true }).filter({ visible: true }).first()).toBeVisible()
  })
})

test.describe('làng Hới 390: dòng thời gian accordion', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('mốc đầu mở; bấm "1531" mở mốc đó và đóng mốc đầu', async ({ page }) => {
    await open(page)
    const list = page.getByRole('list', { name: 'Các mốc' }).filter({ visible: true })
    await list.scrollIntoViewIfNeeded()
    const buttons = list.getByRole('button')
    await expect(buttons.first()).toHaveAttribute('aria-expanded', 'true')
    const b1531 = list.getByRole('button', { name: /1531/ })
    await b1531.click()
    await expect(b1531).toHaveAttribute('aria-expanded', 'true')
    await expect(buttons.first()).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('làng Hới 768', () => {
  test.use({ viewport: { width: 768, height: 900 } })

  test('không cuộn ngang; timeline dạng mở/đóng', async ({ page }) => {
    await open(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768)
    const list = page.getByRole('list', { name: 'Các mốc' }).filter({ visible: true })
    await expect(list.getByRole('button').first()).toHaveAttribute('aria-expanded', /true|false/)
  })
})

test.describe('làng Hới mobile 390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('không cuộn ngang, nút và link ≥ 44px', async ({ page }) => {
    await open(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    const small = await page.evaluate(() => {
      const out: string[] = []
      document.querySelectorAll('main a, main button').forEach((el) => {
        if (el.matches('.fn, [id^="nguon-"] a') || (el.closest('p') && el.tagName === 'A' && !el.closest('[hidden]'))) return
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) return
        if (r.height < 44 - 0.5) out.push(`${el.tagName} "${(el.textContent ?? '').trim().slice(0, 30)}" h=${r.height}`)
      })
      return out
    })
    expect(small).toEqual([])
  })
})

for (const vp of [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]) {
  test(`chụp toàn trang làng Hới ${vp.name}`, async ({ page }) => {
    test.skip(!SHOTS, 'đặt SHOTS_DIR để lưu ảnh chụp')
    test.setTimeout(120_000)
    await page.setViewportSize({ width: vp.width, height: vp.height })
    mkdirSync(SHOTS!, { recursive: true })
    const email = process.env.SEED_REVIEWER_EMAIL
    const password = process.env.SEED_REVIEWER_PASSWORD
    if (email && password) {
      const res = await page.request.post('/api/users/login', { data: { email, password } })
      expect(res.ok()).toBeTruthy()
    }
    await open(page)
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 300) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 200))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${SHOTS}/village-${vp.name}.png`, fullPage: true })
  })
}

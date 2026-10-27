import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const SHOTS = process.env.SHOTS_DIR

async function open(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const res = await page.goto('/nghe-det-chieu')
  expect(res?.status()).toBe(200)
  await page.waitForLoadState('networkidle')
}

const visible = (page: Page, sel: string) => page.locator(sel).filter({ visible: true })

test.describe('nghề dệt chiếu 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('một h1 và axe không có vi phạm serious/critical', async ({ page }) => {
    await open(page)
    await expect(page.locator('main h1')).toHaveCount(1)
    const { violations } = await new AxeBuilder({ page }).analyze()
    const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
  })

  test('Enter ở công đoạn 03 hiện stage chưa có ảnh', async ({ page }) => {
    await open(page)
    const list = page.getByRole('list', { name: 'Các công đoạn' })
    const btn = list.getByRole('button').nth(2)
    await btn.scrollIntoViewIfNeeded()
    await btn.focus()
    await page.keyboard.press('Enter')
    await expect(btn).toHaveAttribute('aria-current', 'step')
    await expect(visible(page, 'text=ẢNH CẦN CHỤP').first()).toBeVisible()
  })

  test('"Xem cận cảnh" bật aria-pressed ở công đoạn có ảnh', async ({ page }) => {
    await open(page)
    const list = page.getByRole('list', { name: 'Các công đoạn' })
    const btn = list.getByRole('button').nth(4)
    await btn.scrollIntoViewIfNeeded()
    await btn.click()
    const zoom = page.getByRole('button', { name: 'Xem cận cảnh' }).filter({ visible: true })
    await zoom.click()
    await expect(page.getByRole('button', { name: 'Thu nhỏ' }).filter({ visible: true })).toHaveAttribute('aria-pressed', 'true')
  })

  test('"Công đoạn tiếp" tới cuối thì aria-disabled và focus còn ở nút', async ({ page }) => {
    await open(page)
    const list = page.getByRole('list', { name: 'Các công đoạn' })
    const total = await list.getByRole('button').count()
    const next = page.getByRole('button', { name: 'Công đoạn tiếp' })
    await next.scrollIntoViewIfNeeded()
    for (let i = 0; i < total - 1; i++) await next.click()
    await expect(next).toHaveAttribute('aria-disabled', 'true')
    // Playwright coi aria-disabled là không click được, nên kích hoạt bằng bàn phím như người dùng thật.
    await next.focus()
    await page.keyboard.press('Enter')
    await expect(next).toBeFocused()
    await expect(list.getByRole('button').nth(total - 1)).toHaveAttribute('aria-current', 'step')
  })

  test('tab "So sánh" mở bằng ArrowRight và hiện bảng', async ({ page }) => {
    await open(page)
    const tablist = page.getByRole('tablist', { name: 'Cách dệt' }).filter({ visible: true })
    await tablist.scrollIntoViewIfNeeded()
    await tablist.getByRole('tab').first().focus()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    const tab = tablist.getByRole('tab', { name: 'So sánh' })
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('table')).toBeVisible()
  })
})

test.describe('nghề dệt chiếu mobile 390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('không cuộn ngang, nút và link ≥ 44px', async ({ page }) => {
    await open(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    const small = await page.evaluate(() => {
      const out: string[] = []
      document.querySelectorAll('main a, main button').forEach((el) => {
        if (el.matches('.fn, [id^="nguon-"] a') || (el.closest('p') && el.tagName === 'A')) return
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) return
        if (r.height < 44 - 0.5 || r.width < 44 - 0.5) out.push(`${el.tagName} "${(el.textContent ?? '').trim().slice(0, 30)}" ${r.width}x${r.height}`)
      })
      return out
    })
    expect(small).toEqual([])
  })

  test('chọn pill 07 thì pill nằm trong khung nhìn ngang của dải', async ({ page }) => {
    await open(page)
    const rail = page.getByRole('group', { name: 'Chọn công đoạn' })
    const pill = rail.getByRole('button').nth(6)
    await pill.scrollIntoViewIfNeeded()
    await pill.click()
    await expect(pill).toHaveAttribute('aria-current', 'step')
    await expect
      .poll(async () =>
        rail.evaluate((strip, p) => {
          const s = strip.getBoundingClientRect()
          const b = (p as HTMLElement).getBoundingClientRect()
          return b.left >= s.left - 1 && b.right <= s.right + 1
        }, await pill.elementHandle()),
      )
      .toBe(true)
  })
})

for (const vp of [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]) {
  test(`chụp toàn trang nghề dệt chiếu ${vp.name}`, async ({ page }) => {
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
    await page.screenshot({ path: `${SHOTS}/craft-${vp.name}.png`, fullPage: true })
  })
}

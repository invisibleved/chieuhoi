import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const SHOTS = '/private/tmp/claude-501/-Users-luongdd-Documents-code-me-chieuhoivn/7a403193-6fa6-4cf4-8114-8bb55c7f7741/scratchpad/phase2-shots'
const H2 = ['Nút & link', 'Điều hướng', 'Thẻ nội dung', 'Thành phần di sản', 'Bộ lọc, tab & phân trang', 'Trạng thái phản hồi']

for (const vp of [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]) {
  test.describe(`styleguide ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test('200, h1, h2, robots noindex', async ({ page }) => {
      const res = await page.goto('/styleguide')
      expect(res?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1, name: 'Component' })).toBeVisible()
      for (const t of H2) await expect(page.getByRole('heading', { level: 2, name: t, exact: true })).toBeVisible()
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
    })

    test('axe: không có vi phạm serious/critical', async ({ page }) => {
      await page.goto('/styleguide')
      const { violations } = await new AxeBuilder({ page }).analyze()
      const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
    })

    test('chip và tab hoạt động bằng chuột/bàn phím', async ({ page }) => {
      await page.goto('/styleguide')
      const chip = page.getByRole('button', { name: 'Lịch sử' }).first()
      await chip.click()
      await expect(chip).toHaveAttribute('aria-pressed', 'true')
      const tab1 = page.getByRole('tab', { name: 'Dệt thủ công' })
      await tab1.focus()
      await page.keyboard.press('ArrowRight')
      const tab2 = page.getByRole('tab', { name: 'Dệt bằng máy' })
      await expect(tab2).toHaveAttribute('aria-selected', 'true')
      await expect(tab2).toBeFocused()
    })

    test('chụp toàn trang', async ({ page }) => {
      mkdirSync(SHOTS, { recursive: true })
      await page.goto('/styleguide')
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: `${SHOTS}/styleguide-${vp.name}.png`, fullPage: true })
    })
  })
}

test.describe('styleguide 390 mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('không cuộn ngang, nút/link >= 44px', async ({ page }) => {
    await page.goto('/styleguide')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('main a, main button')]
        .filter((el) => {
          if (el.classList.contains('fn')) return false
          if (el.closest('p, li')) return false
          const r = el.getBoundingClientRect()
          return r.width > 0 && r.height > 0 && r.height < 44
        })
        .map((el) => `${el.tagName} ${(el.textContent ?? '').trim().slice(0, 30)} h=${el.getBoundingClientRect().height}`),
    )
    expect(small).toEqual([])
  })

  test('đo vùng chạm ::before của .fn', async ({ page }) => {
    await page.goto('/styleguide')
    const fn = page.locator('a.fn').first()
    await fn.scrollIntoViewIfNeeded()
    const m = await fn.evaluate((el) => {
      const b = getComputedStyle(el, '::before')
      const r = el.getBoundingClientRect()
      return { before: [b.width, b.height], link: [r.width, r.height] }
    })
    console.log('FN_HIT', JSON.stringify(m))
    const [w, h] = m.before.map(parseFloat)
    expect(w).toBeGreaterThan(0)
    expect(h).toBeGreaterThan(0)
  })
})

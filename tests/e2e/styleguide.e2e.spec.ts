import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const SHOTS = process.env.SHOTS_DIR
const H2 = ['Nút & link', 'Điều hướng', 'Thẻ nội dung', 'Thành phần di sản', 'Thành phần chung', 'Khối trang Nghề & Làng', 'Bộ lọc, tab & phân trang', 'Trạng thái phản hồi']

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
      const tab1 = page.getByRole('tab', { name: 'Dệt thủ công' }).first()
      await tab1.focus()
      await page.keyboard.press('ArrowRight')
      const tab2 = page.getByRole('tab', { name: 'Dệt bằng máy' }).first()
      await expect(tab2).toHaveAttribute('aria-selected', 'true')
      await expect(tab2).toBeFocused()
    })

    test('chụp toàn trang', async ({ page }) => {
      test.skip(!SHOTS, 'đặt SHOTS_DIR để lưu ảnh chụp')
      mkdirSync(SHOTS!, { recursive: true })
      await page.goto('/styleguide')
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: `${SHOTS}/styleguide-${vp.name}.png`, fullPage: true })
    })

    test('khối trang Nghề & Làng: hành trình, dòng thời gian, so sánh hoạt động', async ({ page }) => {
      await page.goto('/styleguide')
      const block = page.locator('section[aria-labelledby="sg-trang"]')
      await expect(block.getByRole('progressbar').first()).toBeVisible()
      await expect(block.getByRole('img', { name: /Ảnh cần chụp: Cói phơi trên sân/ }).first()).toBeVisible()
      await expect(block.getByRole('tablist')).toBeVisible()
      await expect(block.getByRole('link', { name: /Gặp những người dệt/ })).toBeVisible()
      await expect(block.locator('[data-confidence]').first()).toBeVisible()
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
          // Ngoại lệ WCAG 2.5.8 (link nằm trong dòng chữ): chú thích .fn, link trong <p>, link trích nguồn.
          if (el.classList.contains('fn') || el.closest('p') || el.matches('[id^="nguon-"] a')) return false
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
    const [w, h] = m.before.map(parseFloat)
    expect(w).toBeGreaterThanOrEqual(44)
    expect(h).toBeGreaterThanOrEqual(44)
  })

  test('chú thích liền kề: bấm đúng glyph mở đúng nguồn', async ({ page }) => {
    await page.goto('/styleguide')
    const fns = page.locator('a.fn')
    await fns.first().scrollIntoViewIfNeeded()
    const hits = await page.evaluate(() => {
      const links = [...document.querySelectorAll<HTMLAnchorElement>('a.fn')].slice(0, 2)
      return links.map((a) => {
        const r = (a.firstElementChild ?? a).getBoundingClientRect()
        const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        return { href: a.getAttribute('href'), hit: el?.closest('a')?.getAttribute('href') ?? null }
      })
    })
    for (const h of hits) expect(h.hit).toBe(h.href)
  })

  test('FilterChips: vòng focus không bị dải cuộn cắt', async ({ page }) => {
    await page.goto('/styleguide')
    const chip = page.getByRole('group', { name: 'Lọc câu chuyện (nền sáng)' }).getByRole('button').first()
    await chip.scrollIntoViewIfNeeded()
    await chip.focus()
    const m = await chip.evaluate((el) => {
      const strip = el.parentElement!.getBoundingClientRect()
      const c = el.getBoundingClientRect()
      return { l: c.left - 5 - strip.left, t: c.top - 5 - strip.top, r: strip.right - (c.right + 5), b: strip.bottom - (c.bottom + 5) }
    })
    for (const v of Object.values(m)) expect(v).toBeGreaterThanOrEqual(-0.01)
  })
})

test.describe('styleguide desktop 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('hai chú thích sát nhau: mỗi số mở đúng nguồn của nó', async ({ page }) => {
    await page.goto('/styleguide')
    const links = page.locator('#sg-fn-adjacent a.fn')
    await expect(links).toHaveCount(2)
    await links.first().scrollIntoViewIfNeeded()
    const probes = await page.evaluate(() => {
      const as = [...document.querySelectorAll('#sg-fn-adjacent a.fn')]
      const hrefAt = (x: number, y: number) =>
        document.elementFromPoint(x, y)?.closest('a')?.getAttribute('href') ?? null
      const r = as.map((a) => (a.querySelector('span') ?? a).getBoundingClientRect())
      return {
        centre1: { x: r[0].left + r[0].width / 2, y: r[0].top + r[0].height / 2 },
        edge1: { x: r[0].right - 1, y: r[0].top + r[0].height / 2 },
        centre2: { x: r[1].left + r[1].width / 2, y: r[1].top + r[1].height / 2 },
        got: [
          hrefAt(r[0].left + r[0].width / 2, r[0].top + r[0].height / 2),
          hrefAt(r[0].right - 1, r[0].top + r[0].height / 2),
          hrefAt(r[1].left + r[1].width / 2, r[1].top + r[1].height / 2),
        ],
      }
    })
    expect(probes.got).toEqual(['#nguon-1', '#nguon-1', '#nguon-2'])
  })
})

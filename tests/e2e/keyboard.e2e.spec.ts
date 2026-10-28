// Dùng được bằng bàn phím (Phase 7, Task 5). Chạy ở project `chromium` (bản xem trước :3000).
// - Duyệt Tab mọi route ở 1440 và 390: focus luôn nhìn thấy, có viền focus, không kẹt, tới được liên kết cuối footer.
// - Tương tác: menu mobile, lightbox, CraftJourney, Tabs, PatternExplorer, form Kết nối.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import { REVIEWER_STATE } from './global-setup'
import { AUDIT_ROUTES, VIEWPORTS } from './helpers/routes'

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const MAX_TABS = 300

async function open(page: Page, path: string, viewport = VIEWPORTS.desktop) {
  await page.setViewportSize(viewport)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  if (existsSync(REVIEWER_STATE)) {
    const { cookies } = JSON.parse(readFileSync(REVIEWER_STATE, 'utf8'))
    await page.context().addCookies(cookies)
  }
  const res = await page.goto(path)
  expect(res, path).toBeTruthy()
  await page.waitForLoadState('networkidle')
}

async function axeClean(page: Page, what: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()
  expect(
    violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')} (${v.help})`)),
    `axe ${what}`,
  ).toEqual([])
}

/** Mô tả phần tử đang focus và các lỗi: ẩn, trong vùng aria-hidden/inert, thiếu viền focus. */
function inspectFocus(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body || el === document.documentElement) return { body: true as const }
    // Nút công cụ của Next ở chế độ dev (không có trong bản build), không phải giao diện của site.
    if (el.tagName === 'NEXTJS-PORTAL') return { body: false as const, label: 'nextjs-portal', problems: [] as string[], mark: false }
    const mark = el.hasAttribute('data-kb-first')
    const label = `<${el.tagName.toLowerCase()}> "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}"`
    const problems: string[] = []
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) problems.push('không nhìn thấy')
    const hidden = el.closest('[aria-hidden="true"], [inert]')
    if (hidden) problems.push(`nằm trong ${hidden.hasAttribute('inert') ? 'inert' : 'aria-hidden'}`)
    const cs = getComputedStyle(el)
    const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2
    const shadow = cs.boxShadow !== 'none'
    if (!outline && !shadow) problems.push(`không có viền focus (outline ${cs.outlineStyle} ${cs.outlineWidth})`)
    return { body: false as const, label, problems, mark }
  })
}

for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
  for (const route of AUDIT_ROUTES) {
    test(`Tab ${route.name} ${vpName}`, async ({ page }) => {
      test.setTimeout(120_000)
      await open(page, route.path, vp)
      // Phần tử Tab tới được cuối cùng của trang (liên kết cuối của footer ở trang chủ; footer gọn không có liên kết).
      await page.evaluate(() => {
        const tabbable = [...document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]')].filter(
          (el) =>
            !el.matches(':disabled, [tabindex="-1"]') &&
            !el.closest('[inert], [hidden]') &&
            el.checkVisibility({ visibilityProperty: true }),
        )
        tabbable[tabbable.length - 1]?.setAttribute('data-kb-last', '')
      })
      const bad: string[] = []
      let reachedLast = false
      let left = false
      for (let i = 0; i < MAX_TABS; i++) {
        await page.keyboard.press('Tab')
        const info = await inspectFocus(page)
        if (info.body) {
          left = true
          break
        }
        if (info.mark) break
        if (i === 0) await page.evaluate(() => document.activeElement?.setAttribute('data-kb-first', ''))
        for (const p of info.problems) bad.push(`#${i} ${info.label}: ${p}`)
        if (await page.evaluate(() => document.activeElement?.hasAttribute('data-kb-last') ?? false)) reachedLast = true
      }
      expect(bad, 'focus').toEqual([])
      expect(reachedLast, `tới phần tử cuối trang (rời trang: ${left})`).toBe(true)
    })
  }
}

test.describe('menu mobile', () => {
  test('Enter mở, Tab không ra ngoài, Escape đóng và trả focus', async ({ page }) => {
    await open(page, '/', VIEWPORTS.mobile)
    const toggle = page.getByRole('button', { name: 'Mở menu' })
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const menu = page.getByRole('dialog', { name: 'Menu' })
    await expect(menu).toBeVisible()
    await expect(page.getByRole('button', { name: 'Đóng menu' })).toBeFocused()
    const insideMenu = () => page.evaluate(() => !!document.activeElement?.closest('#menu-mobile'))
    for (const key of ['Tab', 'Shift+Tab']) {
      for (let i = 0; i < 16; i++) {
        await page.keyboard.press(key)
        expect(await insideMenu(), `${key} lần ${i + 1}`).toBe(true)
      }
    }
    await axeClean(page, 'menu mobile mở')
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toBeFocused()
  })
})

test.describe('lightbox thư viện', () => {
  test('Enter mở, Tab vòng trong hộp, Escape đóng và trả focus về ô đã mở', async ({ page }) => {
    await open(page, '/thu-vien')
    const tile = page.locator('a[data-code]').nth(1)
    await tile.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await axeClean(page, 'lightbox mở')
    const inside = () => page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'))
    for (const key of ['Tab', 'Shift+Tab']) {
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press(key)
        expect(await inside(), `${key} lần ${i + 1}`).toBe(true)
      }
    }
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(tile).toBeFocused()
  })
})

test.describe('CraftJourney', () => {
  test('Tab tới Tiếp/Trước, Enter và Space đổi công đoạn', async ({ page }) => {
    await open(page, '/nghe-det-chieu')
    const section = page.locator('section[aria-labelledby]').filter({ has: page.locator('ol[aria-label] button') })
    const current = () => section.locator('ol[aria-label] button[aria-current=step]').innerText()
    const first = await current()
    const next = section.locator('button', { hasText: /^\s*(Tiếp|Công đoạn tiếp)/ }).first()
    const nextName = (await section.locator('button[aria-label]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))).find((n) => /tiếp/i.test(n ?? ''))
    const nextBtn = nextName ? section.getByRole('button', { name: nextName }) : next
    // Tab thật từ nút công đoạn hiện tại tới nút Tiếp.
    await section.locator('ol[aria-label] button[aria-current=step]').focus()
    let reached = false
    for (let i = 0; i < 30 && !reached; i++) {
      await page.keyboard.press('Tab')
      reached = await nextBtn.evaluate((el) => el === document.activeElement)
    }
    expect(reached, 'Tab tới nút Tiếp').toBe(true)
    await page.keyboard.press('Enter')
    const second = await current()
    expect(second).not.toBe(first)
    await page.keyboard.press('Space')
    expect(await current()).not.toBe(second)
  })
})

test.describe('Tabs so sánh', () => {
  test('mũi tên, Home, End đổi tab (component đã hỗ trợ)', async ({ page }) => {
    await open(page, '/nghe-det-chieu')
    const tabs = page.getByRole('tablist').first().getByRole('tab')
    expect(await tabs.count()).toBeGreaterThan(1)
    await tabs.first().focus()
    await page.keyboard.press('ArrowRight')
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(tabs.nth(1)).toBeFocused()
    await page.keyboard.press('Home')
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('End')
    await expect(tabs.last()).toHaveAttribute('aria-selected', 'true')
  })
})

test.describe('PatternExplorer', () => {
  test('chọn điểm hoa văn bằng Enter, Escape đóng và trả focus về điểm', async ({ page }) => {
    const route = AUDIT_ROUTES.find((r) => r.name === 'chi tiết sản phẩm')!
    await open(page, route.path)
    const marker = page.locator('button[aria-pressed].rounded-full').filter({ visible: true }).first()
    await marker.focus()
    await page.keyboard.press('Enter')
    await expect(marker).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('Escape')
    await expect(marker).toHaveAttribute('aria-pressed', 'false')
    await expect(marker).toBeFocused()
  })
})

test.describe('form Kết nối', () => {
  test('gửi trống bằng Enter: khung tổng hợp lỗi nhận focus', async ({ page }) => {
    await open(page, '/ket-noi')
    const name = page.getByLabel('Họ và tên')
    await name.focus()
    await page.keyboard.press('Enter')
    const alert = page.locator('main [role=alert]')
    await expect(alert).toContainText('mục cần bổ sung')
    await expect(alert).toBeFocused()
  })
})

import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { loginReviewer, scrollThrough } from './helpers'
import { AUDIT_ROUTES, VIEWPORTS } from './helpers/routes'

// Chụp toàn trang bản preview để ghép cạnh ảnh thiết kế (tools/screens-sheet.mjs). So bằng mắt, không so pixel (R14).
// Chạy: SCREENS=1 npm run test:e2e -- --project=chromium --no-deps tests/e2e/screens.e2e.spec.ts
const ON = process.env.SCREENS === '1'
const OUT = 'test-results/screens'

type Shot = {
  screen: string
  path: string
  viewport: { width: number; height: number }
  openMenu?: true
}

const SHOTS: Shot[] = [
  ...AUDIT_ROUTES.flatMap((r) =>
    r.screen
      ? [
          { screen: r.screen.desktop, path: r.path, viewport: VIEWPORTS.desktop },
          { screen: r.screen.mobile, path: r.path, viewport: VIEWPORTS.mobile },
        ]
      : [],
  ),
  { screen: 'MenuMobile', path: '/', viewport: VIEWPORTS.mobile, openMenu: true },
  // Components và Foundations trong thiết kế đều tương ứng với /styleguide.
  { screen: 'Components', path: '/styleguide', viewport: VIEWPORTS.desktop },
  { screen: 'Foundations', path: '/styleguide', viewport: VIEWPORTS.desktop },
]

/** Đợi font và mọi ảnh đang hiển thị tải xong để ảnh chụp ổn định. `viewportOnly`: chỉ ảnh nằm trong khung nhìn (ảnh chụp không toàn trang). */
async function settle(page: Page, viewportOnly: boolean) {
  await page.evaluate(() => document.fonts.ready)
  await expect
    .poll(
      () =>
        page.evaluate(
          (onlyInView) =>
            Array.from(document.images)
              .filter(
                (img) =>
                  img.getClientRects().length > 0 && getComputedStyle(img).visibility !== 'hidden',
              )
              .filter((img) => !onlyInView || img.getBoundingClientRect().top < window.innerHeight)
              .filter((img) => !(img.complete && img.naturalWidth > 0))
              .map((img) => img.currentSrc || img.src),
          viewportOnly,
        ),
      { timeout: 30_000 },
    )
    .toEqual([])
}

test.describe('ảnh chụp so với thiết kế', () => {
  test.skip(!ON, 'đặt SCREENS=1 để chụp ảnh so sánh')

  for (const shot of SHOTS) {
    test(`${shot.screen} (${shot.viewport.width})`, async ({ page }) => {
      test.setTimeout(120_000)
      mkdirSync(OUT, { recursive: true })
      await page.setViewportSize(shot.viewport)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await loginReviewer(page)
      const res = await page.goto(shot.path)
      expect(res?.status()).toBe(200)
      await page.waitForLoadState('networkidle')
      if (shot.openMenu) {
        await page.getByRole('button', { name: 'Mở menu' }).click()
        await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()
      } else {
        await scrollThrough(page)
      }
      await settle(page, !!shot.openMenu)
      await page.screenshot({ path: `${OUT}/${shot.screen}.png`, fullPage: !shot.openMenu })
    })
  }
})

import { expect, test, type BrowserContext, type Page } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { REVIEWER_STATE } from '../global-setup'

export const SHOTS = process.env.SHOTS_DIR

export const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
] as const

/**
 * Dùng phiên người duyệt seed đã đăng nhập sẵn ở global-setup để bản preview hiện ảnh chưa được phép.
 * Không có phiên (thiếu SEED_REVIEWER_EMAIL/PASSWORD) thì bỏ qua test kèm lý do, không để test qua rỗng.
 */
export async function loginReviewer(page: Page) {
  test.skip(!existsSync(REVIEWER_STATE), `Thiếu phiên người duyệt (${REVIEWER_STATE}): đặt SEED_REVIEWER_EMAIL và SEED_REVIEWER_PASSWORD để global-setup đăng nhập.`)
  const { cookies } = JSON.parse(readFileSync(REVIEWER_STATE, 'utf8')) as { cookies: Parameters<BrowserContext['addCookies']>[0] }
  await page.context().addCookies(cookies)
  const me = await page.request.get('/api/users/me')
  expect((await me.json()).user).toBeTruthy()
}

/** Cuộn từng đoạn tới cuối trang để ảnh lazy tải xong, rồi về đầu trang. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 200))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForLoadState('networkidle')
}

/** Mọi img đang hiển thị trong main đã tải xong và có kích thước thật. */
export async function expectVisibleImagesLoaded(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          [...document.querySelectorAll('main img')]
            .filter((el) => (el as HTMLElement).getClientRects().length > 0)
            .filter((el) => !(el as HTMLImageElement).complete || (el as HTMLImageElement).naturalWidth === 0)
            .map((el) => (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src),
        ),
      { timeout: 15_000 },
    )
    .toEqual([])
}

/** Chụp toàn trang vào SHOTS_DIR (đăng nhập người duyệt, cuộn hết trang trước khi chụp). */
export async function shootFullPage(page: Page, open: (p: Page) => Promise<void>, name: string, vp: { width: number; height: number; name: string }) {
  await page.setViewportSize({ width: vp.width, height: vp.height })
  mkdirSync(SHOTS!, { recursive: true })
  await loginReviewer(page)
  await open(page)
  await scrollThrough(page)
  await page.screenshot({ path: `${SHOTS}/${name}-${vp.name}.png`, fullPage: true })
}

/** Nút/link nhỏ hơn 44x44 trong main (`scope` mặc định `main`; admin không có <main> nên truyền selector khác) (trừ chú thích nguồn và link trong đoạn văn). Trả danh sách để so với []. */
export async function smallTargets(page: Page, scope = 'main') {
  return page.evaluate((scope) => {
    const out: string[] = []
    document.querySelectorAll(`${scope} a, ${scope} button`).forEach((el) => {
      if (el.matches('.fn, [id^="nguon-"] a') || (el.closest('p') && el.tagName === 'A')) return
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      if (r.height < 43.5 || r.width < 43.5) out.push(`${el.tagName} "${(el.textContent ?? '').trim().slice(0, 30)}" ${r.width}x${r.height}`)
    })
    return out
  }, scope)
}

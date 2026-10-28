// Giảm chuyển động (Phase 7, Task 6): với prefers-reduced-motion: reduce, không còn Reveal ẩn, không animation đang chạy,
// không transition/animation nào dài hơn 0.01s. Chạy ở project `chromium` (bản xem trước, :3000).
import { expect, test, type Page } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import { REVIEWER_STATE } from './global-setup'
import { AUDIT_ROUTES, VIEWPORTS } from './helpers/routes'

test.use({ reducedMotion: 'reduce' })

const MAX_S = 0.01

async function open(page: Page, path: string) {
  if (existsSync(REVIEWER_STATE)) {
    const { cookies } = JSON.parse(readFileSync(REVIEWER_STATE, 'utf8'))
    await page.context().addCookies(cookies)
  }
  const res = await page.goto(path)
  expect(res, path).toBeTruthy()
  await page.waitForLoadState('load')
}

/** Reveal đánh dấu `data-reveal`; ở reduced-motion phải ở trạng thái idle: hiện đủ, không dịch chuyển. */
function revealCount(page: Page) {
  return page.evaluate(() => document.querySelectorAll('[data-reveal]').length)
}

function hiddenReveals(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
      .filter((el) => {
        const cs = getComputedStyle(el)
        return el.dataset.reveal !== 'idle' || cs.opacity !== '1' || (cs.translate !== 'none' && cs.translate !== '') || cs.transform !== 'none'
      })
      .map((el) => `${el.dataset.reveal} opacity=${getComputedStyle(el).opacity} translate=${getComputedStyle(el).translate}`),
  )
}

function runningAnimations(page: Page) {
  return page.evaluate(() =>
    document.getAnimations().filter((a) => a.playState === 'running').map((a) => {
      const t = (a.effect as KeyframeEffect | null)?.target as Element | null
      return `${a.constructor.name} ${(a as CSSTransition).transitionProperty ?? (a as CSSAnimation).animationName} <${t?.tagName.toLowerCase()} class="${(t?.getAttribute('class') ?? '').slice(0, 80)}">`
    }),
  )
}

/**
 * Phần tử hiển thị có transition/animation dài hơn 0.01s. Giá trị computed là danh sách ("0.2s, 0s"): xét từng phần tử.
 * Ngoại lệ có chủ đích: transition chỉ gồm thuộc tính màu (color, background-color, border-color, outline-color, fill, stroke,
 * text-decoration-color) không chạy khi chưa hover/focus (opacity KHÔNG nằm trong nhóm này: transition opacity ở trạng thái nghỉ vẫn là chuyển động), nên không tạo chuyển động ở trạng thái tĩnh.
 * Vẫn đo chính xác: bỏ qua chỉ khi MỌI thuộc tính có thời lượng > 0.01s đều thuộc nhóm này VÀ không có animation.
 */
function slowMotion(page: Page) {
  return page.evaluate((max) => {
    const secs = (v: string) => v.split(',').map((s) => { const t = s.trim(); return t.endsWith('ms') ? parseFloat(t) / 1000 : parseFloat(t) })
    const COLOR = /^(color|background-color|border-color|border-top-color|border-bottom-color|border-left-color|border-right-color|outline-color|text-decoration-color|fill|stroke)$/
    const out: string[] = []
    for (const el of document.body.querySelectorAll<HTMLElement>('*')) {
      if (!el.checkVisibility({ visibilityProperty: true })) continue
      const cs = getComputedStyle(el)
      const ad = secs(cs.animationDuration)
      const td = secs(cs.transitionDuration)
      const tp = cs.transitionProperty.split(',').map((s) => s.trim())
      const slowAnim = cs.animationName !== 'none' && ad.some((d) => d > max)
      // `transition-property: none` (motion-reduce:transition-none) thì thời lượng còn lại không có tác dụng.
      const slowProps = tp.filter((p, i) => p !== 'none' && td[i % td.length] > max)
      const onlyColor = slowProps.length > 0 && slowProps.every((p) => COLOR.test(p))
      if (slowAnim || (slowProps.length > 0 && !onlyColor)) {
        out.push(`<${el.tagName.toLowerCase()} class="${(el.getAttribute('class') ?? '').slice(0, 80)}"> anim=${cs.animationName}/${cs.animationDuration} trans=${cs.transitionProperty}/${cs.transitionDuration}`)
      }
    }
    return out
  }, MAX_S)
}

for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
  for (const route of AUDIT_ROUTES) {
    test(`giảm chuyển động ${vpName}: ${route.name}`, async ({ page }) => {
      await page.setViewportSize(vp)
      await open(page, route.path)
      // Chỉ HomeView dùng Reveal. Không có phần tử nào thì kiểm bên dưới thành vô nghĩa, nên bắt buộc phải thấy.
      if (route.path === '/') expect(await revealCount(page), 'trang chủ phải có [data-reveal]').toBeGreaterThan(0)
      expect(await hiddenReveals(page), 'Reveal còn ẩn/dịch chuyển').toEqual([])
      await page.waitForTimeout(100)
      expect(await runningAnimations(page), 'animation đang chạy sau load').toEqual([])
      expect(await slowMotion(page), 'transition/animation > 0.01s').toEqual([])
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)) }
        window.scrollTo(0, document.body.scrollHeight)
      })
      await page.waitForTimeout(150)
      expect(await hiddenReveals(page), 'Reveal sau khi cuộn').toEqual([])
      expect(await runningAnimations(page), 'animation đang chạy sau khi cuộn').toEqual([])
      expect(await slowMotion(page), 'transition/animation > 0.01s sau khi cuộn').toEqual([])
    })
  }
}

import { expect, test } from '@playwright/test'

// h1 hero không được tràn sang ảnh hay ra ngoài khung ở tablet.
for (const width of [768, 1024]) {
  test(`hero h1 không tràn ở ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const m = await page.evaluate(() => {
      const h1 = document.querySelector('main h1') as HTMLElement
      const fig = document.querySelector('main section figure') as HTMLElement | null
      const hr = h1.getBoundingClientRect()
      // Lấy mép phải thật của chữ, kể cả phần tràn khỏi hộp.
      const range = document.createRange()
      range.selectNodeContents(h1)
      const textRight = Math.max(hr.right, range.getBoundingClientRect().right)
      return {
        textRight, figLeft: fig ? fig.getBoundingClientRect().left : null,
        scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth,
      }
    })
    expect(m.scrollWidth).toBeLessThanOrEqual(m.innerWidth)
    expect(m.textRight).toBeLessThanOrEqual(m.figLeft ?? m.innerWidth)
  })
}

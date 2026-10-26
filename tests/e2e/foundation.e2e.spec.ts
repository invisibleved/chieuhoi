import { expect, test } from '@playwright/test'

test.describe('nền tảng frontend', () => {
  test('trang gốc có lang vi, nền Cói, font Việt', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html[lang="vi"]')).toHaveCount(1)

    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(bg).toBe('rgb(243, 235, 221)')

    // next/font đổi tên family (vd. __Noto_Serif_Display_abc), nên khớp theo regex.
    const family = await page
      .locator('h1')
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily)
    expect(family).toMatch(/Noto.?Serif.?Display/i)
  })

  test('reduced motion đưa --dur-ui về 0ms', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const dur = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--dur-ui').trim(),
    )
    // Tailwind/Lightning CSS rút gọn 0ms thành 0s; hai giá trị tương đương.
    expect(dur).toMatch(/^0(ms|s)$/)
  })
})

import { expect, test } from '@playwright/test'

test('can go on homepage', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await expect(page).toHaveTitle(/Chiếu Hới/)
  await expect(page.locator('main h1')).toHaveCount(1)
})

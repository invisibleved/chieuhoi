// CLS < 0.1 (spec) trên bản production public (:3100), không giảm chuyển động. Project `a11y-public`.
import { expect, test } from '@playwright/test'
import { openAuditRoute } from './helpers/open'
import { AUDIT_ROUTES, VIEWPORTS } from './helpers/routes'

const MAX_CLS = 0.1

// Canary: chứng minh bộ đo hoạt động (nếu không, mọi giá trị 0 đều vô nghĩa). Trang tự tạo một dịch chuyển đã biết.
test('canary: bộ đo layout-shift thấy dịch chuyển đã biết', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __cls: number }
    w.__cls = 0
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) w.__cls += e.value
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto('data:text/html,<div id=a style="height:100px">x</div><p>y</p>')
  expect(await page.evaluate(() => PerformanceObserver.supportedEntryTypes.includes('layout-shift'))).toBe(true)
  await page.evaluate(() => { document.getElementById('a')!.style.height = '400px' })
  await page.waitForTimeout(300)
  expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeGreaterThan(0)
})

for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
  for (const route of AUDIT_ROUTES) {
    test(`CLS ${vpName}: ${route.name}`, async ({ page }) => {
      await page.setViewportSize(vp)
      await page.addInitScript(() => {
        const w = window as unknown as { __cls: number; __shifts: string[] }
        w.__cls = 0
        w.__shifts = []
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean; sources?: { node?: Element }[] }[]) {
            if (e.hadRecentInput) continue
            w.__cls += e.value
            const n = e.sources?.[0]?.node as Element | undefined
            w.__shifts.push(`${e.value.toFixed(4)} <${n?.tagName?.toLowerCase()} class="${(n?.getAttribute?.('class') ?? '').slice(0, 80)}">`)
          }
        }).observe({ type: 'layout-shift', buffered: true })
      })
      await openAuditRoute(page, route, { publicBuild: true, waitUntil: 'load' })
      const height = await page.evaluate(() => document.documentElement.scrollHeight)
      for (let y = 0; y <= height; y += 400) {
        await page.evaluate((top) => window.scrollTo(0, top), y)
        await page.waitForTimeout(60)
      }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      await page.waitForTimeout(500)
      const { cls, shifts } = await page.evaluate(() => {
        const w = window as unknown as { __cls: number; __shifts: string[] }
        if (!PerformanceObserver.supportedEntryTypes.includes('layout-shift') || typeof w.__cls !== 'number') throw new Error('bộ đo CLS không hoạt động')
        return { cls: w.__cls, shifts: w.__shifts }
      })
      test.info().annotations.push({ type: 'cls', description: cls.toFixed(4) })
      console.log(`CLS ${vpName} ${route.path}: ${cls.toFixed(4)}`)
      expect(cls, `CLS ${cls.toFixed(4)}: ${shifts.join(' | ')}`).toBeLessThan(MAX_CLS)
    })
  }
}

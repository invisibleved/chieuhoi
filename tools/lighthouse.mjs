// Lighthouse cho mọi route kiểm của Phase 7. Dùng: npm run audit:lighthouse -- --base=http://localhost:3100 --out=.superpowers/x.json
// Ngưỡng: Accessibility >= 95 và CLS < 0.1; vi phạm thì thoát mã 1. Chỉ ghi JSON tóm tắt (báo cáo đầy đủ chứa ảnh chụp).
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { launch } from 'chrome-launcher'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import { chromium } from '@playwright/test'
import { AUDIT_ROUTES } from '../tests/e2e/helpers/routes.ts'

const A11Y_MIN = 95
const CLS_MAX = 0.1

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const i = a.indexOf('=')
      return i < 0 ? [a.slice(2), 'true'] : [a.slice(2, i), a.slice(i + 1)]
    }),
)
const base = (args.base ?? 'http://localhost:3100').replace(/\/$/, '')
const out = args.out
const extraHeaders = args.auth ? { Authorization: `Basic ${Buffer.from(args.auth).toString('base64')}` } : undefined

const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox'],
})

const rows = []
const skipped = []
try {
  for (const route of AUDIT_ROUTES) {
    // Bản public (PREVIEW_ALL=false) không có nội dung chưa duyệt: trang chi tiết đó trả 404 đúng thiết kế, ghi lại là bỏ qua.
    const status = (await fetch(`${base}${route.path}`, { headers: extraHeaders, redirect: 'manual' })).status
    if (status === 404) {
      skipped.push({ route: route.path, status })
      continue
    }
    for (const formFactor of ['mobile', 'desktop']) {
      const flags = {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['accessibility', 'performance'],
        extraHeaders,
      }
      const result = await lighthouse(`${base}${route.path}`, flags, formFactor === 'desktop' ? desktopConfig : undefined)
      const lhr = result?.lhr
      if (!lhr || lhr.runtimeError) throw new Error(`Lighthouse lỗi ở ${route.path}: ${lhr?.runtimeError?.message ?? 'không có kết quả'}`)
      rows.push({
        route: route.path,
        formFactor,
        accessibility: Math.round((lhr.categories.accessibility.score ?? 0) * 100),
        performance: Math.round((lhr.categories.performance.score ?? 0) * 100),
        cls: Number((lhr.audits['cumulative-layout-shift'].numericValue ?? 0).toFixed(4)),
        lcp: Math.round(lhr.audits['largest-contentful-paint'].numericValue ?? 0),
      })
    }
  }
} finally {
  await chrome.kill()
}

console.table(rows)
for (const s of skipped) console.log(`SKIP ${s.route} (HTTP ${s.status})`)
if (out) {
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, `${JSON.stringify({ base, rows, skipped }, null, 2)}\n`)
}

const failed = rows.filter((r) => r.accessibility < A11Y_MIN || r.cls >= CLS_MAX)
for (const r of failed) console.error(`FAIL ${r.route} (${r.formFactor}): a11y=${r.accessibility}, CLS=${r.cls}`)
if (rows.length === 0) console.error('FAIL không route nào chạy được')
process.exit(failed.length > 0 || rows.length === 0 ? 1 : 0)

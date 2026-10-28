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
const isPublic = args.public === 'true'
const extraHeaders = args.auth ? { Authorization: `Basic ${Buffer.from(args.auth).toString('base64')}` } : undefined

const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox'],
})

const rows = []
const skipped = []
const failures = []
try {
  for (const route of AUDIT_ROUTES) {
    const res = await fetch(`${base}${route.path}`, { headers: extraHeaders, redirect: 'manual', signal: AbortSignal.timeout(30_000) })
    // Chỉ route nháp (draftOnPublic) mới được bỏ qua khi chạy với --public; mọi 404 khác là lỗi.
    if (res.status === 404 && route.draftOnPublic && isPublic) {
      skipped.push({ route: route.path, status: res.status })
      continue
    }
    if (res.status !== 200) {
      failures.push(`${route.path}: HTTP ${res.status}`)
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
        cls: lhr.audits['cumulative-layout-shift'].numericValue ?? null,
        a11yRaw: lhr.categories.accessibility.score,
        lcp: Math.round(lhr.audits['largest-contentful-paint'].numericValue ?? 0),
      })
    }
  }
} finally {
  await chrome.kill()
}

console.table(rows.map(({ a11yRaw: _raw, ...r }) => ({ ...r, cls: r.cls === null ? null : Number(r.cls.toFixed(4)) })))
for (const s of skipped) console.log(`SKIP ${s.route} (HTTP ${s.status})`)
if (out) {
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, `${JSON.stringify({ base, rows: rows.map(({ a11yRaw: _raw, ...r }) => r), skipped, failures }, null, 2)}\n`)
}

const failed = rows.filter((r) => r.a11yRaw === null || r.a11yRaw * 100 < A11Y_MIN || r.cls === null || r.cls >= CLS_MAX)
for (const r of failed) console.error(`FAIL ${r.route} (${r.formFactor}): a11y=${r.a11yRaw === null ? 'null' : r.a11yRaw * 100}, CLS=${r.cls}`)
for (const f of failures) console.error(`FAIL ${f}`)
console.log(`${rows.length} lượt đo, ${skipped.length} route bỏ qua, ${failed.length + failures.length} lỗi`)
process.exit(failed.length > 0 || failures.length > 0 || rows.length === 0 ? 1 : 0)

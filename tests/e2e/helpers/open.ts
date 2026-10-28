import { expect, type Page } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import { REVIEWER_STATE } from '../global-setup'
import type { AuditRoute } from './routes'

type Options = {
  /** Bản production public (:3100): không đăng nhập người duyệt; route `draftOnPublic` trả 404. */
  publicBuild?: boolean
  waitUntil?: 'load' | 'networkidle'
}

/**
 * Mở một route kiểm và khẳng định mã HTTP: 200, trừ route `draftOnPublic` ở bản public (404 là đúng, trang 404 vẫn được quét).
 * Bản xem trước thì nạp phiên người duyệt (nếu có) để hiện ảnh chưa được phép.
 */
export async function openAuditRoute(page: Page, route: Pick<AuditRoute, 'path' | 'draftOnPublic'>, options: Options = {}) {
  const { publicBuild = false, waitUntil = 'networkidle' } = options
  if (!publicBuild && existsSync(REVIEWER_STATE)) {
    const { cookies } = JSON.parse(readFileSync(REVIEWER_STATE, 'utf8'))
    await page.context().addCookies(cookies)
  }
  const res = await page.goto(route.path)
  expect(res, route.path).toBeTruthy()
  const expected = publicBuild && route.draftOnPublic ? 404 : 200
  expect(res!.status(), `${route.path} (HTTP)`).toBe(expected)
  await page.waitForLoadState(waitUntil)
}

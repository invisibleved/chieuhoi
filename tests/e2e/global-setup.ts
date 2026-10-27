import { request } from '@playwright/test'
import { mkdirSync } from 'node:fs'

export const REVIEWER_STATE = 'playwright/.auth/reviewer.json'

// Đăng nhập người duyệt seed MỘT lần cho cả lượt chạy. Đăng nhập song song nhiều worker cùng một user
// làm Payload ghi đè mảng phiên của nhau, nên một số phiên mất hiệu lực và ảnh preview trả 403.
export default async function globalSetup() {
  const email = process.env.SEED_REVIEWER_EMAIL
  const password = process.env.SEED_REVIEWER_PASSWORD
  if (!email || !password) return
  mkdirSync('playwright/.auth', { recursive: true })
  const ctx = await request.newContext({ baseURL: 'http://localhost:3000' })
  const res = await ctx.post('/api/users/login', { data: { email, password } })
  if (!res.ok()) throw new Error(`Đăng nhập người duyệt seed thất bại: ${res.status()}`)
  await ctx.storageState({ path: REVIEWER_STATE })
  await ctx.dispose()
}

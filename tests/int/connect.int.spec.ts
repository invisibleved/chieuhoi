// @vitest-environment node
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createPages } from '@/lib/content/pages'
import { createContent } from '@/lib/content/queries'
import { seed } from '@/seed'

import { getTestPayload, resetDb } from './helpers'

let payload: Payload
let pages: ReturnType<typeof createPages>
const savedAppEnv = process.env.APP_ENV
const savedForce = process.env.SEED_FORCE_GLOBALS

// Seed không có email/phone nên không xoá được giá trị cũ của lần chạy trước: đặt lại tường minh.
const setContact = async (data: { email: string; phone: string }) => {
  const [u] = (await payload.find({ collection: 'users', overrideAccess: true })).docs
  await payload.updateGlobal({
    slug: 'site-settings', overrideAccess: true, user: { ...u, collection: 'users' },
    data: { ...data, _status: 'published' } as never,
  })
}

describe('view model Kết nối', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    await resetDb(payload)
    process.env.APP_ENV = 'development'
    process.env.SEED_FORCE_GLOBALS = 'true'
    await seed(payload)
    await setContact({ email: '', phone: '' })
    pages = createPages(payload, createContent(payload))
  }, 240_000)
  afterAll(() => {
    if (savedAppEnv === undefined) delete process.env.APP_ENV
    else process.env.APP_ENV = savedAppEnv
    if (savedForce === undefined) delete process.env.SEED_FORCE_GLOBALS
    else process.env.SEED_FORCE_GLOBALS = savedForce
  })

  it('public: email/điện thoại null, địa chỉ là chuỗi seed, visitInfo null, tiêu đề giữ \\n (R17)', async () => {
    const v = await pages.getConnectPage('public')
    expect(v.contact.email).toBeNull()
    expect(v.contact.phone).toBeNull()
    expect(v.contact.address).toBe('Làng Hới (Hải Triều), xã Long Hưng, tỉnh Hưng Yên')
    expect(v.contact.addressNote).toContain('Vietnam+')
    expect(v.contact.visitInfo).toBeNull()
    expect(v.intro.title).toContain('\n')
    expect(v.copy.contact.preview).toBeNull()
  })

  it('preview: email/điện thoại vẫn null (R-P1), component tự hiện placeholder', async () => {
    const v = await pages.getConnectPage('preview')
    expect(v.contact.email).toBeNull()
    expect(v.contact.phone).toBeNull()
    expect(v.contact.visitInfo).toBeNull()
    expect(v.copy.contact.preview?.email).toBe('[Email liên hệ]')
  })

  it('giá trị có dấu chưa xác minh: ẩn ở public, nguyên văn ở preview', async () => {
    await setContact({ email: 'a@b.vn', phone: '[cần xác minh]' })
    const pub = await pages.getConnectPage('public')
    expect(pub.contact.email).toBe('a@b.vn')
    expect(pub.contact.phone).toBeNull()
    const pre = await pages.getConnectPage('preview')
    expect(pre.contact.phone).toBe('[cần xác minh]')
    await setContact({ email: '', phone: '' })
  })
})

// @vitest-environment node
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createPages } from '@/lib/content/pages'
import { createContent } from '@/lib/content/queries'
import { seed } from '@/seed'

import { getTestPayload, resetDb, syncPagesFromGlobal } from './helpers'

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
    await syncPagesFromGlobal(payload)
    await setContact({ email: '', phone: '' })
    pages = createPages(payload, createContent(payload))
  }, 240_000)
  afterAll(() => {
    if (savedAppEnv === undefined) delete process.env.APP_ENV
    else process.env.APP_ENV = savedAppEnv
    if (savedForce === undefined) delete process.env.SEED_FORCE_GLOBALS
    else process.env.SEED_FORCE_GLOBALS = savedForce
  })

  it('public: email/điện thoại null, địa chỉ là chuỗi seed, visit là câu thật, tiêu đề giữ \\n (R17)', async () => {
    const v = await pages.getConnectPage('public')
    expect(v.contact.email).toBeNull()
    expect(v.contact.phone).toBeNull()
    expect(v.contact.mobileLine).toBeNull()
    expect(v.contact.address).toBe('Làng Hới (Hải Triều), xã Long Hưng, tỉnh Hưng Yên')
    expect(v.contact.addressNote).toBe('Trước đây: xã Tân Lễ, huyện Hưng Hà, tỉnh Thái Bình')
    expect(v.contact.visit).toEqual({ desktop: 'Chưa có thông tin tham quan chính thức', mobile: 'Thăm làng: chưa có thông tin chính thức' })
    expect(v.intro.title).toContain('\n')
    expect(v.copy.contact.preview).toBeNull()
  })

  it('preview: email/điện thoại là placeholder không có liên kết (R18)', async () => {
    const v = await pages.getConnectPage('preview')
    expect(v.contact.email).toEqual({ text: '[Email liên hệ]', href: null })
    expect(v.contact.phone).toEqual({ text: '[Số điện thoại]', href: null })
    expect(v.contact.mobileLine).toEqual({
      parts: [{ text: '[Email liên hệ]', href: null }, { text: '[Số điện thoại]', href: null }],
      separator: ' · ',
    })
    expect(v.copy.contact.preview?.email).toBe('[Email liên hệ]')
  })

  it('giá trị có dấu chưa xác minh: ẩn ở public, nguyên văn ở preview', async () => {
    await setContact({ email: 'a@b.vn', phone: '[cần xác minh]' })
    const pub = await pages.getConnectPage('public')
    expect(pub.contact.email).toEqual({ text: 'a@b.vn', href: 'mailto:a@b.vn' })
    expect(pub.contact.phone).toBeNull()
    expect(pub.contact.mobileLine).toEqual({ parts: [{ text: 'a@b.vn', href: 'mailto:a@b.vn' }], separator: ' · ' })
    const pre = await pages.getConnectPage('preview')
    expect(pre.contact.phone).toEqual({ text: '[cần xác minh]', href: null })
    await setContact({ email: '', phone: '' })
  })
})

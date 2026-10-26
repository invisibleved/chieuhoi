import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import type { User } from '@/payload-types'

import { getTestPayload, makeUser, resetDb } from './helpers'

let payload: Payload
let editor: User
let reviewer: User

// Payload gõ kiểu data theo tham số draft; test cố ý truyền _status trực tiếp.
const update = (data: Record<string, unknown>, user: User, draft?: boolean) =>
  payload.updateGlobal({
    slug: 'site-settings',
    data,
    user,
    overrideAccess: false,
    draft,
  } as never) as Promise<{ tagline?: string; _status?: string }>
const readLive = () =>
  payload.findGlobal({ slug: 'site-settings', draft: false, overrideAccess: true }) as Promise<{
    tagline?: string
    _status?: string
  }>

describe('globals site-settings và page-intros', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  beforeEach(async () => {
    await resetDb(payload)
    editor = await makeUser(payload, 'editor')
    reviewer = await makeUser(payload, 'reviewer')
    // Global tồn tại giữa các test: đưa về trạng thái nháp.
    await payload.updateGlobal({
      slug: 'site-settings',
      data: { tagline: 'khởi tạo', _status: 'draft' },
      draft: false,
      user: reviewer,
      overrideAccess: true,
    } as never)
  })

  it('editor không đăng site-settings', async () => {
    await expect(update({ tagline: 'X', _status: 'published' }, editor)).rejects.toThrow()
  })

  it('reviewer đăng được', async () => {
    await update({ tagline: 'Đã đăng', _status: 'published' }, reviewer)
    expect((await readLive()).tagline).toBe('Đã đăng')
  })

  it('sau khi đăng, editor lưu nháp được và bản đăng không đổi', async () => {
    await update({ tagline: 'Bản đăng', _status: 'published' }, reviewer)
    await update({ tagline: 'Bản nháp', _status: 'draft' }, editor, true)
    const live = await readLive()
    expect(live.tagline).toBe('Bản đăng')
    expect(live._status).toBe('published')
  })

  it('sau khi đăng, editor cập nhật không phải nháp bị từ chối', async () => {
    await update({ tagline: 'Bản đăng', _status: 'published' }, reviewer)
    await expect(update({ tagline: 'Sửa thẳng' }, editor)).rejects.toThrow()
    expect((await readLive()).tagline).toBe('Bản đăng')
  })

  it('khách không đọc global qua API', async () => {
    await expect(
      payload.findGlobal({ slug: 'site-settings', overrideAccess: false }),
    ).rejects.toThrow()
    await expect(
      payload.findGlobal({ slug: 'page-intros', overrideAccess: false }),
    ).rejects.toThrow()
  })
})

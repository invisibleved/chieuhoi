// @vitest-environment node
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { createPreview } from '@/lib/content/preview'

import { getTestPayload, makeUser, resetDb } from './helpers'

let payload: Payload
let canPreview: (h: Headers) => Promise<boolean>

describe('canPreview', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    canPreview = createPreview(payload).canPreview
    await resetDb(payload)
  })

  it('không header: false', async () => {
    expect(await canPreview(new Headers())).toBe(false)
  })
  it('JWT của user đăng nhập: true', async () => {
    const u = await makeUser(payload, 'editor')
    const { token } = await payload.login({ collection: 'users', data: { email: u.email, password: 'Test-password-123' } })
    expect(token).toBeTruthy()
    expect(await canPreview(new Headers({ Authorization: `JWT ${token}` }))).toBe(true)
  })
  it('cookie rác: false', async () => {
    expect(await canPreview(new Headers({ Cookie: 'payload-token=abc' }))).toBe(false)
  })
})

import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { getTestPayload, makeUser, resetDb } from './helpers'

let payload: Payload

describe('users', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  beforeEach(async () => {
    await resetDb(payload)
  })

  const newUser = (email: string) => ({
    email,
    password: 'Test-password-123',
    name: 'Mới',
    role: 'editor' as const,
  })

  it('editor không tạo được user', async () => {
    const editor = await makeUser(payload, 'editor')
    await expect(
      payload.create({
        collection: 'users',
        data: newUser('x1@example.test'),
        user: editor,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('reviewer tạo được user', async () => {
    const reviewer = await makeUser(payload, 'reviewer')
    const created = await payload.create({
      collection: 'users',
      data: newUser('x2@example.test'),
      user: reviewer,
      overrideAccess: false,
    })
    expect(created.role).toBe('editor')
  })

  it('editor không tự nâng role', async () => {
    const editor = await makeUser(payload, 'editor')
    let result: { role?: string } | undefined
    try {
      result = await payload.update({
        collection: 'users',
        id: editor.id,
        data: { role: 'reviewer' },
        user: editor,
        overrideAccess: false,
      })
    } catch {
      result = undefined
    }
    const after = await payload.findByID({ collection: 'users', id: editor.id })
    expect(after.role).toBe('editor')
    if (result) expect(result.role).toBe('editor')
  })

  it('khách không đọc được users', async () => {
    await makeUser(payload, 'editor')
    await expect(payload.find({ collection: 'users', overrideAccess: false })).rejects.toThrow()
  })

  it('user đầu tiên khi DB trống được tạo và thành reviewer', async () => {
    const first = await payload.create({
      collection: 'users',
      data: newUser('first@example.test'),
      overrideAccess: false,
    })
    expect(first.role).toBe('reviewer')
    await expect(
      payload.create({
        collection: 'users',
        data: newUser('second@example.test'),
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})

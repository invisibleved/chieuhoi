// @vitest-environment node
import { handleEndpoints, type Payload } from 'payload'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { getTestPayload, makeUser, resetDb } from './helpers'

let payload: Payload

describe('users', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  const savedFlag = process.env.ALLOW_FIRST_USER
  beforeEach(async () => {
    await resetDb(payload)
  })
  afterEach(() => {
    if (savedFlag === undefined) delete process.env.ALLOW_FIRST_USER
    else process.env.ALLOW_FIRST_USER = savedFlag
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

  it('không bật ALLOW_FIRST_USER thì khách không tạo được user đầu tiên', async () => {
    delete process.env.ALLOW_FIRST_USER
    await expect(
      payload.create({
        collection: 'users',
        data: newUser('nope@example.test'),
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    process.env.ALLOW_FIRST_USER = 'false'
    await expect(
      payload.create({
        collection: 'users',
        data: newUser('nope2@example.test'),
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('user đầu tiên khi DB trống được tạo và thành reviewer', async () => {
    process.env.ALLOW_FIRST_USER = 'true'
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
  it('first-register bị chặn khi không bật ALLOW_FIRST_USER (DB trống)', async () => {
    delete process.env.ALLOW_FIRST_USER
    const config = (await import('@/payload.config')).default
    const res = await handleEndpoints({
      config,
      request: new Request('http://localhost/api/users/first-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser('claim@example.test')),
      }),
    })
    expect(res.status).toBeGreaterThanOrEqual(400)
    const { totalDocs } = await payload.count({ collection: 'users' })
    expect(totalDocs).toBe(0)
  })
})

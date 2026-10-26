import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { getTestPayload, makeUser, resetDb } from './helpers'

let payload: Payload

const create = (data: Record<string, unknown>) =>
  payload.create({
    collection: 'people',
    data,
    user: undefined,
    overrideAccess: true,
  } as never)

describe('people.slug không chứa tên', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  beforeEach(async () => {
    await resetDb(payload)
    await makeUser(payload, 'reviewer')
  })

  it('từ chối slug chứa tên đã bỏ dấu', async () => {
    await expect(create({ slug: 'nguyen-van-a-nghe-nhan', name: 'Nguyễn Văn A' })).rejects.toThrow()
    await expect(create({ slug: 'bà-đào', name: 'Đào' })).rejects.toThrow()
  })

  it('cho phép slug không chứa tên, hoặc khi chưa có tên', async () => {
    await create({ slug: 'mau-nghe-nhan', name: 'Nguyễn Văn A' })
    await create({ slug: 'nguyen-van-b' })
  })
})

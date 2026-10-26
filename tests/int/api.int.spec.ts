import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { getTestPayload, resetDb } from './helpers'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    await resetDb(payload)
  })

  it('fetches users', async () => {
    const users = await payload.find({ collection: 'users' })
    expect(users).toBeDefined()
    expect(users.totalDocs).toBe(0)
  })
})

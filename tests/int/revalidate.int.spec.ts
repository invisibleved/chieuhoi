import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import type { User } from '@/payload-types'

import { getTestPayload, makeUser, resetDb } from './helpers'

let payload: Payload
let reviewer: User

describe('revalidate ngoài request Next', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  beforeEach(async () => {
    await resetDb(payload)
    reviewer = await makeUser(payload, 'reviewer')
  })

  it('tạo, đăng, sửa, xoá story đều thành công', async () => {
    const ctx = { user: reviewer, overrideAccess: false as const }
    const story = (await payload.create({
      collection: 'stories',
      data: { slug: 'rv', title: 'T', workflow: 'draft', _status: 'draft' },
      ...ctx,
    } as never)) as { id: number | string }
    await expect(
      payload.update({
        collection: 'stories',
        id: story.id,
        data: { workflow: 'published', _status: 'published' },
        ...ctx,
      } as never),
    ).resolves.toBeTruthy()
    await expect(
      payload.update({ collection: 'stories', id: story.id, data: { title: 'T2', _status: 'published' }, ...ctx } as never),
    ).resolves.toBeTruthy()
    await expect(payload.delete({ collection: 'stories', id: story.id, ...ctx })).resolves.toBeTruthy()
  })

  it('cập nhật global site-settings thành công', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: { tagline: 'x', _status: 'published' },
        user: reviewer,
        overrideAccess: false,
      } as never),
    ).resolves.toBeTruthy()
  })

  it('tạo nguồn thành công', async () => {
    await expect(
      payload.create({
        collection: 'sources',
        data: { sourceId: 'rv-1', title: 'Nguồn' },
        user: reviewer,
        overrideAccess: false,
      }),
    ).resolves.toBeTruthy()
  })
})

// @vitest-environment node
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { countPending } from '@/admin/dashboard/pending'

import { getTestPayload, makeUser, resetDb } from './helpers'

let payload: Payload
let reviewer: Awaited<ReturnType<typeof makeUser>>
let editor: Awaited<ReturnType<typeof makeUser>>

const asUser = (u: { id: number | string }) => ({ ...u, collection: 'users' })
let seq = 0
const story = (data: Record<string, unknown>) =>
  payload.create({
    collection: 'stories',
    data: { title: 'Bài thử', slug: `bai-thu-${(seq += 1)}`, category: 'history', ...data },
    user: asUser(reviewer),
    overrideAccess: true,
  } as never)

describe('countPending', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    await resetDb(payload)
    reviewer = await makeUser(payload, 'reviewer')
    editor = await makeUser(payload, 'editor')
    // 1) chưa từng đăng, đang chờ duyệt
    await story({ workflow: 'in_review', _status: 'draft' })
    // 2) đã đăng; bản nháp mới nhất đang chờ duyệt (hàng chính vẫn là published)
    const live = (await story({ workflow: 'published', _status: 'published' })) as { id: number }
    await payload.update({ collection: 'stories', id: live.id, draft: true, data: { workflow: 'in_review' }, user: asUser(reviewer), overrideAccess: true } as never)
    // 3) bản nháp thường
    await story({ workflow: 'draft', _status: 'draft' })
    // 4) từng chờ duyệt, bản nháp mới nhất đã quay về draft: không tính
    const back = (await story({ workflow: 'in_review', _status: 'draft' })) as { id: number }
    await payload.update({ collection: 'stories', id: back.id, draft: true, data: { workflow: 'draft' }, user: asUser(reviewer), overrideAccess: true } as never)
  }, 120_000)
  afterAll(async () => {
    await resetDb(payload)
  })

  it('người duyệt nhận số bài chờ duyệt, tính cả bản nháp chưa từng đăng và bản sửa của bài đã đăng, không tính bài đã quay về nháp', async () => {
    const rows = await countPending(payload, asUser(reviewer))
    const stories = rows.find((r) => r.collection === 'stories')
    expect(stories).toMatchObject({
      label: 'Bài viết',
      count: 2,
      href: '/admin/collections/stories?where[workflow][equals]=in_review',
    })
    expect(rows.filter((r) => r.collection !== 'stories').every((r) => r.count === 0)).toBe(true)
  })

  it('biên tập viên nhận []', async () => {
    expect(await countPending(payload, asUser(editor))).toEqual([])
  })
})

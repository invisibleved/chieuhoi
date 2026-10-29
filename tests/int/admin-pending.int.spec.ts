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
    overrideAccess: true,
  } as never)

describe('countPending', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    await resetDb(payload)
    reviewer = await makeUser(payload, 'reviewer')
    editor = await makeUser(payload, 'editor')
    await story({ workflow: 'in_review', _status: 'draft' })
    await story({ workflow: 'in_review', _status: 'draft' })
    await story({ workflow: 'draft', _status: 'draft' })
  }, 120_000)
  afterAll(async () => {
    await resetDb(payload)
  })

  it('người duyệt nhận số bài chờ duyệt, kể cả bản nháp chưa từng đăng', async () => {
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

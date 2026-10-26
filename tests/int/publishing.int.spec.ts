import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import type { User } from '@/payload-types'

import { getTestPayload, makeUser, resetDb } from './helpers'

let payload: Payload
let editor: User
let reviewer: User

const base = { label: '1457', title: 'Mốc', order: 1 }
const asEditor = () => ({ user: editor, overrideAccess: false as const })
const asReviewer = () => ({ user: reviewer, overrideAccess: false as const })

type Ctx = { user: User; overrideAccess: false; draft?: boolean }
// Payload gõ kiểu data theo tham số draft; test cố ý truyền _status trực tiếp.
const createEv = (data: Record<string, unknown>, ctx: Ctx) =>
  payload.create({ collection: 'timeline-events', data, ...ctx } as never) as Promise<{
    id: number | string
    label: string
    workflow?: string
  }>

describe('quy trình đăng', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  beforeEach(async () => {
    await resetDb(payload)
    editor = await makeUser(payload, 'editor')
    reviewer = await makeUser(payload, 'reviewer')
  })

  it('editor lưu nháp được', async () => {
    await expect(
      createEv(
        { ...base, _status: 'draft' },
        {
          ...asEditor(),
        },
      ),
    ).resolves.toBeTruthy()
  })

  it('editor không đăng được (create và update)', async () => {
    await expect(
      createEv(
        { ...base, _status: 'published' },
        {
          ...asEditor(),
        },
      ),
    ).rejects.toThrow()
    const doc = await createEv(
      { ...base, _status: 'draft' },
      {
        ...asEditor(),
      },
    )
    await expect(
      payload.update({
        collection: 'timeline-events',
        id: doc.id,
        data: { _status: 'published' },
        ...asEditor(),
      }),
    ).rejects.toThrow()
  })

  it('editor không đặt workflow published', async () => {
    await expect(
      createEv(
        { ...base, _status: 'draft', workflow: 'published' },
        {
          draft: true,
          ...asEditor(),
        },
      ),
    ).rejects.toThrow()
  })

  it('editor chuyển chờ duyệt được', async () => {
    const doc = await createEv(
      { ...base, _status: 'draft', workflow: 'in_review' },
      {
        ...asEditor(),
      },
    )
    expect(doc.workflow).toBe('in_review')
  })

  it('editor không sửa confidence', async () => {
    const doc = await createEv(
      { ...base, _status: 'draft' },
      {
        ...asEditor(),
      },
    )
    await payload.update({
      collection: 'timeline-events',
      id: doc.id,
      data: { confidence: 'press' },
      draft: true,
      ...asEditor(),
    })
    const read = await payload.findByID({
      collection: 'timeline-events',
      id: doc.id,
      draft: true,
      overrideAccess: true,
    })
    expect(read.confidence).toBe('pending')
  })

  it('reviewer đăng thì workflow thành published', async () => {
    const doc = await createEv(
      { ...base, _status: 'draft', workflow: 'in_review' },
      {
        ...asEditor(),
      },
    )
    await payload.update({
      collection: 'timeline-events',
      id: doc.id,
      data: { _status: 'published' },
      ...asReviewer(),
    })
    const read = await payload.findByID({
      collection: 'timeline-events',
      id: doc.id,
      overrideAccess: true,
    })
    expect(read._status).toBe('published')
    expect(read.workflow).toBe('published')
  })

  it('editor lưu nháp trên bản đã đăng không gỡ đăng', async () => {
    const doc = await createEv(
      { ...base, _status: 'published' },
      {
        ...asReviewer(),
      },
    )
    await payload.update({
      collection: 'timeline-events',
      id: doc.id,
      data: { title: 'Bản nháp mới' },
      draft: true,
      ...asEditor(),
    })
    const live = await payload.findByID({
      collection: 'timeline-events',
      id: doc.id,
      overrideAccess: true,
    })
    expect(live._status).toBe('published')
    expect(live.title).toBe('Mốc')
  })

  it('editor không xoá được', async () => {
    const doc = await createEv(
      { ...base, _status: 'draft' },
      {
        ...asEditor(),
      },
    )
    await expect(
      payload.delete({ collection: 'timeline-events', id: doc.id, ...asEditor() }),
    ).rejects.toThrow()
  })

  it('khách không đọc được qua API', async () => {
    await expect(
      payload.find({ collection: 'timeline-events', overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('nguồn: sourceId là duy nhất và label chấp nhận chuỗi tự do', async () => {
    await payload.create({
      collection: 'sources',
      data: { sourceId: 'vietnamplus-2026', title: 'Bài' },
      ...asEditor(),
    })
    await expect(
      payload.create({
        collection: 'sources',
        data: { sourceId: 'vietnamplus-2026', title: 'Khác' },
        ...asEditor(),
      }),
    ).rejects.toThrow()
    const ev = await createEv(
      { ...base, label: '[?]', _status: 'draft' },
      {
        ...asEditor(),
      },
    )
    expect(ev.label).toBe('[?]')
  })
})

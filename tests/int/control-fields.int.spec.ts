import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import type { User } from '@/payload-types'

import { getTestPayload, makeUser, resetDb } from './helpers'

let payload: Payload
let editor: User
let reviewer: User

type Slug = 'craft-steps' | 'products' | 'stories' | 'people' | 'makers'

// Dữ liệu tối thiểu để tạo doc hợp lệ cho từng collection.
const minimal: Record<string, Record<string, unknown>> = {
  'craft-steps': { n: 1, title: 'Cắt cói' },
  products: { slug: 'chieu-1', name: 'Chiếu' },
  people: { slug: 'nguoi-1' },
  makers: { name: 'Cơ sở A' },
}

// [collection, đường dẫn trường, giá trị reviewer đặt, giá trị editor thử ghi]
const cases: [string, string, unknown, unknown][] = [
  ['craft-steps', 'verifiedBy', 'Người duyệt', 'Kẻ giả mạo'],
  ['products', 'typeConfirmed', true, false],
  ['people', 'consent.name', true, false],
  ['people', 'consent.photo', true, false],
  ['people', 'consent.quote', true, false],
  ['people', 'reviewedBySubject', true, false],
  ['makers', 'verified', true, false],
  ['makers', 'publicConsent', true, false],
]

const nest = (path: string, value: unknown): Record<string, unknown> => {
  const [a, b] = path.split('.')
  return b ? { [a]: { [b]: value } } : { [a]: value }
}
const read = (doc: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], doc)

describe('trường kiểm soát', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  beforeEach(async () => {
    await resetDb(payload)
    editor = await makeUser(payload, 'editor')
    reviewer = await makeUser(payload, 'reviewer')
  })

  it.each(cases)('editor không sửa được %s.%s', async (collection, path, rv, ev) => {
    const created = await payload.create({
      collection: collection as Slug,
      data: { ...minimal[collection], ...nest(path, rv), _status: 'draft' },
      draft: true,
      user: reviewer,
      overrideAccess: false,
    } as never)
    const id = (created as { id: number | string }).id

    // Phải chạy xong không lỗi; trường kiểm soát bị bỏ qua âm thầm.
    await expect(
      payload.update({
        collection: collection as Slug,
        id,
        data: nest(path, ev),
        draft: true,
        user: editor,
        overrideAccess: false,
      } as never),
    ).resolves.toBeTruthy()

    const after = await payload.findByID({
      collection: collection as Slug,
      id,
      draft: true,
      overrideAccess: true,
    } as never)
    expect(read(after, path)).toEqual(rv)
  })

  it('story chấp nhận workflow idea', async () => {
    await expect(
      payload.create({
        collection: 'stories',
        data: { slug: 's-1', title: 'Ý tưởng', workflow: 'idea', _status: 'draft' },
        draft: true,
        user: editor,
        overrideAccess: false,
      } as never),
    ).resolves.toMatchObject({ workflow: 'idea' })
  })

  it('product không chấp nhận workflow idea', async () => {
    await expect(
      payload.create({
        collection: 'products',
        data: { slug: 'p-1', name: 'Chiếu', workflow: 'idea', _status: 'draft' },
        draft: false,
        user: editor,
        overrideAccess: false,
      } as never),
    ).rejects.toThrow()
  })
})

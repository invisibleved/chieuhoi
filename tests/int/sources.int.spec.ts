// @vitest-environment node
import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { createContent } from '@/lib/content/queries'

import { getTestPayload, resetDb } from './helpers'

let payload: Payload

/** Lỗi validate field nằm trong error.data.errors (message chung chỉ nêu tên field). */
const fieldError = (message: RegExp) => ({ data: { errors: [{ message: expect.stringMatching(message) }] } })

const createSource = (data: Record<string, unknown>) =>
  payload.create({
    collection: 'sources',
    data: { sourceId: `s-${Math.random().toString(36).slice(2)}`, title: 'Nguồn thử', ...data },
    overrideAccess: true,
  } as never)

describe('sources: kiểm dữ liệu', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  beforeEach(async () => {
    await resetDb(payload)
  })

  it('url javascript: bị từ chối', async () => {
    await expect(createSource({ url: 'javascript:alert(1)' })).rejects.toMatchObject(fieldError(/Chỉ nhận đường dẫn http/))
  })

  it('url https và trống được nhận', async () => {
    await expect(createSource({ url: 'https://example.test/a' })).resolves.toBeTruthy()
    await expect(createSource({ url: '' })).resolves.toBeTruthy()
    await expect(createSource({})).resolves.toBeTruthy()
  })

  it('date sai dạng bị từ chối', async () => {
    await expect(createSource({ date: '14/08/2026' })).rejects.toMatchObject(fieldError(/YYYY-MM-DD/))
    await expect(createSource({ date: '2026-02-30' })).rejects.toMatchObject(fieldError(/YYYY-MM-DD/))
  })

  it('date đúng dạng và trống được nhận', async () => {
    await expect(createSource({ date: '2026-08-14' })).resolves.toBeTruthy()
    await expect(createSource({ date: '' })).resolves.toBeTruthy()
  })

  it('getSources bỏ url không phải http', async () => {
    const doc = (await createSource({ url: 'https://example.test/a' })) as { id: number }
    await payload.db.updateOne({
      collection: 'sources',
      id: doc.id,
      data: { url: 'ftp://x' },
    } as never)
    const sources = await createContent(payload).getSources('public')
    expect(sources[0].url).toBeNull()
  })
})

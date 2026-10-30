// @vitest-environment node
import path from 'path'
import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import type { User } from '@/payload-types'

import { getTestPayload, makeUser, resetDb } from './helpers'

const fixture = path.resolve(__dirname, '../fixtures/tiny.webp')

let payload: Payload
let reviewer: User

const asset = () =>
  payload.create({
    collection: 'archive-assets', data: { alt: 'Ảnh thử' }, filePath: fixture, overrideAccess: true,
  } as never) as Promise<{ id: number }>

const save = (data: Record<string, unknown>) =>
  payload.updateGlobal({
    slug: 'page-intros', data: { ...data, _status: 'published' }, user: reviewer, overrideAccess: true,
  } as never)

describe('page-intros: media theo ô', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  beforeEach(async () => {
    await resetDb(payload)
    reviewer = await makeUser(payload, 'reviewer')
  })

  it('hai phần tử cùng slot thì lỗi validate', async () => {
    const a = await asset()
    await expect(
      save({
        'lang-hoi': { media: [{ slot: 'hero', image: a.id }, { slot: 'hero', image: a.id }] },
      }),
    ).rejects.toThrow()
  })

  it('slot ngoài danh sách của trang thì bị từ chối', async () => {
    await expect(save({ 'lang-hoi': { media: [{ slot: 'hand' }] } })).rejects.toThrow()
  })

  it('xoá asset đang gắn vào slot: lưu lại global vẫn được', async () => {
    const a = await asset()
    await save({ 'nghe-det-chieu': { media: [{ slot: 'hero', image: a.id, caption: 'x' }] } })
    await payload.delete({ collection: 'archive-assets', id: a.id, user: reviewer, overrideAccess: true } as never)
    await expect(save({ 'nghe-det-chieu': { eyebrow: 'Sửa' } })).resolves.toBeTruthy()
    const g = (await payload.findGlobal({ slug: 'page-intros', depth: 0, overrideAccess: true })) as {
      'nghe-det-chieu': { media: { slot: string; image: number | null }[] }
    }
    expect(g['nghe-det-chieu'].media[0].slot).toBe('hero')
    expect(g['nghe-det-chieu'].media[0].image).toBeNull()
  })

  it('title giữ ngắt dòng', async () => {
    await save({ 'nghe-det-chieu': { title: 'Một tấm chiếu,\nmuôn công đoạn.' } })
    const g = await payload.findGlobal({ slug: 'page-intros', depth: 0, overrideAccess: true })
    expect(g['nghe-det-chieu']?.title).toBe('Một tấm chiếu,\nmuôn công đoạn.')
  })

  it('bảng thông tin thiếu Mục thì bị từ chối', async () => {
    await expect(save({ 'lang-hoi': { facts: [{ term: '', detail: 'x' }] } })).rejects.toThrow()
  })

  it('dụng cụ quá 3 dòng thì bị từ chối', async () => {
    const tools = [1, 2, 3, 4].map((n) => ({ name: `Dụng cụ ${n}` }))
    await expect(save({ 'nghe-det-chieu': { tools } })).rejects.toThrow()
  })

  it('dòng so sánh thiếu Khía cạnh thì bị từ chối', async () => {
    await expect(save({ 'nghe-det-chieu': { compareRows: [{ aspect: '' }] } })).rejects.toThrow()
  })
})

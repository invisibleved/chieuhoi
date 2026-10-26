// @vitest-environment node
import { readFileSync } from 'fs'
import path from 'path'
import { beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'

import { seed } from '@/seed'
import { getTestPayload, resetDb } from './helpers'

const sources = JSON.parse(
  readFileSync(path.resolve(process.cwd(), 'content/seed/sources.json'), 'utf8'),
) as unknown[]

describe('seed', () => {
  let payload: Payload
  beforeAll(async () => {
    payload = await getTestPayload()
    await resetDb(payload)
    process.env.APP_ENV = 'development'
    await seed(payload)
    await seed(payload)
  }, 240_000)

  const count = async (collection: string, where?: object) =>
    (await payload.count({ collection: collection as 'sources', where: where as never, overrideAccess: true })).totalDocs

  it('không nhân đôi bản ghi sau hai lần chạy', async () => {
    expect(await count('sources')).toBe(sources.length)
    expect(await count('craft-steps')).toBe(7)
    expect(await count('archive-assets', { inArchive: { equals: true } })).toBe(14)
    expect(await count('archive-assets')).toBe(23)
    expect(await count('timeline-events')).toBe(7)
    expect(await count('products')).toBe(7)
    expect(await count('stories')).toBe(6)
    expect(await count('users')).toBe(1)
  })

  it('ảnh tham khảo: rights unknown, consent pending', async () => {
    const bad = await count('archive-assets', {
      or: [{ rights: { not_equals: 'unknown' } }, { subjectConsent: { not_equals: 'pending' } }],
    })
    expect(bad).toBe(0)
  })

  it('bài Trạng Chiếu có trích dẫn nguồn', async () => {
    const res = await payload.find({
      collection: 'stories',
      where: { slug: { equals: 'chuyen-ve-trang-chieu' } },
      draft: true,
      overrideAccess: true,
      limit: 1,
    })
    expect(JSON.stringify(res.docs[0]?.body)).toContain('"blockType":"cite"')
  })

  it('trạng thái đăng theo seed', async () => {
    const idea = await payload.find({ collection: 'stories', where: { workflow: { equals: 'idea' } }, overrideAccess: true })
    expect(idea.totalDocs).toBe(5)
    const published = await payload.find({ collection: 'sources', overrideAccess: true })
    expect(published.totalDocs).toBe(3)
  })

  it('mốc 1531 khớp nguyên văn artboard', async () => {
    const res = await payload.find({
      collection: 'timeline-events',
      where: { label: { equals: '1531' } },
      overrideAccess: true,
      limit: 1,
    })
    expect(res.docs[0]?.body).toBe('Dân làng tôn ông làm Phúc thần và gọi là "Trạng Chiếu".')
    expect(res.docs[0]?.confidence).toBe('press')
  })
})

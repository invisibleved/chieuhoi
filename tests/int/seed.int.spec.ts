// @vitest-environment node
import { readFileSync } from 'fs'
import path from 'path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'

import { seed } from '@/seed'
import { getTestPayload, resetDb } from './helpers'

const sources = JSON.parse(
  readFileSync(path.resolve(process.cwd(), 'content/seed/sources.json'), 'utf8'),
) as unknown[]

describe('seed', () => {
  let payload: Payload
  const savedAppEnv = process.env.APP_ENV
  const savedForce = process.env.SEED_FORCE_GLOBALS
  afterAll(() => {
    if (savedAppEnv === undefined) delete process.env.APP_ENV
    else process.env.APP_ENV = savedAppEnv
    if (savedForce === undefined) delete process.env.SEED_FORCE_GLOBALS
    else process.env.SEED_FORCE_GLOBALS = savedForce
  })
  beforeAll(async () => {
    payload = await getTestPayload()
    await resetDb(payload)
    process.env.APP_ENV = 'development'
    delete process.env.SEED_FORCE_GLOBALS
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

  it('tên file công khai không lộ tên gốc, sourceFile giữ khoá seed', async () => {
    const res = await payload.find({ collection: 'archive-assets', limit: 100, overrideAccess: true })
    for (const d of res.docs) {
      expect(d.sourceFile).toBeTruthy()
      expect(d.filename).not.toBe(d.sourceFile)
    }
  })

  it('chạy lại không ghi đè global đã đăng, trừ khi SEED_FORCE_GLOBALS=true', async () => {
    const [reviewer] = (await payload.find({ collection: 'users', overrideAccess: true })).docs
    await payload.updateGlobal({
      slug: 'site-settings',
      data: { tagline: 'Sửa tay', _status: 'published' },
      user: { ...reviewer, collection: 'users' },
      overrideAccess: true,
    } as never)
    await seed(payload)
    const kept = await payload.findGlobal({ slug: 'site-settings', draft: false, overrideAccess: true })
    expect(kept.tagline).toBe('Sửa tay')
    process.env.SEED_FORCE_GLOBALS = 'true'
    try {
      await seed(payload)
    } finally {
      delete process.env.SEED_FORCE_GLOBALS
    }
    const forced = await payload.findGlobal({ slug: 'site-settings', draft: false, overrideAccess: true })
    expect(forced.tagline).not.toBe('Sửa tay')
  }, 240_000)

  it('page-intros: đủ ô ảnh, tiêu đề nhiều dòng; công đoạn có shortTitle/toRecord', async () => {
    const g = (await payload.findGlobal({ slug: 'page-intros', draft: false, depth: 0, overrideAccess: true })) as {
      'nghe-det-chieu': { title: string; media: { slot: string; image: number | null }[] }
      'lang-hoi': { media: { slot: string }[] }
    }
    expect(g['nghe-det-chieu'].media.map((m) => m.slot)).toEqual(
      ['hero', 'tool-1', 'tool-2', 'tool-3', 'hand', 'machine', 'next-people', 'next-stories', 'next-products'],
    )
    expect(g['nghe-det-chieu'].media.every((m) => m.image)).toBe(true)
    expect(g['lang-hoi'].media.map((m) => m.slot)).toEqual(['hero', 'life-1', 'life-2', 'life-3'])
    expect(g['nghe-det-chieu'].title).toBe('Một tấm chiếu,\nmuôn công đoạn.')
    const step = (await payload.find({
      collection: 'craft-steps', where: { n: { equals: 2 } }, draft: true, overrideAccess: true,
    })).docs[0] as { shortTitle?: string; toRecord?: string }
    expect(step.shortTitle).toBe('Xử lý')
    expect(step.toRecord).toBe('Các bước xử lý sợi và tên gọi địa phương.')
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
    const json = JSON.stringify(res.docs[0]?.body)
    expect(json).toContain('"blockType":"cite"')
    // Đúng một khối ảnh, thay cho đoạn chứa token; không còn token thô trong bài.
    expect(json.match(/"blockType":"figure"/g)).toHaveLength(1)
    expect(json).not.toContain('[[figure:')
    expect(res.docs[0]?.reviewChecklist).toHaveLength(3)
  })

  it('page-intros.cau-chuyen: lead mobile và 2 ảnh Đọc tiếp', async () => {
    const g = (await payload.findGlobal({ slug: 'page-intros', draft: false, depth: 0, overrideAccess: true })) as {
      'cau-chuyen': { lead: string; media: { slot: string; image: number | null }[] }
    }
    expect(g['cau-chuyen'].lead).toBe('Ký ức, lịch sử và đời sống hôm nay của làng Hới.')
    expect(g['cau-chuyen'].media.map((m) => m.slot)).toEqual(['next-village', 'next-craft'])
    expect(g['cau-chuyen'].media.every((m) => m.image)).toBe(true)
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

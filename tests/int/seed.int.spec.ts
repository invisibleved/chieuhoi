// @vitest-environment node
import { readFileSync } from 'fs'
import path from 'path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'

import { seed } from '@/seed'
import { importPageFacts } from '@/seed/pageFacts'
import { PAGE_FACT_SOURCE_IDS } from '@/seed/data/pageFacts'
import { getTestPayload, makeUser, resetDb } from './helpers'

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
    expect(published.totalDocs).toBe(5)
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

  it('Sản phẩm: ô ảnh san-pham, bối cảnh/hoa văn/chú thích của chieu-cap-dieu', async () => {
    const g = (await payload.findGlobal({ slug: 'page-intros', draft: false, depth: 0, overrideAccess: true })) as unknown as {
      'san-pham': { media: { slot: string; image: number | null }[] }
    }
    expect(g['san-pham'].media).toHaveLength(1)
    expect(g['san-pham'].media[0]).toMatchObject({ slot: 'next-pattern' })
    expect(g['san-pham'].media[0].image).toBeTruthy()
    const [p] = (await payload.find({
      collection: 'products', where: { slug: { equals: 'chieu-cap-dieu' } }, depth: 0, draft: true, overrideAccess: true,
    })).docs
    expect(p.context).toMatch(/^Chiếu cạp điều có trong danh sách/)
    expect(p.pattern).toBe('In bằng khuôn [cần xác minh cho tấm này]')
    expect(p.size).toBeFalsy()
    expect(p.care).toBeFalsy()
    expect(p.maker).toBeFalsy()
    expect(p.annotations?.map((a) => a.shortTitle)).toEqual(['Viền', 'Hoa văn', 'Mặt cói'])
  })
})

describe('importPageFacts', () => {
  let payload: Payload
  const savedAppEnv = process.env.APP_ENV
  beforeAll(async () => {
    payload = await getTestPayload()
    process.env.APP_ENV = 'development'
  }, 60_000)
  afterAll(() => {
    if (savedAppEnv === undefined) delete process.env.APP_ENV
    else process.env.APP_ENV = savedAppEnv
  })

  type Group = Record<string, unknown>
  type Intros = { _status?: string | null; 'lang-hoi': Group; 'nghe-det-chieu': Group }
  const read = async (draft: boolean) =>
    (await payload.findGlobal({ slug: 'page-intros', draft, depth: 0, overrideAccess: true })) as unknown as Intros
  const reviewerUser = async () => ({ ...(await makeUser(payload, 'reviewer')), collection: 'users' as const })
  const count = async (collection: string) =>
    (await payload.count({ collection: collection as 'sources', overrideAccess: true })).totalDocs

  const EMPTY_VILLAGE = {
    facts: [],
    founder: { paragraphs: [], conflict: [], conflictEditorNote: null, noPortrait: null },
    location: { text: null, sources: [], editorNote: null },
    heritage: { sentences: [], editorNote: null },
    pageSources: [],
  }
  const EMPTY_CRAFT = {
    tools: [],
    hand: { title: null, text: { text: null, mobileText: null, sources: [] }, note: { text: null, mobileText: null, sources: [] } },
    machine: { title: null, text: { text: null, mobileText: null, sources: [] }, note: { text: null, mobileText: null, sources: [] } },
    compareRows: [],
    pageSources: [],
  }

  /** Đăng bản global với mọi nhóm dữ kiện trống (globals không bị resetDb xoá). */
  async function publishEmptyFacts() {
    const user = await reviewerUser()
    const cur = await read(true)
    await payload.updateGlobal({
      slug: 'page-intros',
      data: {
        'lang-hoi': { ...cur['lang-hoi'], ...EMPTY_VILLAGE },
        'nghe-det-chieu': { ...cur['nghe-det-chieu'], ...EMPTY_CRAFT },
        _status: 'published',
      },
      overrideAccess: true,
      user,
    } as never)
  }

  it('fills empty groups and publishes on fresh db', async () => {
    await publishEmptyFacts()
    await resetDb(payload)
    await seed(payload)
    const g = await read(false)
    expect(g._status).toBe('published')
    expect((g['lang-hoi'].facts as unknown[]).length).toBe(3)
    expect((g['nghe-det-chieu'].tools as unknown[]).length).toBe(3)
    expect((g['lang-hoi'].media as unknown[]).length).toBe(4)
    expect(g['lang-hoi'].lead).toBeTruthy()
  }, 240_000)

  it('keeps pending draft and only fills empty groups', async () => {
    const user = await reviewerUser()
    const cur = await read(true)
    const leadBefore = cur['lang-hoi'].lead
    const mediaBefore = cur['lang-hoi'].media
    const craftMediaBefore = cur['nghe-det-chieu'].media
    await payload.updateGlobal({
      slug: 'page-intros',
      data: {
        'lang-hoi': {
          ...cur['lang-hoi'],
          location: { ...(cur['lang-hoi'].location as Group), text: 'Đã sửa' },
          heritage: { sentences: [], editorNote: null },
        },
        _status: 'published',
      },
      overrideAccess: true,
      user,
    } as never)
    const pub = await read(true)
    await payload.updateGlobal({
      slug: 'page-intros',
      data: { 'lang-hoi': { ...pub['lang-hoi'], lead: 'Nháp' } },
      draft: true,
      overrideAccess: true,
      user,
    } as never)

    const report = await importPageFacts(payload, { publish: 'when-no-draft', user })
    expect(report.saved).toBe('draft')
    expect(report.warning).toBeTruthy()
    expect(report.filled).toEqual(['lang-hoi.heritage'])

    const published = await read(false)
    expect(published['lang-hoi'].heritage).toMatchObject({ sentences: [] })
    expect(published['lang-hoi'].lead).toBe(leadBefore)

    const draft = await read(true)
    expect((draft['lang-hoi'].heritage as { sentences: unknown[] }).sentences).toHaveLength(2)
    expect((draft['lang-hoi'].location as Group).text).toBe('Đã sửa')
    expect(draft['lang-hoi'].lead).toBe('Nháp')
    // Không mất ô cũ của route hay route khác.
    expect(draft['lang-hoi'].media).toEqual(mediaBefore)
    expect(draft['nghe-det-chieu'].media).toEqual(craftMediaBefore)
    expect((draft['lang-hoi'].facts as unknown[]).length).toBe(3)
  }, 60_000)

  it('import never publishes and is idempotent', async () => {
    await publishEmptyFacts()
    await resetDb(payload)
    const before = await read(false)

    const first = await importPageFacts(payload, { publish: 'never' })
    expect([...first.sourcesCreated].sort()).toEqual([...PAGE_FACT_SOURCE_IDS].sort())
    expect(first.saved).toBe('draft')
    expect(first.filled).toHaveLength(9)
    expect(first.skipped).toEqual([{ group: 'nghe-det-chieu.pageSources', reason: 'seed không có dữ liệu' }])

    const after = await read(false)
    expect(after['lang-hoi']).toEqual(before['lang-hoi'])
    expect(after['nghe-det-chieu']).toEqual(before['nghe-det-chieu'])
    const draft = await read(true)
    expect((draft['lang-hoi'].facts as unknown[]).length).toBe(3)
    expect((draft['lang-hoi'].pageSources as unknown[]).length).toBe(5)

    const second = await importPageFacts(payload, { publish: 'never' })
    expect(second.sourcesCreated).toEqual([])
    expect([...second.sourcesSkipped].sort()).toEqual([...PAGE_FACT_SOURCE_IDS].sort())
    expect(second.saved).toBe('none')
    expect(second.skipped).toHaveLength(10)
    expect(second.skipped.filter((s) => s.reason === 'đã có dữ liệu')).toHaveLength(9)

    for (const c of ['people', 'products', 'stories', 'archive-assets', 'timeline-events']) {
      expect(await count(c)).toBe(0)
    }
  }, 60_000)

  it('does not edit existing sources', async () => {
    await resetDb(payload)
    await payload.create({
      collection: 'sources',
      data: { sourceId: 'vietnamplus-2026', title: 'Cũ' },
      overrideAccess: true,
    })
    const report = await importPageFacts(payload, { publish: 'never' })
    expect(report.sourcesSkipped).toContain('vietnamplus-2026')
    expect(report.sourcesCreated).not.toContain('vietnamplus-2026')
    const [s] = (await payload.find({
      collection: 'sources', where: { sourceId: { equals: 'vietnamplus-2026' } }, overrideAccess: true,
    })).docs
    expect(s.title).toBe('Cũ')
    expect(await count('sources')).toBe(PAGE_FACT_SOURCE_IDS.length)
  }, 60_000)
})

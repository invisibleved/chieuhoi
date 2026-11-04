// @vitest-environment node
import path from 'path'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createArchive } from '@/lib/content/archive'
import { createContent } from '@/lib/content/queries'
import { seed } from '@/seed'

import { getTestPayload, resetDb, syncPagesFromGlobal } from './helpers'

const fixture = path.resolve(__dirname, '../fixtures/tiny.webp')

let payload: Payload
let archive: ReturnType<typeof createArchive>
const savedAppEnv = process.env.APP_ENV
const savedForce = process.env.SEED_FORCE_GLOBALS

const makeAsset = async (data: Record<string, unknown>) =>
  (await payload.create({
    collection: 'archive-assets',
    data: { inArchive: true, ...data },
    filePath: fixture, overrideAccess: true,
  } as never)) as { id: number }

describe('view model Thư viện', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    await resetDb(payload)
    process.env.APP_ENV = 'development'
    process.env.SEED_FORCE_GLOBALS = 'true'
    await seed(payload)
    await syncPagesFromGlobal(payload)
    archive = createArchive(createContent(payload))
  }, 240_000)
  afterAll(() => {
    if (savedAppEnv === undefined) delete process.env.APP_ENV
    else process.env.APP_ENV = savedAppEnv
    if (savedForce === undefined) delete process.env.SEED_FORCE_GLOBALS
    else process.env.SEED_FORCE_GLOBALS = savedForce
  })

  it('preview: 14 mục theo mã, thống kê, 7 chip chủ đề, chưa có ảnh xưa', async () => {
    const v = await archive.getArchivePage('preview')
    expect(v.items).toHaveLength(14)
    const codes = v.items.map((i) => i.code)
    expect(codes).toEqual([...codes].sort())
    expect(codes[0]).toBe('TL-001')
    expect(v.stats).toEqual({ total: 14, verified: 0 })
    expect(v.categories).toHaveLength(7)
    expect(v.categories[0]).toEqual({ key: 'all', label: 'Tất cả' })
    expect(v.eras.map((e) => e.key)).toEqual(['all', 'old', 'now'])
    expect(v.hasOld).toBe(false)
    const first = v.items[0]
    expect(first.rights.desktop).toBe('Chưa xin phép · không đăng công khai')
    expect(first.rights.mobile).toBe('Chưa xin phép')
    expect(first.photographer).toBe('[cần xác minh]')
    expect(first.sourceVerified).toBe(false)
  })

  it('public: không có tư liệu nào, JSON không lộ ảnh chưa được phép', async () => {
    const v = await archive.getArchivePage('public')
    expect(v.items).toEqual([])
    expect(v.stats.total).toBe(0)
    const json = JSON.stringify(v)
    expect(json).not.toContain('nkc10')
    expect(json).not.toContain('Bên khung dệt')
  })

  it('tư liệu được phép đủ metadata: hiện ở public, nhãn Được phép, đã xác minh nguồn', async () => {
    await makeAsset({
      alt: 'Ảnh thử', code: 'TL-900', title: 'Tư liệu thử', category: 'village', era: 'old',
      rights: 'permitted', subjectConsent: 'not_applicable',
      takenAt: '1990', photographer: 'Nguyễn Văn A', source: 'Gia đình ông A',
    })
    const v = await archive.getArchivePage('public')
    expect(v.items).toHaveLength(1)
    expect(v.items[0].code).toBe('TL-900')
    expect(v.items[0].rights.desktop).toBe('Được phép')
    expect(v.items[0].sourceVerified).toBe(true)
    expect(v.items[0]).toMatchObject({ displayCode: '900', docLabel: 'TL · 900', chipLabel: 'TL · 900 · Làng quê', name: 'Tư liệu thử' })
    expect(v.eras).toEqual([{ key: 'all', label: 'Mọi thời kỳ' }, { key: 'old', label: 'Xưa' }, { key: 'now', label: 'Nay' }])
    expect(v.stats).toEqual({ total: 1, verified: 1 })
    expect(v.hasOld).toBe(true)
  })

  it('photographer có dấu chưa xác minh thì sourceVerified false', async () => {
    await makeAsset({
      alt: 'Ảnh thử 2', code: 'TL-901', category: 'village', era: 'now', rights: 'permitted', subjectConsent: 'not_applicable',
      takenAt: '1990', photographer: '[cần xác minh]', source: 'Gia đình ông A',
    })
    const v = await archive.getArchivePage('preview')
    const item = v.items.find((i) => i.code === 'TL-901')
    expect(item?.sourceVerified).toBe(false)
  })

  it('mã có dấu chưa xác minh: preview giữ, public bỏ hẳn tư liệu', async () => {
    await makeAsset({
      alt: 'Ảnh thử 3', code: 'TL-[cần xác minh]', title: 'Tư liệu mã lạ', category: 'village', era: 'now', rights: 'permitted', subjectConsent: 'not_applicable',
      takenAt: '1990', photographer: 'Nguyễn Văn A', source: 'Gia đình ông A',
    })
    const prev = (await archive.getArchivePage('preview')).items.find((i) => i.title === 'Tư liệu mã lạ')
    expect(prev?.code).toBe('TL-[cần xác minh]')
    const pub = await archive.getArchivePage('public')
    expect(pub.items.find((i) => i.title === 'Tư liệu mã lạ')).toBeUndefined()
    expect(JSON.stringify(pub)).not.toContain('cần xác minh')
  })
})

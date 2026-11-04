// @vitest-environment node
import path from 'path'
import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { createContent } from '@/lib/content/queries'
import type { User } from '@/payload-types'

import { getTestPayload, makeUser, resetDb, upsertPage } from './helpers'

const fixture = path.resolve(__dirname, '../fixtures/tiny.webp')

let payload: Payload
let reviewer: User
let content: ReturnType<typeof createContent>

const pub = (data: Record<string, unknown>) => ({ ...data, _status: 'published' })
const create = (collection: string, data: Record<string, unknown>, draft = false) =>
  payload.create({
    collection, data, draft, user: reviewer, overrideAccess: true,
  } as never) as Promise<{ id: number }>

const asset = (data: Record<string, unknown> = {}) =>
  payload.create({
    collection: 'archive-assets',
    data: { alt: 'Ảnh thử', rights: 'permitted', subjectConsent: 'not_applicable', ...data },
    filePath: fixture,
    overrideAccess: true,
  } as never) as Promise<{ id: number }>

const setGlobal = (slug: string, data: Record<string, unknown>, draft: boolean) =>
  payload.updateGlobal({ slug, data, draft, user: reviewer, overrideAccess: true } as never)

describe('lib/content', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    content = createContent(payload)
  })
  beforeEach(async () => {
    await resetDb(payload)
    reviewer = await makeUser(payload, 'reviewer')
    await setGlobal('site-settings', { _status: 'draft' }, false) // gỡ đăng; tài liệu `pages` đã bị resetDb xoá
  })

  it('public bỏ bản ghi chưa đăng', async () => {
    await create('timeline-events', pub({ label: '1457', title: 'Đã đăng', order: 1 }))
    await create('timeline-events', { label: '1500', title: 'Nháp', order: 2, _status: 'draft' }, true)
    const p = await content.getTimeline('public')
    expect(p).toHaveLength(1)
    const v = await content.getTimeline('preview')
    expect(v).toHaveLength(2)
    expect(v[1].flags).toContain('unpublished')
    expect(v[0].flags).not.toContain('unpublished')
  })

  it('public hiện bản đã đăng, không lộ nháp mới', async () => {
    const ev = await create('timeline-events', pub({ label: '1457', title: 'A', order: 1 }))
    await payload.update({
      collection: 'timeline-events', id: ev.id, data: { title: 'B', _status: 'draft' },
      draft: true, user: reviewer, overrideAccess: true,
    } as never)
    expect((await content.getTimeline('public'))[0].title).toBe('A')
    expect((await content.getTimeline('preview'))[0].title).toBe('B')
  })

  it('bìa không được phép thì null', async () => {
    const cover = await asset({ rights: 'unknown' })
    await create('stories', pub({ slug: 's1', title: 'T', workflow: 'published', cover: cover.id }))
    expect((await content.getStory('s1', 'public'))?.cover).toBeNull()
    expect((await content.getStory('s1', 'preview'))?.cover).not.toBeNull()
  })

  it('getStories/getPeople trả nhãn chuyên mục tiếng Việt', async () => {
    await create('stories', pub({ slug: 'h', title: 'H', workflow: 'published', category: 'village-memory' }))
    await create('people', pub({ slug: 'nn', category: 'artisan', workflow: 'published' }))
    expect((await content.getStories('public')).find((c) => c.slug === 'h')?.category).toBe('Ký ức làng quê')
    expect((await content.getPeople('public')).find((p) => p.slug === 'nn')?.category).toBe('Nghệ nhân')
    expect((await content.getStories('public')).find((c) => c.slug === 'h')?.categoryKey).toBe('village-memory')
    expect((await content.getPeople('public')).find((p) => p.slug === 'nn')?.categoryKey).toBe('artisan')
  })

  it('idea có thẻ, không có trang', async () => {
    await create('stories', pub({ slug: 'y', title: 'Ý tưởng', workflow: 'idea' }))
    const cards = await content.getStories('public')
    expect(cards.find((c) => c.slug === 'y')?.hasDetail).toBe(false)
    expect(await content.getStory('y', 'public')).toBeNull()
  })

  it('khối cite chỉ còn số chú thích, nguồn vào danh sách của bài', async () => {
    const src = await create('sources', { sourceId: 'vnp-1', title: 'Báo' })
    const body = {
      root: {
        type: 'root', direction: 'ltr', format: '', indent: 0, version: 1,
        children: [{
          type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0,
          children: [{ type: 'inlineBlock', version: 1, fields: { blockType: 'cite', source: src.id } }],
        }],
      },
    }
    await create('stories', pub({ slug: 'c', title: 'C', workflow: 'published', body }))
    const s = await content.getStory('c', 'public')
    expect(JSON.stringify(s?.body)).toContain('{"type":"cite","n":1}')
    expect(JSON.stringify(s?.body)).not.toContain('Báo')
    expect(s?.sources.map((x) => x.id)).toEqual(['vnp-1'])
  })

  it('maker chưa đồng ý bị ẩn', async () => {
    const m = await create('makers', pub({ name: 'Cô Lan', publicConsent: false, workflow: 'published' }))
    await create('products', pub({ slug: 'p1', name: 'Chiếu', workflow: 'published', maker: m.id }))
    expect((await content.getProduct('p1', 'public'))?.maker).toBeNull()
    expect((await content.getProduct('p1', 'preview'))?.maker?.name).toBe('Cô Lan')
    const m2 = await create('makers', pub({ name: 'Chú Ba', publicConsent: true, workflow: 'published' }))
    await create('products', pub({ slug: 'p2', name: 'Chiếu 2', workflow: 'published', maker: m2.id }))
    expect((await content.getProduct('p2', 'public'))?.maker?.name).toBe('Chú Ba')
    for (const c of await content.getProducts('preview')) expect(typeof c.typeConfirmed).toBe('boolean')
  })

  it('primaryImage là ảnh CMS đầu tiên: ảnh đầu bị hạn chế thì public trả null dù ảnh thứ hai được phép', async () => {
    const a = await asset({ rights: 'unknown' })
    const b = await asset()
    await create('products', pub({ slug: 'pp', name: 'Chiếu', workflow: 'published', images: [a.id, b.id] }))
    const pubView = await content.getProduct('pp', 'public')
    expect(pubView?.images).toHaveLength(1)
    expect(pubView?.primaryImage).toBeNull()
    const prev = await content.getProduct('pp', 'preview')
    expect(prev?.primaryImage).not.toBeNull()
    await create('products', pub({ slug: 'pq', name: 'Chiếu 2', workflow: 'published', images: [b.id, a.id] }))
    expect((await content.getProduct('pq', 'public'))?.primaryImage).not.toBeNull()
  })

  it('sản phẩm: hasPattern cần ảnh đầu và chú thích; groupLabel lấy từ option', async () => {
    const a = await asset()
    await create('products', pub({
      slug: 'hp', name: 'Chiếu', workflow: 'published', group: 'traditional', images: [a.id],
      annotations: [{ n: 1, title: 'Viền', x: 10, y: 20, body: 'Phần viền.' }],
    }))
    await create('products', pub({ slug: 'np', name: 'Chiếu 2', workflow: 'published', images: [a.id] }))
    const withPattern = await content.getProduct('hp', 'public')
    expect(withPattern?.hasPattern).toBe(true)
    expect(withPattern?.groupLabel).toBe('Chiếu cói truyền thống')
    const without = await content.getProduct('np', 'public')
    expect(without?.hasPattern).toBe(false)
    expect(without?.groupLabel).toBeNull()
  })

  it('thư viện: categoryLabel và eraLabel lấy từ option', async () => {
    await asset({ code: 'L-1', inArchive: true, category: 'history', era: 'now' })
    const by = Object.fromEntries((await content.getArchive('public')).map((i) => [i.image.code, i]))
    expect(by['L-1']).toMatchObject({ categoryLabel: 'Tư liệu lịch sử', eraLabel: 'Nay' })
  })

  it('thư viện chỉ lấy inArchive và ảnh được phép', async () => {
    const k = { category: 'village', era: 'old' }
    await asset({ code: 'A-1', inArchive: true, ...k })
    await asset({ code: 'A-2', inArchive: true, rights: 'unknown', ...k })
    await asset({ code: 'A-3', inArchive: false })
    const p = await content.getArchive('public')
    expect(p.map((i) => i.image.code)).toEqual(['A-1'])
    const v = await content.getArchive('preview')
    expect(v.map((i) => i.image.code)).toEqual(['A-1', 'A-2'])
  })

  it('thư viện: relatedHref chỉ nhận đường dẫn nội bộ và không chứa dấu', async () => {
    const k = { category: 'village', era: 'old', relatedLabel: 'Xem' }
    await asset({ code: 'H-1', inArchive: true, relatedHref: '/san-pham/chieu-1', ...k })
    await asset({ code: 'H-2', inArchive: true, relatedHref: 'https://evil.example', ...k })
    await asset({ code: 'H-3', inArchive: true, relatedHref: '//evil.example', ...k })
    await asset({ code: 'H-4', inArchive: true, relatedHref: '[cần xác minh]', ...k })
    const rel = Object.fromEntries((await content.getArchive('public')).map((i) => [i.image.code, i.related?.href ?? null]))
    expect(rel).toEqual({ 'H-1': '/san-pham/chieu-1', 'H-2': null, 'H-3': null, 'H-4': null })
  })

  it('nguồn có tiêu đề chưa xác minh bị bỏ khỏi public, còn ở preview', async () => {
    await create('sources', { sourceId: 's-ok', title: 'Báo A' })
    await create('sources', { sourceId: 's-bad', title: '[cần xác minh] Báo' })
    expect((await content.getSources('public')).map((s) => s.id)).toEqual(['s-ok'])
    expect((await content.getSources('preview')).map((s) => s.id).sort()).toEqual(['s-bad', 's-ok'])
  })

  it('bài có nguồn tiêu đề chưa xác minh: public không liệt kê nguồn đó', async () => {
    const bad = await create('sources', { sourceId: 's-bad2', title: '[cần xác minh]' })
    await create('stories', pub({ slug: 'ns', title: 'T', workflow: 'published', sources: [bad.id] }))
    expect((await content.getStory('ns', 'public'))?.sources).toEqual([])
  })

  it('site settings trống thì ẩn', async () => {
    await setGlobal('site-settings', { tagline: 'Chiếu Hới', email: '', _status: 'published' }, false)
    const p = await content.getSiteSettings('public')
    expect(p.email).toBeNull()
    expect(p.tagline).toBe('Chiếu Hới')
    expect((await content.getSiteSettings('preview')).email).toBe('[cần xác minh]')
  })

  it('global chưa từng đăng thì public trống, không lỗi', async () => {
    expect((await content.getSiteSettings('public')).tagline).toBeNull()
  })

  it('không có trang thì public và preview trống, không lỗi', async () => {
    expect((await content.getPageIntro('home', 'public')).title).toBeNull()
    expect((await content.getPageIntro('home', 'preview')).title).toBe('[cần xác minh]')
  })

  it('trang chưa từng đăng thì public trống, preview đọc nháp', async () => {
    await upsertPage(payload, 'home', { title: 'Nháp trang chủ' }, { publish: false })
    expect((await content.getPageIntro('home', 'public')).title).toBeNull()
    expect((await content.getPageIntro('home', 'preview')).title).toBe('Nháp trang chủ')
  })

  it('page intro đã đăng', async () => {
    await upsertPage(payload, 'home', { title: 'Trang chủ' })
    expect((await content.getPageIntro('home', 'public')).title).toBe('Trang chủ')
  })

  it('page intro: public không lộ nháp mới của trang đã đăng', async () => {
    await upsertPage(payload, 'home', { title: 'Trang chủ' })
    await upsertPage(payload, 'home', { title: 'Nháp mới' }, { publish: false })
    expect((await content.getPageIntro('home', 'public')).title).toBe('Trang chủ')
    expect((await content.getPageIntro('home', 'preview')).title).toBe('Nháp mới')
  })

  const txt = (text: string) => ({ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' })
  const doc = (children: unknown[]) => ({
    root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children },
  })

  // Ghi thẳng DB, bỏ qua cấu hình editor: mô phỏng dữ liệu cũ/độc hại.
  const rawSet = (collection: string, id: number, field: string, value: unknown) =>
    payload.db.updateOne({ collection, id, data: { [field]: { vi: value } }, req: { payload, locale: 'vi' } } as never)

  async function leakyBody() {
    const bad = await asset({ rights: 'unknown', owner: 'CHU-ANH-BI-MAT' })
    const person = await create('people', { slug: 'draft-p', name: 'TEN-NGUOI-BI-MAT', workflow: 'draft', _status: 'draft' }, true)
    const maker = await create('makers', { name: 'Thợ', contact: 'LIEN-HE-BI-MAT', workflow: 'draft', _status: 'draft' }, true)
    const src = await create('sources', { sourceId: 'leak-src', title: 'Nguồn' })
    return doc([
      { type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, children: [
        txt('Chữ giữ lại'),
        { type: 'inlineBlock', version: 1, fields: { blockType: 'cite', source: src.id } },
        { type: 'link', version: 1, fields: { linkType: 'internal', doc: { relationTo: 'makers', value: maker.id } }, children: [txt('liên kết nội bộ')] },
      ] },
      { type: 'upload', version: 1, relationTo: 'archive-assets', value: bad.id, fields: null },
      { type: 'relationship', version: 1, relationTo: 'people', value: person.id },
    ])
  }
  const leaks = ['CHU-ANH-BI-MAT', 'TEN-NGUOI-BI-MAT', 'LIEN-HE-BI-MAT', 'tiny', 'archive-assets/file']

  it('story body không nhúng upload/relationship/link nội bộ', async () => {
    const st = await create('stories', pub({ slug: 'leak', title: 'L', workflow: 'published' }))
    await rawSet('stories', st.id, 'body', await leakyBody())
    const json = JSON.stringify((await content.getStory('leak', 'public'))?.body)
    for (const l of leaks) expect(json).not.toContain(l)
    expect(json).toContain('{"type":"cite","n":1}')
    expect(json).toContain('Chữ giữ lại')
    expect(json).toContain('liên kết nội bộ')
  })

  it('person story không nhúng document nội bộ', async () => {
    const pp = await create('people', pub({
      slug: 'pl', name: 'Bà A', workflow: 'published', consent: { name: true },
    }))
    await rawSet('people', pp.id, 'story', await leakyBody())
    const json = JSON.stringify((await content.getPerson('pl', 'public'))?.storyParts)
    for (const l of leaks) expect(json).not.toContain(l)
    expect(json).toContain('Chữ giữ lại')
  })

  it('người chưa đồng ý tên: ẩn tên và phần mô tả', async () => {
    await create('people', pub({
      slug: 'nc', name: 'Ông B', workflow: 'published', note: 'Ghi chú', yearsInCraft: '40 năm',
      consent: { name: false }, story: doc([{ type: 'paragraph', version: 1, children: [txt('x')] }]),
    }))
    const p = await content.getPerson('nc', 'public')
    expect(p?.name).toBeNull()
    expect(p?.note).toBeNull()
    expect(p?.yearsInCraft).toBeNull()
    expect(p?.storyParts).toEqual([null, null, null])
  })

  it('craft step: shotNeeded hiện công khai', async () => {
    await create('craft-steps', pub({ n: 1, title: 'Bước', workflow: 'published', shotNeeded: 'Cận cảnh khung dệt' }))
    expect((await content.getCraftSteps('public'))[0].shotNeeded).toBe('Cận cảnh khung dệt')
  })

  it('nguồn: trường chưa xác minh bị ẩn ở public', async () => {
    await create('sources', { sourceId: 's-x', title: 'Báo', publisher: '[cần xác minh]', url: '' })
    const [s] = await content.getSources('public')
    expect(s.publisher).toBeNull()
    expect(s.url).toBeNull()
    expect(s.title).toBe('Báo')
  })
})

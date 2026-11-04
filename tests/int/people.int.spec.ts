// @vitest-environment node
import path from 'path'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { peopleCopy } from '@/lib/content/copy/people'
import { createPeople } from '@/lib/content/people'
import { createContent } from '@/lib/content/queries'
import type { ArchiveAsset, Person } from '@/payload-types'
import { seed } from '@/seed'
import { peopleSamples } from '@/seed/data/extras'

import { getTestPayload, resetDb, syncPagesFromGlobal } from './helpers'

const fixture = path.resolve(__dirname, '../fixtures/tiny.webp')
const SLUG = 'mau-nghe-nhan'

let payload: Payload
let content: ReturnType<typeof createContent>
let people: ReturnType<typeof createPeople>
const savedAppEnv = process.env.APP_ENV
const savedForce = process.env.SEED_FORCE_GLOBALS

const reviewer = async () => {
  const [u] = (await payload.find({ collection: 'users', overrideAccess: true })).docs
  return { ...u, collection: 'users' }
}
const createPerson = async (data: Record<string, unknown>, status: 'published' | 'draft' = 'published') =>
  (await payload.create({
    collection: 'people',
    data: { workflow: status, ...data, ...(status === 'published' ? { _status: 'published' } : {}) },
    draft: status === 'draft',
    user: await reviewer(), overrideAccess: true,
  } as never)) as { id: number }
const permittedAsset = async (alt: string) =>
  (await payload.create({
    collection: 'archive-assets',
    data: { alt, rights: 'permitted', subjectConsent: 'not_applicable' },
    filePath: fixture, overrideAccess: true,
  } as never)) as { id: number }

describe('view model Con người', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    await resetDb(payload)
    process.env.APP_ENV = 'development'
    process.env.SEED_FORCE_GLOBALS = 'true'
    await seed(payload)
    await syncPagesFromGlobal(payload)
    delete process.env.SEED_FORCE_GLOBALS
    content = createContent(payload)
    people = createPeople(payload, content)
  }, 240_000)
  afterAll(() => {
    if (savedAppEnv === undefined) delete process.env.APP_ENV
    else process.env.APP_ENV = savedAppEnv
    if (savedForce === undefined) delete process.env.SEED_FORCE_GLOBALS
    else process.env.SEED_FORCE_GLOBALS = savedForce
  })

  describe('getPersonPage mẫu chưa đồng ý (public)', () => {
    it('không có tên, ảnh, mô tả, câu chuyện, lời trích, phóng sự ảnh; khung đồng ý "Chưa có"', async () => {
      const v = await people.getPersonPage(SLUG, 'public')
      expect(v).not.toBeNull()
      const p = v!.person
      expect(p.name).toBeNull()
      expect(p.portrait).toBeNull()
      expect(p.portraitCaption).toBeNull()
      expect(p.intro).toBeNull()
      expect(p.hamlet).toBeNull()
      expect(p.recorded).toBeNull()
      expect(p.note).toBeNull()
      expect(p.yearsInCraft).toBeNull()
      expect(p.quote).toBeNull()
      expect(p.storyParts).toEqual([null, null, null])
      expect(p.gallery).toEqual([])
      expect(p.heading).toBe('Chờ đồng ý')
      expect(p.storyTitle).toBe('Câu chuyện')
      expect(p.consent).toEqual({ state: 'none', missing: ['tên', 'ảnh', 'lời trích'], reviewedBySubject: false })
      expect(v!.copy.detail.preview).toBeNull()
    })
    it('related: công đoạn 05 là bản nháp nên chỉ còn thẻ "Những chân dung khác" (P2)', async () => {
      const v = await people.getPersonPage(SLUG, 'public')
      expect(v!.related.map((r) => r.title)).toEqual(['Những chân dung khác'])
      expect(v!.related[0]).toMatchObject({ href: '/con-nguoi', eyebrow: 'CON NGƯỜI', cta: 'Xem tất cả →', mobile: false })
    })
    it('không chuỗi nào lộ alt chân dung, alt/chú thích phóng sự ảnh hay ghi chú của seed', async () => {
      const json = JSON.stringify(await people.getPersonPage(SLUG, 'public'))
      const doc = (await payload.find({
        collection: 'people', where: { slug: { equals: SLUG } }, depth: 1, overrideAccess: true, draft: true,
      })).docs[0] as Person
      const portrait = doc.portrait as ArchiveAsset
      expect(portrait.alt).toBeTruthy()
      expect(json).not.toContain(portrait.alt)
      for (const row of doc.gallery ?? []) {
        expect(json).not.toContain((row.image as ArchiveAsset).alt)
        if (row.caption) expect(json).not.toContain(row.caption)
      }
      expect(json).not.toContain('Dệt chiếu tay')
      expect(json).not.toContain('Đồng ý của người trong ảnh')
    })
  })

  describe('đồng ý từng phần (public)', () => {
    it('đồng ý tên: có tên và intro; phóng sự ảnh cần đồng ý ảnh; thêm đồng ý ảnh thì có ảnh', async () => {
      const asset = await permittedAsset('Ảnh phóng sự thử')
      const p = await createPerson({
        slug: 'thu-dong-y', name: 'Bà Thử', intro: 'Một câu giới thiệu.', hamlet: 'Xóm Đông',
        recordedBy: 'Người phỏng vấn', recordedAt: '2026-05-04',
        consent: { name: true, photo: false, quote: false },
        gallery: [{ image: asset.id, caption: 'Chú thích thử' }],
      })
      try {
        const v = (await people.getPersonPage('thu-dong-y', 'public'))!.person
        expect(v.name).toBe('Bà Thử')
        expect(v.intro).toBe('Một câu giới thiệu.')
        expect(v.hamlet).toBe('Xóm Đông')
        expect(v.recorded).toBe('Người phỏng vấn · 04/05/2026')
        expect(v.gallery).toEqual([])
        expect(v.consent.state).toBe('partial')
        expect(v.consent.missing).toEqual(['ảnh', 'lời trích'])

        await payload.update({
          collection: 'people', id: p.id, data: { consent: { name: true, photo: true, quote: false } },
          overrideAccess: true, user: await reviewer(),
        } as never)
        const w = (await people.getPersonPage('thu-dong-y', 'public'))!.person
        expect(w.gallery).toHaveLength(1)
        expect(w.gallery[0].caption).toBe('Chú thích thử')
        expect(w.gallery[0].image.alt).toBe('Ảnh phóng sự thử')
        expect(w.consent.missing).toEqual(['lời trích'])
      } finally {
        await payload.delete({ collection: 'people', id: p.id, overrideAccess: true })
        await payload.delete({ collection: 'archive-assets', id: asset.id, overrideAccess: true })
      }
    })

    it('đồng ý ảnh nhưng chưa đồng ý tên: phóng sự ảnh không có alt và chú thích', async () => {
      const asset = await permittedAsset('Bà Thử bên khung dệt')
      const p = await createPerson({
        slug: 'thu-anh-khong-ten', name: 'Bà Thử', intro: 'Giới thiệu bí mật.',
        consent: { name: false, photo: true, quote: false },
        gallery: [{ image: asset.id, caption: 'Bà Thử dệt chiếu' }],
      })
      try {
        const v = (await people.getPersonPage('thu-anh-khong-ten', 'public'))!.person
        expect(v.gallery).toHaveLength(1)
        const json = JSON.stringify(v)
        expect(json).not.toContain('Bà Thử')
        expect(json).not.toContain('Giới thiệu bí mật.')
        expect(v.consent).toEqual({ state: 'partial', missing: ['tên', 'lời trích'], reviewedBySubject: false })
      } finally {
        await payload.delete({ collection: 'people', id: p.id, overrideAccess: true })
        await payload.delete({ collection: 'archive-assets', id: asset.id, overrideAccess: true })
      }
    })

    it('lời trích đủ đồng ý và nguồn: dòng nguồn "Nhà xuất bản (dd/mm/yyyy)"; đủ ba đồng ý là "full"', async () => {
      const [src] = (await payload.find({
        collection: 'sources', where: { sourceId: { equals: 'vietnamplus-2026' } }, overrideAccess: true,
      })).docs
      const p = await createPerson({
        slug: 'thu-trich', name: 'Ông Thử', quote: 'Nghề là hồn làng.', quoteSource: src.id,
        consent: { name: true, photo: true, quote: true }, reviewedBySubject: true,
      })
      try {
        const v = (await people.getPersonPage('thu-trich', 'public'))!.person
        expect(v.quote).toEqual({ text: 'Nghề là hồn làng.', sourceLine: 'Vietnam+ (14/08/2026)', note: 'Nguồn: Vietnam+ (14/08/2026)' })
        expect(v.consent).toEqual({ state: 'full', missing: [], reviewedBySubject: true })
        expect(v.heading).toBe('Ông Thử')
        expect(v.storyTitle).toBe('Câu chuyện của Ông Thử')
        expect(v.recorded).toBeNull()
        const w = (await people.getPersonPage('thu-trich', 'preview'))!.person
        expect(w.quote?.note).toBe('Chỉ hiển thị khi có ghi âm hoặc ghi chép gốc · Nguồn: Vietnam+ (14/08/2026)')
      } finally {
        await payload.delete({ collection: 'people', id: p.id, overrideAccess: true })
      }
    })
  })

  describe('vai trò, nguồn của câu chuyện, câu chuyện rỗng', () => {
    const txt = (text: string) => ({ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' })
    const para = (...children: unknown[]) => ({ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, children })
    const h3 = (text: string) => ({ type: 'heading', tag: 'h3', version: 1, direction: 'ltr', format: '', indent: 0, children: [txt(text)] })
    const doc = (...children: unknown[]) => ({ root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children } })
    const cite = (source: number) => ({ type: 'inlineBlock', version: 1, fields: { blockType: 'cite', source } })
    type N = { type: string; children?: N[]; [k: string]: unknown }
    const nodes = (n: N | undefined): N[] => (n ? [n, ...(n.children ?? []).flatMap(nodes)] : [])
    const sourceDoc = async (sourceId: string) =>
      (await payload.find({ collection: 'sources', where: { sourceId: { equals: sourceId } }, overrideAccess: true })).docs[0]

    it('public chưa đồng ý tên: vai trò không lộ ở thẻ lẫn trang chân dung (T2a)', async () => {
      const p = await createPerson({ slug: 'thu-vai-tro', role: 'Thợ dệt VAI-TRO-BI-MAT', consent: { name: false, photo: false, quote: false } })
      try {
        expect(JSON.stringify(await people.getPeoplePage('public'))).not.toContain('VAI-TRO-BI-MAT')
        expect(JSON.stringify(await people.getPersonPage('thu-vai-tro', 'public'))).not.toContain('VAI-TRO-BI-MAT')
        expect((await people.getPersonPage('thu-vai-tro', 'preview'))!.person.role).toBe('Thợ dệt VAI-TRO-BI-MAT')
      } finally {
        await payload.delete({ collection: 'people', id: p.id, overrideAccess: true })
      }
    })

    it('câu chuyện trích một nguồn ở cả ba phần: sources có 1 nguồn, mọi cite là n=1 (T2c)', async () => {
      const src = await sourceDoc('vietnamplus-2026')
      const story = doc(
        h3('Phần một'), para(txt('Đoạn một'), cite(src.id)), h3('Phần hai'), para(txt('Đoạn hai'), cite(src.id)),
        h3('Phần ba'), para(txt('Đoạn ba'), cite(src.id)),
      )
      const ok = await createPerson({ slug: 'thu-nguon', name: 'Bà Nguồn', consent: { name: true }, story })
      const no = await createPerson({ slug: 'thu-nguon-an', consent: { name: false }, story })
      try {
        const v = (await people.getPersonPage('thu-nguon', 'public'))!.person
        expect(v.sources.map((s) => s.id)).toEqual(['vietnamplus-2026'])
        expect(v.sources[0].date).toBe('14/08/2026')
        expect(v.storyParts.every((r) => r !== null)).toBe(true)
        const cites = v.storyParts.flatMap((r) => nodes(r?.root as N)).filter((n) => n.type === 'cite')
        expect(cites).toEqual([{ type: 'cite', n: 1 }, { type: 'cite', n: 1 }, { type: 'cite', n: 1 }])

        const w = (await people.getPersonPage('thu-nguon-an', 'public'))!.person
        expect(w.sources).toEqual([])
        expect(w.storyParts).toEqual([null, null, null])
      } finally {
        await payload.delete({ collection: 'people', id: ok.id, overrideAccess: true })
        await payload.delete({ collection: 'people', id: no.id, overrideAccess: true })
      }
    })

    it('ba phần tách tại heading 2 và 3; số cite liên tục 1..n qua các phần, nguồn ẩn không chiếm số (F1, R4)', async () => {
      const a = await sourceDoc('vietnamplus-2026')
      const other = await sourceDoc('danviet-2024')
      const story = doc(
        h3('Một'), para(txt('Đoạn một'), cite(other.id)), h3('Hai'), para(txt('Đoạn hai'), cite(a.id), cite(other.id)),
        h3('Ba'), para(txt('Đoạn ba'), cite(a.id)), h3('Bốn'), para(txt('Đoạn bốn')),
      )
      const p = await createPerson({ slug: 'thu-ba-phan', name: 'Bà Ba', consent: { name: true }, story })
      try {
        const v = (await people.getPersonPage('thu-ba-phan', 'public'))!.person
        const texts = v.storyParts.map((r) => nodes(r?.root as N).filter((n) => n.type === 'text').map((n) => n.text))
        expect(texts).toEqual([['Một', 'Đoạn một'], ['Hai', 'Đoạn hai'], ['Ba', 'Đoạn ba', 'Bốn', 'Đoạn bốn']])
        const ns = v.storyParts.map((r) => nodes(r?.root as N).filter((n) => n.type === 'cite').map((n) => n.n))
        expect(ns).toEqual([[1], [2, 1], [2]])
        expect(v.sources.map((s) => s.id)).toEqual(['danviet-2024', 'vietnamplus-2026'])
      } finally {
        await payload.delete({ collection: 'people', id: p.id, overrideAccess: true })
      }
    })

    it('câu chuyện chỉ có đoạn rỗng: storyParts [null, null, null] ở cả hai mode', async () => {
      const p = await createPerson({ slug: 'thu-rong', name: 'Ông Rỗng', consent: { name: true }, story: doc(para(), para(txt('   '))) })
      try {
        for (const mode of ['public', 'preview'] as const) {
          const v = (await people.getPersonPage('thu-rong', mode))!.person
          expect(v.storyParts).toEqual([null, null, null])
          expect(v.sources).toEqual([])
        }
      } finally {
        await payload.delete({ collection: 'people', id: p.id, overrideAccess: true })
      }
    })
  })

  describe('trình soạn câu chuyện (People.story)', () => {
    it('có inline block cite (quan hệ bắt buộc tới sources) như Stories.body; không có khối figure (I3)', () => {
      type BlocksProps = { blocks?: { slug: string }[]; inlineBlocks?: { slug: string; fields: Record<string, unknown>[] }[] }
      const blocksOf = (slug: 'people' | 'stories', field: string) => {
        const f = payload.collections[slug].config.fields.find((x) => 'name' in x && x.name === field) as unknown as {
          editor: { editorConfig: { resolvedFeatureMap: Map<string, { sanitizedServerFeatureProps?: BlocksProps }> } }
        }
        return f.editor.editorConfig.resolvedFeatureMap.get('blocks')?.sanitizedServerFeatureProps
      }
      const people = blocksOf('people', 'story')
      const stories = blocksOf('stories', 'body')
      const cite = people?.inlineBlocks?.find((b) => b.slug === 'cite')
      expect(people?.inlineBlocks?.map((b) => b.slug)).toEqual(['cite'])
      expect(cite?.fields.find((f) => f.name === 'source')).toMatchObject({ type: 'relationship', relationTo: 'sources', required: true })
      // Cùng định nghĩa với cite của bài viết (so phần dữ liệu, bỏ qua hàm validate).
      expect(JSON.stringify(cite)).toBe(JSON.stringify(stories?.inlineBlocks?.find((b) => b.slug === 'cite')))
      expect(people?.blocks ?? []).toEqual([])
    })
  })

  describe('getPersonPage mẫu (preview)', () => {
    it('có phóng sự ảnh 2 ảnh, dòng đồng ý chân dung, thẻ công đoạn 05', async () => {
      const v = await people.getPersonPage(SLUG, 'preview')
      const p = v!.person
      expect(p.gallery).toHaveLength(2)
      expect(p.gallery[0].caption).toBe('Hai người cùng làm trên một khung. [Chú thích cần người trong ảnh duyệt]')
      expect(p.gallery[1].caption).toBe('Đôi tay trên khung dệt.')
      expect(p.portraitCaption?.line.mobile).toBe(peopleCopy.detail.preview.consentLine)
      expect(p.portraitCaption?.line.desktop).toContain(peopleCopy.detail.preview.consentLine)
      expect(p.portraitCaption?.label).toBe('CHÂN DUNG')
      // Preview: tên trống là [cần xác minh]; dòng "Ghi lại bởi" trống giữ dấu như các dòng dữ kiện khác.
      expect(p.heading).toBe('[cần xác minh]')
      expect(p.storyTitle).toBe('Câu chuyện của [cần xác minh]')
      expect(p.recorded).toBe('[cần xác minh]')
      // Trường trống là null để component dùng gợi ý phỏng vấn trong copy (R14).
      expect(p.intro).toBeNull()
      expect(p.storyParts).toEqual([null, null, null])
      expect(p.consent.state).toBe('none')
      expect(v!.copy.detail.preview?.consentLine).toBe(peopleCopy.detail.preview.consentLine)

      const step5 = (await content.getCraftSteps('preview')).find((s) => s.n === 5)
      expect(v!.related.map((r) => r.title)).toEqual([`05 · ${step5?.title}`, 'Những chân dung khác'])
      expect(v!.related[0]).toMatchObject({ href: '/nghe-det-chieu', eyebrow: 'CÔNG ĐOẠN', cta: 'Xem công đoạn →' })
      expect(v!.related[0].mobile).not.toBe(false)
      expect(v!.related[0].image).not.toBeNull()
      expect(v!.related[1].image).not.toBeNull()
    })
    it('không seed hiện vật liên quan (R17)', async () => {
      const v = await people.getPersonPage(SLUG, 'preview')
      expect(v!.related.some((r) => r.eyebrow === 'HIỆN VẬT')).toBe(false)
    })
    it('thẻ hiện vật: tên sản phẩm, link trang hiện vật', async () => {
      const [prod] = (await payload.find({ collection: 'products', overrideAccess: true, limit: 1, sort: 'createdAt' })).docs
      const p = await createPerson({ slug: 'thu-hien-vat', relatedProduct: prod.id })
      try {
        const v = await people.getPersonPage('thu-hien-vat', 'preview')
        const card = v!.related.find((r) => r.eyebrow === 'HIỆN VẬT')
        expect(card).toMatchObject({ href: `/san-pham/${prod.slug}`, title: prod.name, cta: 'Xem hiện vật →' })
      } finally {
        await payload.delete({ collection: 'people', id: p.id, overrideAccess: true })
      }
    })
    it('slug lạ: null', async () => {
      expect(await people.getPersonPage('khong-co', 'preview')).toBeNull()
    })
  })

  describe('getPeoplePage', () => {
    it('public: 8 người, 6 chip đúng thứ tự artboard, tiêu đề có ngắt dòng', async () => {
      const v = await people.getPeoplePage('public')
      expect(v.people).toHaveLength(8)
      expect(v.people.every((p) => p.name === null && p.portrait === null && p.note === null)).toBe(true)
      expect(v.filters).toEqual([
        { key: 'all', label: 'Tất cả' },
        { key: 'artisan', label: 'Nghệ nhân' },
        { key: 'craft-family', label: 'Gia đình làm nghề' },
        { key: 'craft-keeper', label: 'Người giữ nghề' },
        { key: 'young-generation', label: 'Thế hệ trẻ' },
        { key: 'village-bound', label: 'Những người gắn bó với làng' },
      ])
      expect(v.intro.title).toBe('Những bàn tay\ngiữ hồn làng.')
      expect(v.copy.principles.preview).toBeNull()
    })
    it('preview: copy có nhánh preview', async () => {
      const v = await people.getPeoplePage('preview')
      expect(v.copy.principles.preview?.note).toEqual(peopleCopy.principles.preview.note)
    })
  })

  it('getPersonSlugs chỉ gồm người đã đăng', async () => {
    const p = await createPerson({ slug: 'nguoi-nhap' }, 'draft')
    try {
      expect((await people.getPersonSlugs()).sort()).toEqual(peopleSamples.map((s) => s.slug).sort())
    } finally {
      await payload.delete({ collection: 'people', id: p.id, overrideAccess: true })
    }
  })
})

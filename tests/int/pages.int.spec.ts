// @vitest-environment node
import path from 'path'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createPages } from '@/lib/content/pages'
import { createContent } from '@/lib/content/queries'
import { seed } from '@/seed'

import { getTestPayload, readPage, resetDb, syncPagesFromGlobal, upsertPage } from './helpers'

const fixture = path.resolve(__dirname, '../fixtures/tiny.webp')

let payload: Payload
let pages: ReturnType<typeof createPages>
const savedAppEnv = process.env.APP_ENV
const savedForce = process.env.SEED_FORCE_GLOBALS

const reviewer = async () => {
  const [u] = (await payload.find({ collection: 'users', overrideAccess: true })).docs
  return { ...u, collection: 'users' }
}
/** Ghi lại global bằng seed rồi chép sang `pages`: đưa dữ liệu trang về trạng thái seed. */
const reseed = async () => {
  process.env.SEED_FORCE_GLOBALS = 'true'
  await seed(payload)
  delete process.env.SEED_FORCE_GLOBALS
  await syncPagesFromGlobal(payload)
}
const sourceDoc = async (sourceId: string) =>
  (await payload.find({ collection: 'sources', where: { sourceId: { equals: sourceId } }, overrideAccess: true })).docs[0]

describe('view model trang Nghề dệt chiếu và Làng Hới', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    await resetDb(payload)
    process.env.APP_ENV = 'development'
    // resetDb không xoá global: ép seed ghi lại để không phụ thuộc test khác.
    process.env.SEED_FORCE_GLOBALS = 'true'
    await seed(payload)
    delete process.env.SEED_FORCE_GLOBALS
    await syncPagesFromGlobal(payload)
    pages = createPages(payload, createContent(payload))
  }, 240_000)
  afterAll(() => {
    if (savedAppEnv === undefined) delete process.env.APP_ENV
    else process.env.APP_ENV = savedAppEnv
    if (savedForce === undefined) delete process.env.SEED_FORCE_GLOBALS
    else process.env.SEED_FORCE_GLOBALS = savedForce
  })

  describe('getCraftPage', () => {
    it('public: ảnh chưa được phép bị ẩn, công đoạn chưa đăng bị lọc, bảng so sánh chỉ còn hàng có dữ liệu', async () => {
      const v = await pages.getCraftPage('public')
      expect(v.hero).toBeNull()
      expect(v.tools).toHaveLength(3)
      expect(v.tools.every((t) => t.image === null)).toBe(true)
      // Seed để cả 7 công đoạn ở trạng thái chờ duyệt (draft) nên bản công khai chưa có công đoạn nào.
      expect(v.steps).toHaveLength(0)
      expect(v.compare.rows.map((r) => r.aspect)).toEqual(['Việc của đôi tay'])
      expect(v.intro.title).toBe('Một tấm chiếu,\nmuôn công đoạn.')
      expect(v.compare.hand.note.desktop).toBeNull()
      expect(v.compare.rows[0].mobile).toEqual(['Thủ công: đưa sợi và dệt trên khung', 'Bằng máy: nạp cói vào máy'])
      expect(v.compare.rows[0].muted).toEqual({ hand: false, machine: false, mobile: [false, false] })
      expect(JSON.stringify(v.copy)).not.toContain('CẦN GHI LẠI')
      expect(v.tools.map((t) => t.name)).toEqual(['Khung dệt', 'Khuôn in hoa văn', 'Bàn chải quét màu'])
      expect(v.tools.every((t) => t.cite.length === 0)).toBe(true)
      expect(v.compare.hand.title).toBe('Dệt thủ công')
      expect(v.compare.rows.every((r) => r.cite.length === 0)).toBe(true)
      expect(v.sources).toEqual([])
    })
    it('gắn nguồn cho hàng so sánh: public có sources và cite; nguồn bị ẩn thì cite bị bỏ', async () => {
      const original = (await readPage(payload, 'nghe-det-chieu')).compareRows as Record<string, unknown>[]
      const save = (compareRows: unknown) => upsertPage(payload, 'nghe-det-chieu', { compareRows })
      const src = await sourceDoc('vietnamplus-2026')
      try {
        await save(original.map((r, i) => (i === 1 ? { ...r, hand: '2 lá/ngày', sources: [src.id] } : r)))
        const v = await pages.getCraftPage('public')
        expect(v.sources[0].id).toBe('vietnamplus-2026')
        expect(v.compare.rows.map((r) => r.aspect)).toEqual(['Việc của đôi tay', 'Thời gian một tấm'])
        expect(v.compare.rows[1].cite).toEqual(['vietnamplus-2026'])
        await payload.update({ collection: 'sources', id: src.id, data: { title: '[cần xác minh]' }, overrideAccess: true })
        const hidden = await pages.getCraftPage('public')
        expect(hidden.sources).toEqual([])
        expect(hidden.compare.rows.map((r) => r.aspect)).toEqual(['Việc của đôi tay'])
      } finally {
        await payload.update({ collection: 'sources', id: src.id, data: { title: src.title }, overrideAccess: true })
        await reseed()
      }
    })
    it('ví dụ Vietnam+: ghi chú thẻ thủ công và hàng "Thời gian một tấm" có nguồn, ô máy còn chờ xác minh', async () => {
      const { hand, compareRows } = (await readPage(payload, 'nghe-det-chieu')) as {
        hand: Record<string, Record<string, unknown>>; compareRows: Record<string, unknown>[]
      }
      const src = await sourceDoc('vietnamplus-2026')
      try {
        await upsertPage(payload, 'nghe-det-chieu', {
          hand: { ...hand, note: { ...hand.note, text: 'Dệt tay khoảng 2 lá/ngày.', mobileText: null, sources: [src.id] } },
          compareRows: compareRows.map((r) => (r.aspect === 'Thời gian một tấm' ? { ...r, hand: '2 lá/ngày', machine: '[cần xác minh]', sources: [src.id] } : r)),
        })
        const v = await pages.getCraftPage('public')
        expect(v.compare.hand.note).toEqual({ desktop: 'Dệt tay khoảng 2 lá/ngày.', mobile: 'Dệt tay khoảng 2 lá/ngày.' })
        expect(v.compare.hand.noteCite).toEqual(['vietnamplus-2026'])
        expect(v.compare.hand.textCite).toEqual([])
        expect(v.compare.hand.text.desktop).toBeTruthy()
        const row = v.compare.rows.find((r) => r.aspect === 'Thời gian một tấm')
        expect(row).toMatchObject({ hand: '2 lá/ngày', machine: null, mobile: ['Thủ công: 2 lá/ngày'], cite: ['vietnamplus-2026'] })
        expect(v.sources.map((s) => s.id)).toEqual(['vietnamplus-2026'])
      } finally {
        await reseed()
      }
    })
    it('preview: đủ 7 công đoạn, công đoạn thiếu ảnh có shotNeeded, toRecord hiện', async () => {
      const v = await pages.getCraftPage('preview')
      expect(v.steps).toHaveLength(7)
      expect(v.steps[2].image).toBeNull()
      expect(v.steps[2].shotNeeded).toBeTruthy()
      expect(v.steps[0].toRecord).toBe('Giống cói, nơi trồng, mùa thu hoạch.')
      expect(v.steps[1].shortTitle).toBe('Xử lý')
      expect(v.compare.rows).toHaveLength(4)
      expect(v.compare.rows[1].mobile).toEqual(['Thủ công: [cần xác minh] · Máy: [cần xác minh]'])
      expect(v.compare.rows[1].muted).toEqual({ hand: true, machine: true, mobile: [true] })
      expect(v.hero?.image.url).toBeTruthy()
      expect(v.copy.journey.preview?.toRecordLabel).toBe('CẦN GHI LẠI')
    })
    it('public: toRecord luôn null', async () => {
      const steps = await createContent(payload).getCraftSteps('public')
      expect(steps.every((s) => s.toRecord === null)).toBe(true)
    })
    it('công đoạn đã đăng gắn ảnh chưa được phép: public có image null và shotNeeded', async () => {
      const step = (await payload.find({ collection: 'craft-steps', where: { n: { equals: 1 } }, overrideAccess: true, draft: true })).docs[0]
      // Ảnh seed là ảnh tham khảo, chưa được phép dùng công khai.
      const preview = await pages.getCraftPage('preview')
      expect(preview.steps[0].image).not.toBeNull()
      const user = await reviewer()
      const update = (data: Record<string, unknown>) =>
        payload.update({ collection: 'craft-steps', id: step.id, data, user, overrideAccess: true, draft: false } as never)
      try {
        await update({ _status: 'published', shotNeeded: 'Túm cói trên mặt chiếu' })
        const v = await pages.getCraftPage('public')
        expect(v.steps).toHaveLength(1)
        expect(v.steps[0].n).toBe(1)
        expect(v.steps[0].image).toBeNull()
        expect(v.steps[0].shotNeeded).toBe('Túm cói trên mặt chiếu')
      } finally {
        await update({ _status: 'draft', workflow: step.workflow, shotNeeded: step.shotNeeded ?? null })
      }
      expect((await pages.getCraftPage('public')).steps).toHaveLength(0)
    })
    it('asset permitted gắn vào hero: public có ảnh, chú thích có dấu chờ xác minh thì ẩn', async () => {
      const asset = (await payload.create({
        collection: 'archive-assets',
        data: { alt: 'Ảnh thử', title: 'Ảnh thử', code: 'TL-900', rights: 'permitted', subjectConsent: 'not_applicable' },
        filePath: fixture, overrideAccess: true,
      } as never)) as { id: number }
      const original = (await readPage(payload, 'nghe-det-chieu')).media as
        { slot: string; image: number | null; caption: string | null }[]
      const save = (media: unknown) => upsertPage(payload, 'nghe-det-chieu', { media })
      try {
        await save(original.map((m) => (m.slot === 'hero' ? { ...m, image: asset.id } : m)))
        const v = await pages.getCraftPage('public')
        expect(v.hero?.image.url).toBeTruthy()
        expect(v.hero?.image.docNumber).toBe('900')
        expect(v.hero?.caption).toBeNull()
        const media = await pages.getPageMedia('nghe-det-chieu', 'public')
        expect(Object.keys(media)).toEqual(['hero'])
      } finally {
        await save(original)
        await payload.delete({ collection: 'archive-assets', id: asset.id, overrideAccess: true })
      }
    })
    it('đảo thứ tự dụng cụ rồi đăng lại: ảnh vẫn đi theo dụng cụ của nó', async () => {
      const permitted = (code: string) =>
        payload.create({
          collection: 'archive-assets',
          data: { alt: `Ảnh ${code}`, title: `Ảnh ${code}`, code, rights: 'permitted', subjectConsent: 'not_applicable' },
          filePath: fixture, overrideAccess: true,
        } as never) as unknown as Promise<{ id: number; url: string }>
      const a = await permitted('TL-901')
      const b = await permitted('TL-902')
      try {
        await upsertPage(payload, 'nghe-det-chieu', { tools: [{ name: 'Khung dệt', image: a.id }, { name: 'Go', image: b.id }] })
        const before = await pages.getCraftPage('public')
        expect(before.tools.map((t) => [t.name, t.image?.docNumber])).toEqual([['Khung dệt', '901'], ['Go', '902']])
        await upsertPage(payload, 'nghe-det-chieu', { tools: [{ name: 'Go', image: b.id }, { name: 'Khung dệt', image: a.id }] })
        const v = await pages.getCraftPage('public')
        expect(v.tools.map((t) => t.name)).toEqual(['Go', 'Khung dệt'])
        const khung = v.tools.find((t) => t.name === 'Khung dệt')
        expect(khung?.image?.url).toBe(a.url)
        expect(khung?.image?.docNumber).toBe('901')
        expect(v.tools.find((t) => t.name === 'Go')?.image?.url).toBe(b.url)
      } finally {
        await reseed()
        for (const id of [a.id, b.id]) await payload.delete({ collection: 'archive-assets', id, overrideAccess: true })
      }
    })
  })

  describe('getVillagePage', () => {
    it('preview: 8 mốc, mốc cuối tĩnh, dòng nguồn ghép publisher (ngày), nguồn theo thứ tự trang', async () => {
      const v = await pages.getVillagePage('preview')
      expect(v.timeline).toHaveLength(8)
      const last = v.timeline[7]
      expect(last.title).toBe('Mốc của bạn')
      expect(last.confidence).toBe('pending')
      expect(last.sourceHref).toBe('/ket-noi')
      expect(v.timeline[0].sourceLine).toBe('Dân Việt, dẫn Báo Hải Dương (13/06/2024); Đại Đoàn Kết (07/08/2021)')
      expect(v.sources.map((s) => s.id)).toEqual([
        'vietnamplus-2026', 'danviet-2024', 'daidoanket-2021', 'nq-1666-2025', 'nq-202-2025',
      ])
      expect(v.sources[0].date).toBe('14/08/2026')
      expect(v.facts[1].note).toEqual({
        desktop: 'Trước đây: xã Tân Lễ, huyện Hưng Hà, tỉnh Thái Bình',
        mobile: 'Trước đây: xã Tân Lễ, huyện Hưng Hà, Thái Bình',
      })
      expect(v.facts[2].detail.mobile).toBe('Phạm Đôn Lễ, “Trạng Chiếu”')
      expect(v.copy.location.preview?.map?.label).toBe('BẢN ĐỒ VỊ TRÍ')
      expect(v.life).toHaveLength(3)
    })
    it('public: mốc tĩnh vẫn có, ghi chú quy trình ẩn, ảnh chưa được phép ẩn', async () => {
      const v = await pages.getVillagePage('public')
      expect(v.timeline.at(-1)?.title).toBe('Mốc của bạn')
      expect(v.facts[1].note).toEqual({
        desktop: 'Trước đây: xã Tân Lễ, huyện Hưng Hà, tỉnh Thái Bình',
        mobile: 'Trước đây: xã Tân Lễ, huyện Hưng Hà, Thái Bình',
      })
      expect(v.copy.location.preview).toBeNull()
      expect(v.hero).toBeNull()
      expect(v.life).toEqual([])
    })
    it('nguồn có tiêu đề chưa xác minh bị bỏ khỏi danh sách, cite và dòng nguồn ở public', async () => {
      const src = await sourceDoc('danviet-2024')
      const title = src.title
      await payload.update({ collection: 'sources', id: src.id, data: { title: '[cần xác minh]' }, overrideAccess: true })
      try {
        const v = await pages.getVillagePage('public')
        expect(v.sources.map((s) => s.id)).toEqual(['vietnamplus-2026', 'daidoanket-2021', 'nq-1666-2025', 'nq-202-2025'])
        expect(v.facts.flatMap((f) => f.cite)).not.toContain('danviet-2024')
        expect(JSON.stringify(v.copy)).not.toContain('danviet-2024')
        expect(v.timeline[0].sourceLine).toBe('Đại Đoàn Kết (07/08/2021)')
        expect(v.timeline[0].sourceIds).toEqual(['daidoanket-2021'])
        // Câu chỉ trích [2] không đứng một mình; câu trích [2][3] vẫn còn với [3].
        expect(v.copy.founder.conflict.parts[1]).toEqual({ text: { desktop: null, mobile: null }, cite: [] })
        expect(v.copy.founder.conflict.parts[0].text.desktop).toBeTruthy()
        expect(v.copy.founder.paragraphs[0].parts[0].cite).toEqual(['daidoanket-2021'])
        expect(v.copy.founder.paragraphs[0].parts[0].text.desktop).toBeTruthy()
        expect(v.facts.map((f) => f.term)).toContain('TỔ NGHỀ')
        expect(v.facts[2].cite).toEqual(['vietnamplus-2026'])
        const w0 = await pages.getVillagePage('preview')
        expect(w0.copy.founder.conflict.parts[1].cite).toEqual(['danviet-2024'])
        // Mốc chỉ có nguồn bị ẩn thì không có dòng nguồn: dùng nhánh đơn nguồn khác để kiểm chứng riêng.
        const only = await sourceDoc('vietnamplus-2026')
        await payload.update({ collection: 'sources', id: only.id, data: { title: '[cần xác minh]' }, overrideAccess: true })
        try {
          const w = await pages.getVillagePage('public')
          const machine = w.timeline.find((t) => t.title === 'Máy dệt về làng')
          expect(machine?.sourceLine).toBeNull()
          // F1: mốc báo chí mà mọi nguồn bị ẩn thì hiện là chờ xác minh ở public; preview giữ nguyên.
          expect(machine?.confidence).toBe('pending')
          const wp = await pages.getVillagePage('preview')
          expect(wp.timeline.find((t) => t.title === 'Máy dệt về làng')?.confidence).toBe('press')
        } finally {
          await payload.update({ collection: 'sources', id: only.id, data: { title: only.title }, overrideAccess: true })
        }
      } finally {
        await payload.update({ collection: 'sources', id: src.id, data: { title }, overrideAccess: true })
      }
    })
    it('edits in admin show on page', async () => {
      const { location } = (await readPage(payload, 'lang-hoi')) as { location: Record<string, unknown> }
      await upsertPage(payload, 'lang-hoi', { location: { ...location, text: 'Làng nằm ở xã Long Hưng.' } })
      try {
        const v = await pages.getVillagePage('public')
        expect(v.copy.location.body.text).toBe('Làng nằm ở xã Long Hưng.')
      } finally {
        await reseed()
      }
    })
    it('hides empty founder/location/heritage when groups are missing', async () => {
      await upsertPage(payload, 'lang-hoi', {
        eyebrow: '01 — LÀNG HỚI', title: 'Có một làng Hới...', lead: 'Lead',
        facts: [], pageSources: [],
        founder: { paragraphs: [], conflict: [], conflictEditorNote: null, noPortrait: null },
        location: { text: null, sources: [], editorNote: null },
        heritage: { sentences: [], editorNote: null },
      })
      try {
        const v = await pages.getVillagePage('public')
        expect(v.facts).toEqual([])
        expect(v.copy.founder.paragraphs).toEqual([])
        expect(v.copy.location.body.text).toBeNull()
        expect(v.sources).toEqual([])
      } finally {
        await reseed()
      }
    })
    it('lang-hoi có nháp chưa đăng, nghe-det-chieu vừa đăng: public vẫn là bản đăng cũ của lang-hoi', async () => {
      const live = await pages.getVillagePage('public')
      const published = live.copy.location.body.text
      expect(published).toBeTruthy()
      const { location } = (await readPage(payload, 'lang-hoi', true)) as { location: Record<string, unknown> }
      try {
        await upsertPage(payload, 'lang-hoi', { location: { ...location, text: 'Nháp chưa đăng.' } }, { publish: false })
        await upsertPage(payload, 'nghe-det-chieu', { eyebrow: 'Dòng nhỏ mới' })
        expect((await pages.getCraftPage('public')).intro.eyebrow).toBe('Dòng nhỏ mới')
        const v = await pages.getVillagePage('public')
        expect(v.copy.location.body.text).toBe(published)
        expect(v).toEqual(live)
        expect((await pages.getVillagePage('preview')).copy.location.body.text).toBe('Nháp chưa đăng.')
      } finally {
        await reseed()
      }
    })
    it('mốc thiếu mức tin cậy được trả là pending', async () => {
      const ev = (await payload.find({ collection: 'timeline-events', where: { order: { equals: 1 } }, overrideAccess: true })).docs[0]
      const originalConfidence = ev.confidence
      await payload.update({ collection: 'timeline-events', id: ev.id, data: { confidence: null }, user: await reviewer(), overrideAccess: true, draft: false } as never)
      try {
        const v = await pages.getVillagePage('preview')
        expect(v.timeline[0].confidence).toBe('pending')
      } finally {
        await payload.update({ collection: 'timeline-events', id: ev.id, data: { confidence: originalConfidence }, user: await reviewer(), overrideAccess: true, draft: false } as never)
      }
    })
  })
})

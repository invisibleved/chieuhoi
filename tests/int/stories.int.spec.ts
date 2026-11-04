// @vitest-environment node
import path from 'path'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createContent } from '@/lib/content/queries'
import { createStories } from '@/lib/content/stories'
import { seed } from '@/seed'

import { getTestPayload, resetDb } from './helpers'

const fixture = path.resolve(__dirname, '../fixtures/tiny.webp')
const SLUG = 'chuyen-ve-trang-chieu'

let payload: Payload
let stories: ReturnType<typeof createStories>
const savedAppEnv = process.env.APP_ENV
const savedForce = process.env.SEED_FORCE_GLOBALS

const reviewer = async () => {
  const [u] = (await payload.find({ collection: 'users', overrideAccess: true })).docs
  return { ...u, collection: 'users' }
}
const createStory = async (data: Record<string, unknown>) =>
  (await payload.create({
    collection: 'stories', data: { workflow: 'published', ...data, _status: 'published' },
    user: await reviewer(), overrideAccess: true,
  } as never)) as { id: number }

type N = { type: string; children?: N[]; [k: string]: unknown }
const nodes = (n: N | undefined): N[] => (n ? [n, ...(n.children ?? []).flatMap(nodes)] : [])
const txt = (text: string) => ({ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' })
const para = (...children: unknown[]) => ({ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, children })
const doc = (...children: unknown[]) => ({ root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children } })
const cite = (source: number) => ({ type: 'inlineBlock', version: 1, fields: { blockType: 'cite', source } })
const sourceDoc = async (sourceId: string) =>
  (await payload.find({ collection: 'sources', where: { sourceId: { equals: sourceId } }, overrideAccess: true })).docs[0]

describe('view model Câu chuyện', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    await resetDb(payload)
    process.env.APP_ENV = 'development'
    process.env.SEED_FORCE_GLOBALS = 'true'
    await seed(payload)
    delete process.env.SEED_FORCE_GLOBALS
    stories = createStories(payload, createContent(payload))
  }, 240_000)
  afterAll(() => {
    if (savedAppEnv === undefined) delete process.env.APP_ENV
    else process.env.APP_ENV = savedAppEnv
    if (savedForce === undefined) delete process.env.SEED_FORCE_GLOBALS
    else process.env.SEED_FORCE_GLOBALS = savedForce
  })

  describe('getStoriesPage', () => {
    it('public: 5 bài idea đã đăng (bài nháp bị lọc), nhãn "Chủ đề đề xuất", không có "Bản nháp"', async () => {
      const v = await stories.getStoriesPage('public')
      expect(v.stories).toHaveLength(5)
      expect(v.stories.every((s) => s.status === 'Chủ đề đề xuất' && s.hasDetail === false)).toBe(true)
      expect(v.stories.some((s) => s.status === 'Bản nháp')).toBe(false)
      expect(v.stories.some((s) => s.isDraft)).toBe(false)
      expect(v.intro.lead).toBe('Ký ức, lịch sử và đời sống hôm nay của làng Hới.')
      expect(v.filters).toEqual([
        { key: 'all', label: 'Tất cả' },
        { key: 'history', label: 'Lịch sử' },
        { key: 'village-memory', label: 'Ký ức làng quê' },
        { key: 'traditional-craft', label: 'Nghề truyền thống' },
        { key: 'people', label: 'Con người' },
        { key: 'life-today', label: 'Đời sống hôm nay' },
      ])
      expect(v.copy.detail.preview).toBeNull()
    })
    it('categoryKey của mọi thẻ là một khoá chip (trừ all), ở cả hai mode', async () => {
      for (const mode of ['public', 'preview'] as const) {
        const v = await stories.getStoriesPage(mode)
        const keys = v.filters.map((f) => f.key).filter((k) => k !== 'all')
        for (const s of v.stories) expect(keys).toContain(s.categoryKey)
        const label = new Map(v.filters.map((f) => [f.key, f.label]))
        for (const s of v.stories) expect(label.get(s.categoryKey as string)).toBe(s.category)
      }
    })
    it('preview: 6 bài, bài Trạng Chiếu là "Bản nháp" có 3 nguồn', async () => {
      const v = await stories.getStoriesPage('preview')
      expect(v.stories).toHaveLength(6)
      const draft = v.stories.find((s) => s.slug === SLUG)
      expect(draft?.status).toBe('Bản nháp')
      expect(draft?.sourceCount).toBe(3)
      expect(v.stories.filter((s) => s.status === 'Bản nháp')).toHaveLength(1)
      expect(draft?.isDraft).toBe(true)
      expect(v.stories.filter((s) => s.isDraft).map((s) => s.slug)).toEqual([SLUG])
      expect(v.copy.detail.preview?.checklistTitle).toBe('CẦN THẨM ĐỊNH TRƯỚC KHI ĐĂNG')
    })
    it('thứ tự theo createdAt tăng dần: bài Trạng Chiếu (seed đầu tiên) đứng đầu', async () => {
      const v = await stories.getStoriesPage('preview')
      expect(v.stories[0].slug).toBe(SLUG)
    })
    it('featured: preview là Trạng Chiếu với eyebrow và meta dựng ở lib; public là null', async () => {
      const pv = await stories.getStoriesPage('preview')
      expect(pv.featured?.story.slug).toBe(SLUG)
      // Chủ đề giữ chữ nhãn option; StoryCard in hoa bằng CSS.
      expect(pv.featured?.eyebrow).toBe('BÀI NỔI BẬT · Lịch sử')
      expect(pv.featured?.meta).toBe('3 nguồn báo chí · khoảng 4 phút đọc')
      expect((await stories.getStoriesPage('public')).featured).toBeNull()
    })
  })

  describe('getStoryPage', () => {
    it('public: null cho bài nháp, bài idea và slug lạ', async () => {
      expect(await stories.getStoryPage(SLUG, 'public')).toBeNull()
      expect(await stories.getStoryPage('mua-chieu-tet', 'public')).toBeNull()
      expect(await stories.getStoryPage('khong-co', 'public')).toBeNull()
    })
    it('preview bài Trạng Chiếu: mục lục, nguồn đánh số, checklist, một ảnh, Đọc tiếp', async () => {
      const v = await stories.getStoryPage(SLUG, 'preview')
      expect(v).not.toBeNull()
      const s = v!.story
      // Seed chưa có biên tập viên và ngày đăng: preview hiện [cần xác minh], dòng meta dựng ở lib.
      expect(v!.meta).toEqual(['Biên tập: [cần xác minh]', 'Ngày đăng: [cần xác minh]', 'Khoảng 4 phút đọc', '3 nguồn'])
      expect(s.toc.map((t) => t.title)).toEqual([
        'Một Tam nguyên của làng Hải Triều',
        'Khung dệt từ phương Bắc',
        'Truyền khẩu và sử liệu',
        'Ông Trạng trong đời sống làng',
      ])
      expect(s.toc[0].id).toBe('mot-tam-nguyen-cua-lang-hai-trieu')
      expect(s.sources.map((x) => x.id)).toEqual(['vietnamplus-2026', 'danviet-2024', 'daidoanket-2021'])
      expect(s.sources[1].date).toBe('13/06/2024')
      expect(s.reviewChecklist).toEqual([
        'Đối chiếu năm sinh, năm mất, năm đỗ với sử liệu khoa bảng.',
        'Xác nhận ngày lễ tế tổ nghề với người làng.',
        'Xin phép và ghi công tác giả ảnh.',
      ])
      expect(s.coverCaption).toBe('Khung dệt thủ công ngày nay. Ảnh minh hoạ cho bài, không phải khung dệt thời Lê.')
      expect(s.status).toBe('Bản nháp')
      const all = nodes(s.body?.root as N)
      const figures = all.filter((n) => n.type === 'figure')
      expect(figures).toHaveLength(1)
      expect(figures[0].caption).toBe('Đôi tay trên khung dệt. Ảnh: [tác giả — cần xác minh] · Quyền dùng: [cần xác minh]')
      expect((figures[0].image as { url: string }).url).toBeTruthy()
      // Số chú thích trong bài khớp danh sách nguồn: [1] là Vietnam+, [2] Dân Việt.
      expect(all.filter((n) => n.type === 'cite').slice(0, 2)).toEqual([{ type: 'cite', n: 1 }, { type: 'cite', n: 2 }])
      expect(JSON.stringify(s.body)).not.toContain('inlineBlock')

      expect(v!.readNext).toHaveLength(3)
      expect(v!.readNext.slice(0, 2).map((r) => r.href)).toEqual(['/lang-hoi', '/nghe-det-chieu'])
      expect(v!.readNext[0].image).not.toBeNull()
      const third = v!.readNext[2]
      expect(third.mobile).toBe(false)
      expect(third.href).toBe('/cau-chuyen')
      expect(third.title).not.toBe('Chuyện về Trạng Chiếu')
      expect(third.title).toBe('Những ký ức bên khung dệt')
      expect(third.eyebrow).toMatch(/ · Chủ đề đề xuất$/)
      expect(third.cta).toBe('Xem đề cương →')
    })
    it('bài đã đăng: cite tới nguồn có tiêu đề chưa xác minh bị bỏ cùng đoạn chỉ trích nguồn đó (public)', async () => {
      const bad = await sourceDoc('danviet-2024')
      const ok = await sourceDoc('daidoanket-2021')
      const title = bad.title
      const st = await createStory({
        slug: 'thu-cite', title: 'Thử cite', sources: [bad.id, ok.id],
        body: doc(para(txt('Đoạn chỉ trích nguồn ẩn'), cite(bad.id)), para(txt('Đoạn trích nguồn tốt'), cite(ok.id), cite(bad.id))),
      })
      await payload.update({ collection: 'sources', id: bad.id, data: { title: '[cần xác minh]' }, overrideAccess: true })
      try {
        const v = await stories.getStoryPage('thu-cite', 'public')
        expect(v?.story.sources.map((s) => s.id)).toEqual(['daidoanket-2021'])
        expect(v?.story.sourceCount).toBe(1)
        const json = JSON.stringify(v?.story.body)
        expect(json).not.toContain('Đoạn chỉ trích nguồn ẩn')
        expect(json).toContain('Đoạn trích nguồn tốt')
        expect(nodes(v?.story.body?.root as N).filter((n) => n.type === 'cite')).toEqual([{ type: 'cite', n: 1 }])
        const p = await stories.getStoryPage('thu-cite', 'preview')
        expect(JSON.stringify(p?.story.body)).toContain('Đoạn chỉ trích nguồn ẩn')
      } finally {
        await payload.update({ collection: 'sources', id: bad.id, data: { title }, overrideAccess: true })
        await payload.delete({ collection: 'stories', id: st.id, overrideAccess: true })
      }
    })
    it('bài đã đăng có figure với ảnh rights unknown: public không có figure, preview có', async () => {
      const asset = (await payload.create({
        collection: 'archive-assets',
        data: { alt: 'Ảnh thử', rights: 'unknown', subjectConsent: 'not_applicable' },
        filePath: fixture, overrideAccess: true,
      } as never)) as { id: number }
      const st = await createStory({
        slug: 'thu-anh', title: 'Thử ảnh',
        body: doc(para(txt('Mở đầu')), {
          type: 'block', version: 2, format: '',
          fields: { id: 'f-thu', blockName: '', blockType: 'figure', image: asset.id, caption: 'Chú thích' },
        }),
      })
      try {
        const pub = await stories.getStoryPage('thu-anh', 'public')
        expect(nodes(pub?.story.body?.root as N).some((n) => n.type === 'figure')).toBe(false)
        expect(JSON.stringify(pub?.story.body)).not.toContain('Chú thích')
        const pre = await stories.getStoryPage('thu-anh', 'preview')
        expect(nodes(pre?.story.body?.root as N).filter((n) => n.type === 'figure')).toHaveLength(1)
      } finally {
        await payload.delete({ collection: 'stories', id: st.id, overrideAccess: true })
        await payload.delete({ collection: 'archive-assets', id: asset.id, overrideAccess: true })
      }
    })
  })

  it('trang chi tiết: sourceCount bằng số nguồn trong "Ghi chú nguồn", kể cả nguồn được trích ngoài danh sách bài', async () => {
    const own = await sourceDoc('daidoanket-2021')
    const extra = await sourceDoc('vietnamplus-2026')
    const st = await createStory({
      slug: 'thu-dem', title: 'Thử đếm', sources: [own.id],
      body: doc(para(txt('Trích nguồn ngoài danh sách'), cite(extra.id))),
    })
    try {
      const v = await stories.getStoryPage('thu-dem', 'public')
      expect(v?.story.sources.map((s) => s.id)).toEqual(['vietnamplus-2026', 'daidoanket-2021'])
      expect(v?.story.sourceCount).toBe(2)
      const card = (await stories.getStoriesPage('public')).stories.find((s) => s.slug === 'thu-dem')
      expect(card?.sourceCount).toBe(1)
    } finally {
      await payload.delete({ collection: 'stories', id: st.id, overrideAccess: true })
    }
  })

  it('getStorySlugs chỉ gồm bài đã đăng và không phải idea', async () => {
    expect(await stories.getStorySlugs()).toEqual([])
    const st = await createStory({ slug: 'da-dang', title: 'Đã đăng' })
    try {
      expect(await stories.getStorySlugs()).toEqual(['da-dang'])
    } finally {
      await payload.delete({ collection: 'stories', id: st.id, overrideAccess: true })
    }
  })
})

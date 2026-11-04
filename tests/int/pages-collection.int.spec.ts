// @vitest-environment node
import path from 'path'
import { Forbidden, type Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import type { User } from '@/payload-types'

import { getTestPayload, makeUser, resetDb } from './helpers'

const fixture = path.resolve(__dirname, '../fixtures/tiny.webp')

let payload: Payload
let reviewer: User
let editor: User

type PageDoc = { id: number; slug: string; title?: string | null; facts?: unknown[]; founder?: unknown }

const createPage = (slug: string, data: Record<string, unknown> = {}, draft = false) =>
  payload.create({
    collection: 'pages',
    data: { slug, ...data, ...(draft ? {} : { _status: 'published' }) },
    draft,
    user: reviewer,
    overrideAccess: true,
  } as never) as Promise<PageDoc>

const updatePage = (id: number, data: Record<string, unknown>, draft = false) =>
  payload.update({ collection: 'pages', id, data, draft, user: reviewer, overrideAccess: true } as never) as unknown as Promise<PageDoc>

/** Lời báo của các trường lỗi validate. */
const fieldErrors = async (p: Promise<unknown>): Promise<string[]> => {
  try {
    await p
  } catch (e) {
    return ((e as { data?: { errors?: { message: string }[] } }).data?.errors ?? []).map((x) => x.message)
  }
  throw new Error('Không có lỗi')
}

describe('collection pages', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  beforeEach(async () => {
    await resetDb(payload)
    reviewer = await makeUser(payload, 'reviewer')
    editor = await makeUser(payload, 'editor')
  })

  it('người dùng admin không tạo được trang', async () => {
    await expect(
      payload.create({
        collection: 'pages', data: { slug: 'home' }, user: reviewer, overrideAccess: false,
      } as never),
    ).rejects.toBeInstanceOf(Forbidden)
  })

  it('slug trùng thì lỗi', async () => {
    await createPage('home')
    await expect(createPage('home')).rejects.toThrow()
  })

  it('người dùng admin không xoá được trang', async () => {
    const p = await createPage('home')
    await expect(
      payload.delete({ collection: 'pages', id: p.id, user: reviewer, overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('biên tập viên lưu nháp được, không đăng được', async () => {
    const p = await createPage('lang-hoi', { title: 'Bản đăng' })
    const asEditor = (data: Record<string, unknown>, draft: boolean) =>
      payload.update({ collection: 'pages', id: p.id, data, draft, user: editor, overrideAccess: false } as never)
    await asEditor({ title: 'Nháp của biên tập viên' }, true)
    const draft = (await payload.findByID({ collection: 'pages', id: p.id, draft: true, overrideAccess: true })) as PageDoc
    expect(draft.title).toBe('Nháp của biên tập viên')
    await expect(asEditor({ title: 'Đăng', _status: 'published' }, false)).rejects.toBeInstanceOf(Forbidden)
    await expect(asEditor({ title: 'Sửa thẳng' }, false)).rejects.toBeInstanceOf(Forbidden)
    const live = (await payload.findByID({ collection: 'pages', id: p.id, draft: false, overrideAccess: true })) as PageDoc
    expect(live.title).toBe('Bản đăng')
  })

  it('tiêu đề giữ ngắt dòng', async () => {
    const p = await createPage('nghe-det-chieu', { title: 'Một tấm chiếu,\nmuôn công đoạn.' })
    const got = (await payload.findByID({ collection: 'pages', id: p.id, overrideAccess: true })) as PageDoc
    expect(got.title).toBe('Một tấm chiếu,\nmuôn công đoạn.')
  })

  it('xoá ảnh đang gắn vào ô: lưu lại trang vẫn được', async () => {
    const a = (await payload.create({
      collection: 'archive-assets', data: { alt: 'Ảnh thử' }, filePath: fixture, overrideAccess: true,
    } as never)) as { id: number }
    const p = await createPage('nghe-det-chieu', { media: [{ slot: 'hero', image: a.id, caption: 'x' }] })
    await payload.delete({ collection: 'archive-assets', id: a.id, user: reviewer, overrideAccess: true } as never)
    await updatePage(p.id, { eyebrow: 'Sửa', _status: 'published' })
    const got = (await payload.findByID({ collection: 'pages', id: p.id, depth: 0, overrideAccess: true })) as {
      media: { slot: string; image: number | null }[]
    }
    expect(got.media[0].slot).toBe('hero')
    expect(got.media[0].image).toBeNull()
  })

  it('bảng thông tin thiếu Mục, quá 3 dụng cụ, dòng so sánh thiếu Khía cạnh: bị từ chối khi đăng', async () => {
    const lh = await createPage('lang-hoi')
    await expect(updatePage(lh.id, { facts: [{ term: '', detail: 'x' }], _status: 'published' })).rejects.toThrow()
    const ndc = await createPage('nghe-det-chieu')
    const tools = [1, 2, 3, 4].map((n) => ({ name: `Dụng cụ ${n}` }))
    await expect(updatePage(ndc.id, { tools, _status: 'published' })).rejects.toThrow()
    await expect(updatePage(ndc.id, { compareRows: [{ aspect: '' }], _status: 'published' })).rejects.toThrow()
  })

  it('trường của trang khác không được ghi', async () => {
    const p = await createPage('home', { title: 'Trang chủ' })
    await updatePage(p.id, {
      facts: [{ term: 'Diện tích', detail: '...' }],
      founder: { noPortrait: 'x' },
      _status: 'published',
    })
    const got = (await payload.findByID({ collection: 'pages', id: p.id, overrideAccess: true })) as PageDoc
    expect(got.facts ?? []).toEqual([])
    expect((got.founder as { noPortrait?: string | null } | null)?.noPortrait ?? null).toBeNull()
    expect(got.title).toBe('Trang chủ')
  })

  it('ô ảnh không thuộc trang thì lỗi khi đăng', async () => {
    const p = await createPage('san-pham')
    expect(await fieldErrors(updatePage(p.id, { media: [{ slot: 'hero' }], _status: 'published' }))).toContain(
      'Ô ảnh không thuộc trang này.',
    )
    // Ô đúng của trang thì qua.
    await updatePage(p.id, { media: [{ slot: 'next-pattern' }], _status: 'published' })
  })

  it('ô ảnh dùng hai lần thì lỗi khi đăng', async () => {
    const p = await createPage('lang-hoi')
    expect(
      await fieldErrors(updatePage(p.id, { media: [{ slot: 'hero' }, { slot: 'hero' }], _status: 'published' })),
    ).toContain('Mỗi ô ảnh chỉ được dùng một lần.')
  })

  it('đăng trang này không đăng bản nháp của trang khác', async () => {
    const lh = await createPage('lang-hoi', { title: 'Cũ' })
    const ndc = await createPage('nghe-det-chieu', { title: 'Nghề' })
    await updatePage(lh.id, { title: 'Nháp' }, true)
    await updatePage(ndc.id, { title: 'Nghề mới', _status: 'published' })
    const { docs } = await payload.find({
      collection: 'pages', draft: false, overrideAccess: true, where: { slug: { equals: 'lang-hoi' } },
    })
    expect((docs[0] as PageDoc).title).toBe('Cũ')
    const draft = (await payload.findByID({
      collection: 'pages', id: lh.id, draft: true, overrideAccess: true,
    })) as PageDoc
    expect(draft.title).toBe('Nháp')
  })

  describe('kiểm nguồn khi đăng', () => {
    const makeSource = async (sourceId: string) =>
      (await payload.create({
        collection: 'sources', data: { sourceId, title: sourceId }, overrideAccess: true,
      })) as { id: number }

    const citing = async () => {
      const a = await makeSource('danviet-2024')
      const b = await makeSource('vnexpress-2023')
      return {
        pageSources: [a.id],
        facts: [{ term: 'Diện tích', detail: '...', sources: [a.id, b.id] }],
      }
    }

    it('đăng trang có câu trích nguồn ngoài pageSources thì lỗi, nêu mã nguồn', async () => {
      const p = await createPage('lang-hoi')
      const data = await citing()
      const errs = await fieldErrors(updatePage(p.id, { ...data, _status: 'published' }))
      expect(errs.join(' ')).toContain('Chưa có trong Nguồn tham khảo của trang')
      expect(errs.join(' ')).toContain('Bảng thông tin đầu trang, dòng "Diện tích" (vnexpress-2023)')
    })

    it('lưu nháp thì qua', async () => {
      const p = await createPage('lang-hoi')
      await updatePage(p.id, await citing(), true)
    })

    it('có skipPageSourcesCheck thì đăng được', async () => {
      const p = await createPage('lang-hoi')
      await payload.update({
        collection: 'pages', id: p.id, data: { ...(await citing()), _status: 'published' }, draft: false,
        user: reviewer, overrideAccess: true, context: { skipPageSourcesCheck: true },
      } as never)
    })

    it('đủ nguồn thì đăng được', async () => {
      const p = await createPage('lang-hoi')
      const a = await makeSource('a-1')
      await updatePage(p.id, {
        pageSources: [a.id], facts: [{ term: 't', detail: 'd', sources: [a.id] }], _status: 'published',
      })
    })
  })
})

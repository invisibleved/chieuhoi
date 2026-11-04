// @vitest-environment node
import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import type { User } from '@/payload-types'

import { getTestPayload, makeUser, resetDb } from './helpers'

let payload: Payload
let reviewer: User

const txt = (text: string) => ({ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' })
const lexical = (...children: unknown[]) => ({
  root: {
    type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
    children: [{ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, children }],
  },
})

const createSource = async (sourceId: string) =>
  (await payload.create({
    collection: 'sources', data: { sourceId, title: `Nguồn ${sourceId}` }, overrideAccess: true,
  } as never)) as { id: number }

const create = (collection: string, data: Record<string, unknown>, draft = false) =>
  payload.create({
    collection, data: { ...data, ...(draft ? {} : { _status: 'published' }) }, draft,
    user: reviewer, overrideAccess: true,
  } as never)

const del = (id: number) =>
  payload.delete({ collection: 'sources', id, user: reviewer, overrideAccess: false })

describe('xoá Nguồn đang được trích', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  beforeEach(async () => {
    await resetDb(payload)
    reviewer = await makeUser(payload, 'reviewer')
  })

  it('mốc timeline đã đăng: chặn, nêu tiêu đề mốc', async () => {
    const s = await createSource('tl')
    await create('timeline-events', {
      label: '1457', title: 'Mốc thử', order: 1, workflow: 'published', sources: [s.id],
    })
    await expect(del(s.id)).rejects.toThrow(/Không xoá được nguồn[\s\S]*Mốc thử/)
  })

  it('chỉ trong bản nháp của story: vẫn chặn', async () => {
    const s = await createSource('st')
    const story = (await create('stories', { slug: 'a', title: 'Bài A', workflow: 'published' })) as { id: number }
    await payload.update({
      collection: 'stories', id: story.id, draft: true, user: reviewer, overrideAccess: true,
      data: { sources: [s.id] },
    } as never)
    await expect(del(s.id)).rejects.toThrow(/Không xoá được nguồn/)
  })

  it('khối cite trong people.story: chặn', async () => {
    const s = await createSource('pp')
    await create('people', {
      slug: 'ho-so-thu', name: 'Ông Thử', consent: { name: true }, workflow: 'published',
      story: lexical(txt('x'), { type: 'inlineBlock', version: 1, fields: { blockType: 'cite', source: s.id } }),
    })
    await expect(del(s.id)).rejects.toThrow(/Không xoá được nguồn[\s\S]*Ông Thử/)
  })

  it('products.annotations.source: chặn', async () => {
    const s = await createSource('pr')
    await create('products', {
      slug: 'chieu-thu', name: 'Chiếu thử', workflow: 'published',
      annotations: [{ n: 1, title: 'Viền', source: s.id }],
    })
    await expect(del(s.id)).rejects.toThrow(/Không xoá được nguồn[\s\S]*Chiếu thử/)
  })

  it('chỉ trong bản nháp của trang: vẫn chặn', async () => {
    const s = await createSource('pgd')
    const page = (await create('pages', { slug: 'nghe-det-chieu', title: 'Nghề', workflow: 'published' })) as { id: number }
    await payload.update({
      collection: 'pages', id: page.id, draft: true, user: reviewer, overrideAccess: true,
      data: { compareRows: [{ aspect: 'Khung', sources: [s.id] }] },
    } as never)
    await expect(del(s.id)).rejects.toThrow(/Không xoá được nguồn[\s\S]*Trang: Nghề dệt chiếu/)
  })

  it('collection pages: chặn, nêu nhãn trang', async () => {
    const s = await createSource('pg')
    await create('pages', {
      slug: 'lang-hoi', title: 'Làng\nHới', workflow: 'published',
      pageSources: [s.id],
      facts: [{ term: 'Mục', detail: 'Nội dung', sources: [s.id] }],
    })
    await expect(del(s.id)).rejects.toThrow(/Không xoá được nguồn[\s\S]*Trang: Làng Hới/)
  })

  it('nguồn không ai trích: xoá được', async () => {
    const s = await createSource('free')
    await del(s.id)
    const left = await payload.find({ collection: 'sources', overrideAccess: true })
    expect(left.totalDocs).toBe(0)
  })

  it('resetDb chạy được khi còn nguồn được trích', async () => {
    const s = await createSource('reset')
    await create('timeline-events', { label: '1', title: 'M', order: 1, workflow: 'published', sources: [s.id] })
    await resetDb(payload)
    const left = await payload.find({ collection: 'sources', overrideAccess: true })
    expect(left.totalDocs).toBe(0)
  })
})

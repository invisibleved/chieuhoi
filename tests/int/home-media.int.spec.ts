// @vitest-environment node
import path from 'path'
import type { Payload } from 'payload'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { createContent } from '@/lib/content/queries'
import type { User } from '@/payload-types'

import { getTestPayload, makeUser, resetDb } from './helpers'

const fixture = path.resolve(__dirname, '../fixtures/tiny.webp')
const HERO_CAPTION = 'Ảnh: [tác giả — cần xác minh] · Địa điểm: [cần xác minh]'

let payload: Payload
let reviewer: User
let content: ReturnType<typeof createContent>

const asset = (data: Record<string, unknown>) =>
  payload.create({
    collection: 'archive-assets', data: { alt: 'Ảnh thử', ...data }, filePath: fixture, overrideAccess: true,
  } as never) as Promise<{ id: number }>

async function seedHomeMedia(over: Record<string, unknown>) {
  const [hero, inset, v1, v2] = await Promise.all(
    [1, 2, 3, 4].map((i) => asset({ title: `Ảnh ${i}`, code: `TL-0${i}`, ...over })),
  )
  await payload.updateGlobal({
    slug: 'page-intros',
    data: {
      home: {
        heroImage: hero.id, heroInset: inset.id, heroCaption: HERO_CAPTION,
        villageImages: [
          { image: v1.id, caption: 'Chiếu trải phơi trên bãi đất trống. Địa điểm và thời gian chụp: [cần xác minh].' },
          { image: v2.id, caption: 'Gấp chiếu thành phẩm. [Nhân vật — cần xin phép trước khi đăng]' },
        ],
      },
      _status: 'published',
    },
    user: reviewer, overrideAccess: true,
  } as never)
}

describe('getHomeMedia', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    content = createContent(payload)
  })
  beforeEach(async () => {
    await resetDb(payload)
    reviewer = await makeUser(payload, 'reviewer')
    await payload.updateGlobal({
      slug: 'page-intros', data: { _status: 'draft' }, user: reviewer, overrideAccess: true,
    } as never)
  })

  // Global không bị resetDb xoá: gỡ tham chiếu ảnh để không làm hỏng các file test khác.
  afterEach(async () => {
    // Đăng bản sạch rồi gỡ đăng: bản đã đăng cũ còn tham chiếu ảnh sẽ bị resetDb làm rỗng
    // và khiến lần cập nhật global kế tiếp (ở file test khác) vướng validation.
    for (const _status of ['published', 'draft']) {
      await payload.updateGlobal({
        slug: 'page-intros',
        data: { home: { heroImage: null, heroInset: null, villageImages: [] }, _status },
        user: reviewer, overrideAccess: true,
      } as never)
    }
  })

  it('public: ảnh chưa được phép thì hero null, làng rỗng', async () => {
    await seedHomeMedia({ rights: 'unknown', subjectConsent: 'pending' })
    const m = await content.getHomeMedia('public')
    expect(m.hero).toBeNull()
    expect(m.heroInset).toBeNull()
    expect(m.village).toEqual([])
  })
  it('preview: hiện ảnh kèm flag và caption nguyên văn', async () => {
    await seedHomeMedia({ rights: 'unknown', subjectConsent: 'pending' })
    const m = await content.getHomeMedia('preview')
    expect(m.hero?.image.flags).toContain('rights-not-permitted')
    expect(m.hero?.caption).toBe(HERO_CAPTION)
    expect(m.village).toHaveLength(2)
  })
  it('public: ảnh được phép thì hiện, caption có dấu vẫn ẩn', async () => {
    await seedHomeMedia({ rights: 'permitted', subjectConsent: 'not_applicable' })
    const m = await content.getHomeMedia('public')
    expect(m.hero?.image.url).toBeTruthy()
    expect(m.hero?.title).toBe('Ảnh 1')
    expect(m.hero?.caption).toBeNull()
    expect(m.heroInset).not.toBeNull()
    expect(m.village.map((v) => v.caption)).toEqual([null, null])
  })
  it('global chưa đăng: public trả rỗng, không lỗi', async () => {
    const m = await content.getHomeMedia('public')
    expect(m).toEqual({ hero: null, heroInset: null, village: [] })
  })
})

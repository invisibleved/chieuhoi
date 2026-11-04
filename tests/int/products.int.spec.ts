// @vitest-environment node
import path from 'path'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createContent } from '@/lib/content/queries'
import { createProducts } from '@/lib/content/products'
import { seed } from '@/seed'

import { getTestPayload, resetDb, syncPagesFromGlobal } from './helpers'

const fixture = path.resolve(__dirname, '../fixtures/tiny.webp')

let payload: Payload
let products: ReturnType<typeof createProducts>
const savedAppEnv = process.env.APP_ENV
const savedForce = process.env.SEED_FORCE_GLOBALS

const reviewer = async () => {
  const [u] = (await payload.find({ collection: 'users', overrideAccess: true })).docs
  return { ...u, collection: 'users' }
}
const create = async (collection: string, data: Record<string, unknown>, draft = false) =>
  (await payload.create({
    collection, data: { ...data, ...(draft ? {} : { _status: 'published' }) }, draft,
    user: await reviewer(), overrideAccess: true,
  } as never)) as { id: number }
const asset = (data: Record<string, unknown> = {}) =>
  payload.create({
    collection: 'archive-assets',
    data: { alt: 'Ảnh thử', rights: 'permitted', subjectConsent: 'not_applicable', ...data },
    filePath: fixture, overrideAccess: true,
  } as never) as Promise<{ id: number }>

describe('view model Sản phẩm', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    await resetDb(payload)
    process.env.APP_ENV = 'development'
    process.env.SEED_FORCE_GLOBALS = 'true'
    await seed(payload)
    await syncPagesFromGlobal(payload)
    delete process.env.SEED_FORCE_GLOBALS
    products = createProducts(payload, createContent(payload))
  }, 240_000)
  afterAll(() => {
    if (savedAppEnv === undefined) delete process.env.APP_ENV
    else process.env.APP_ENV = savedAppEnv
    if (savedForce === undefined) delete process.env.SEED_FORCE_GLOBALS
    else process.env.SEED_FORCE_GLOBALS = savedForce
  })

  describe('getProductsPage', () => {
    it('preview: 7 hiện vật theo thứ tự seed, bộ lọc, nhãn thẻ, link nguồn danh mục', async () => {
      const v = await products.getProductsPage('preview')
      expect(v.products.map((p) => p.slug)).toEqual([
        'chieu-cap-dieu', 'chieu-hoa-cai', 'chieu-tron', 'chieu-dot', 'chieu-soi-xe', 'chieu-gon', 'chieu-duong-dai',
      ])
      expect(v.filters).toEqual([
        { key: 'all', label: 'Tất cả' },
        { key: 'traditional', label: 'Chiếu cói truyền thống' },
        { key: 'contemporary', label: 'Chiếu đương đại' },
      ])
      const by = Object.fromEntries(v.products.map((p) => [p.slug, p]))
      expect(by['chieu-dot'].tag).toEqual({ text: 'Chưa có ảnh', style: 'dashed' })
      expect(by['chieu-cap-dieu'].tag).toEqual({ text: 'Ảnh cần xác nhận loại', style: 'filled' })
      expect(by['chieu-dot'].shotNeeded).toEqual({
        desktop: 'Chiếu đót chụp phẳng, ánh sáng tự nhiên, kèm cận cảnh mặt dệt',
        mobile: 'Chiếu đót',
      })
      expect(v.catalogSourceUrl).toMatch(/^https:\/\/www\.vietnamplus\.vn\//)
      expect(v.copy.detail.preview).not.toBeNull()
    })
    it('public: không có ghi chú quy trình', async () => {
      const v = await products.getProductsPage('public')
      expect(v.copy.detail.preview).toBeNull()
      expect(v.products.every((p) => p.image === null)).toBe(true)
    })
  })

  describe('getProductPage', () => {
    it('preview chieu-cap-dieu: chú thích, nguồn, chú thích ảnh, others', async () => {
      const v = await products.getProductPage('chieu-cap-dieu', 'preview')
      expect(v).not.toBeNull()
      const p = v!.product
      expect(p.annotations).toHaveLength(3)
      expect(p.annotations.map((a) => a.shortTitle)).toEqual(['Viền', 'Hoa văn', 'Mặt cói'])
      expect(p.annotations.map((a) => a.heading)).toEqual(p.annotations.map((a) => `${a.n} · ${a.title}`))
      expect(p.annotations[0].markerLabel).toBe(`Chi tiết 1: ${p.annotations[0].title!.toLocaleLowerCase('vi')}`)
      expect(p.annotations.map((a) => a.pickerLabel)).toEqual(['1 · Viền', '2 · Hoa văn', '3 · Mặt cói'])
      expect(p.annotations[1].sourceN).toBe(1)
      expect(p.annotations[1].sourceLine).toBe('Vietnam+ (14/08/2026) · danh sách hoạ tiết chung, không riêng tấm này')
      expect(p.annotations[0].sourceN).toBeNull()
      expect(p.annotations[0].sourceLine).toBe('Quan sát từ ảnh · chưa xác minh')
      expect(p.sources).toHaveLength(1)
      expect(p.sources[0].date).toBe('14/08/2026')
      expect(p.imageCaptions[0]).toBe('Ảnh 1/4 · Ảnh: [cần xác minh] · Chưa xác nhận đây là chiếu cạp điều')
      expect(p.imageCaptions).toHaveLength(p.images.length)
      expect(p.typeNote).toBe('Ảnh cần cơ sở dệt xác nhận đúng loại')
      expect(p.context).toMatch(/^Chiếu cạp điều có trong danh sách/)
      expect(p.pattern).toBe('In bằng khuôn [cần xác minh cho tấm này]')
      expect(v!.others.map((o) => o.href)).toEqual(['/san-pham/chieu-hoa-cai', '/san-pham/chieu-tron', '/nghe-det-chieu'])
      expect(v!.others.map((o) => o.mobile)).toEqual([undefined, undefined, false])
      expect(v!.others[0]).toMatchObject({ eyebrow: 'HIỆN VẬT 02', title: 'Chiếu hoa cài', cta: 'Xem hiện vật →' })
      expect(v!.others[2]).toMatchObject({ eyebrow: 'CÁCH LÀM', title: 'Công đoạn tạo hoa văn' })
      expect(v!.others[2].image).not.toBeNull()
    })
    it('preview: size/care trống là null (copy hiện placeholder), không phải [cần xác minh]', async () => {
      const p = (await products.getProductPage('chieu-cap-dieu', 'preview'))!.product
      expect(p.size).toBeNull()
      expect(p.care).toBeNull()
    })
    it('others vòng lại đầu danh sách', async () => {
      const v = await products.getProductPage('chieu-duong-dai', 'preview')
      expect(v!.others.slice(0, 2).map((o) => o.href)).toEqual(['/san-pham/chieu-cap-dieu', '/san-pham/chieu-hoa-cai'])
    })
    it('public chieu-cap-dieu: ảnh bị ẩn, không chú thích còn dấu cần xác minh', async () => {
      const p = (await products.getProductPage('chieu-cap-dieu', 'public'))!.product
      expect(p.images).toEqual([])
      expect(p.primaryImage).toBeNull()
      expect(p.hasPattern).toBe(false)
      expect(p.annotations.every((a) => !a.body.includes('[cần'))).toBe(true)
      expect(p.imageCaptions).toEqual([])
      expect(p.typeNote).toBeNull()
      expect(p.pattern).toBeNull()
      expect(p.material).toBeNull()
    })
    it('slug lạ hoặc hiện vật nháp ở public trả null', async () => {
      expect(await products.getProductPage('khong-co', 'public')).toBeNull()
      await create('products', { slug: 'chieu-nhap', name: 'Nháp', workflow: 'draft' }, true)
      expect(await products.getProductPage('chieu-nhap', 'public')).toBeNull()
      expect(await products.getProductPage('chieu-nhap', 'preview')).not.toBeNull()
    })
    it('getProductSlugs chỉ gồm hiện vật đã đăng', async () => {
      const slugs = await products.getProductSlugs()
      expect(slugs).toContain('chieu-cap-dieu')
      expect(slugs).not.toContain('chieu-nhap')
      expect(slugs).toHaveLength(7)
    })
  })

  describe('cơ sở dệt', () => {
    it('chưa đồng ý công khai: public không có maker và không lộ liên hệ; đồng ý + xác minh thì có liên hệ', async () => {
      const m = await create('makers', { name: 'Cơ sở Thử', contact: '0900', publicConsent: false, verified: false, workflow: 'published' })
      await create('products', { slug: 'co-maker', name: 'Chiếu có maker', workflow: 'published', maker: m.id })
      const hidden = await products.getProductPage('co-maker', 'public')
      expect(hidden!.product.maker).toBeNull()
      expect(JSON.stringify(hidden)).not.toContain('0900')
      expect(JSON.stringify(hidden)).not.toContain('Cơ sở Thử')
      await payload.update({
        collection: 'makers', id: m.id, data: { publicConsent: true, verified: true, _status: 'published' },
        user: await reviewer(), overrideAccess: true,
      } as never)
      const shown = await products.getProductPage('co-maker', 'public')
      expect(shown!.product.maker).toEqual({ name: 'Cơ sở Thử', verified: true, contact: '0900' })
      expect(shown!.product.contactLine).toBe('0900')
    })
    it('không có cơ sở nào qua cổng: contactLine là câu noMaker', async () => {
      await create('products', { slug: 'khong-maker', name: 'Chiếu không maker', workflow: 'published' })
      const v = await products.getProductPage('khong-maker', 'public')
      expect(v!.product.maker).toBeNull()
      expect(v!.product.contactLine).toBe('Chưa có cơ sở được xác minh và đồng ý công khai')
    })
    it('cơ sở đã đăng, đồng ý, xác minh nhưng liên hệ trống: không có câu noMaker (contactLine null)', async () => {
      const m = await create('makers', { name: 'Cơ sở C', publicConsent: true, verified: true, workflow: 'published' })
      await create('products', { slug: 'co-maker-c', name: 'Chiếu C', workflow: 'published', maker: m.id })
      const v = await products.getProductPage('co-maker-c', 'public')
      expect(v!.product.maker).toEqual({ name: 'Cơ sở C', verified: true, contact: null })
      expect(v!.product.contactLine).toBeNull()
    })
    it('cơ sở nháp dù có đồng ý: ẩn ở public, contactLine là noMaker', async () => {
      const m = await create('makers', { name: 'Cơ sở Nháp', contact: '0922', publicConsent: true, verified: true, workflow: 'draft' }, true)
      await create('products', { slug: 'co-maker-nhap', name: 'Chiếu Nháp', workflow: 'published', maker: m.id })
      const v = await products.getProductPage('co-maker-nhap', 'public')
      expect(v!.product.maker).toBeNull()
      expect(v!.product.contactLine).toBe('Chưa có cơ sở được xác minh và đồng ý công khai')
      expect(JSON.stringify(v)).not.toContain('0922')
    })
    it('đồng ý nhưng chưa xác minh: có tên, chưa có liên hệ', async () => {
      const m = await create('makers', { name: 'Cơ sở B', contact: '0911', publicConsent: true, verified: false, workflow: 'published' })
      await create('products', { slug: 'co-maker-b', name: 'Chiếu B', workflow: 'published', maker: m.id })
      const v = await products.getProductPage('co-maker-b', 'public')
      expect(v!.product.maker).toEqual({ name: 'Cơ sở B', verified: false, contact: null })
      expect(JSON.stringify(v)).not.toContain('0911')
    })
  })

  describe('nguồn và ảnh bị ẩn', () => {
    it('chú thích trỏ nguồn bị ẩn ở public: sourceN null, sources rỗng, không dòng nguồn từ nguồn đó', async () => {
      const src = await create('sources', { sourceId: 'an-1', title: '[cần xác minh]', publisher: 'Báo X', date: '2020-01-02' })
      await create('products', {
        slug: 'nguon-an', name: 'Chiếu', workflow: 'published',
        annotations: [{ n: 1, title: 'Viền', x: 10, y: 10, body: 'Phần viền.', source: src.id }],
      })
      const pub = (await products.getProductPage('nguon-an', 'public'))!.product
      expect(pub.annotations).toHaveLength(1)
      expect(pub.annotations[0].sourceN).toBeNull()
      expect(pub.annotations[0].sourceLine).toBeNull()
      expect(pub.sources).toEqual([])
    })
    it('đánh số nguồn theo lần xuất hiện đầu, chỉ tính chú thích còn hiện', async () => {
      const a = await create('sources', { sourceId: 'ok-a', title: 'Bài A', publisher: 'Báo A', date: '2021-03-04' })
      const b = await create('sources', { sourceId: 'ok-b', title: 'Bài B', publisher: 'Báo B' })
      const img = await asset()
      await create('products', {
        slug: 'nguon-ok', name: 'Chiếu', workflow: 'published', images: [img.id],
        annotations: [
          { n: 1, title: 'Một', x: 1, y: 1, body: 'Ẩn: [cần xác minh]', source: a.id },
          { n: 2, title: 'Hai', x: 2, y: 2, body: 'Hai', source: b.id },
          { n: 3, title: 'Ba', x: 3, y: 3, body: 'Ba', source: a.id },
        ],
      })
      const p = (await products.getProductPage('nguon-ok', 'public'))!.product
      expect(p.annotations.map((x) => x.n)).toEqual([2, 3])
      expect(p.annotations.map((x) => x.sourceN)).toEqual([1, 2])
      expect(p.sources.map((s) => s.id)).toEqual(['ok-b', 'ok-a'])
      expect(p.annotations[0].sourceLine).toBe('Báo B')
      expect(p.annotations[1].sourceLine).toBe('Báo A (04/03/2021)')
      expect(p.hasPattern).toBe(true)
      expect(p.typeNote).toBe('Ảnh cần cơ sở dệt xác nhận đúng loại')
    })
  })

  describe('chữ khung "Ảnh cần chụp"', () => {
    it('tên bị ẩn ở public thì shotNeeded null (không điền "[cần xác minh]")', async () => {
      await create('products', { slug: 'khong-ten', workflow: 'published' })
      const pub = (await products.getProductsPage('public')).products.find((p) => p.slug === 'khong-ten')
      expect(pub).toBeTruthy()
      expect(pub!.name).toBeNull()
      expect(pub!.shotNeeded).toBeNull()
    })
  })
})

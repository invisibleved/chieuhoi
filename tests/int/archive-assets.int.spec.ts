// @vitest-environment node
import { existsSync, mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import sharp from 'sharp'
import path from 'path'
import { handleEndpoints, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { isAssetPubliclyAllowed } from '@/collections/ArchiveAssets'

import type { ArchiveAsset } from '@/payload-types'
import { getTestPayload, makeUser, resetDb } from './helpers'

const fixture = path.resolve(__dirname, '../fixtures/tiny.webp')

let payload: Payload

async function makeAsset(
  data: Partial<
    Omit<ArchiveAsset, 'id' | 'createdAt' | 'updatedAt' | 'url' | 'filename' | 'sizes'>
  > = {},
) {
  const reviewer = await makeUser(payload, 'reviewer')
  return payload.create({
    collection: 'archive-assets',
    data: { alt: 'Ảnh thử', ...data } as RequiredDataFromCollectionSlug<'archive-assets'>,
    filePath: fixture,
    user: reviewer,
    overrideAccess: false,
  })
}

/** Gọi đường phục vụ file thật của Payload, không đăng nhập. */
async function anonGetFile(filename: string): Promise<Response> {
  const config = (await import('@/payload.config')).default
  return handleEndpoints({
    config,
    request: new Request(`http://localhost/api/archive-assets/file/${filename}`),
  })
}

describe('archive-assets', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })
  beforeEach(async () => {
    await resetDb(payload)
  })

  it('upload ghi vào thư mục media của test, không phải media dev', () => {
    const dir = (payload.collections['archive-assets'].config.upload as { staticDir?: string })
      .staticDir
    expect(dir).toBe(process.env.MEDIA_DIR)
    expect(dir).toContain('chieuhoi-media-')
  })

  it('isAssetPubliclyAllowed', () => {
    expect(isAssetPubliclyAllowed({ rights: 'permitted', subjectConsent: 'given' })).toBe(true)
    expect(isAssetPubliclyAllowed({ rights: 'permitted', subjectConsent: 'pending' })).toBe(false)
    expect(isAssetPubliclyAllowed({ rights: 'unknown', subjectConsent: 'given' })).toBe(false)
  })

  it('khách không lấy được file ảnh rights unknown', async () => {
    const doc = await makeAsset({ subjectConsent: 'not_applicable' })
    expect(doc.rights).toBe('unknown')
    const res = await anonGetFile(doc.filename as string)
    expect([403, 404]).toContain(res.status)
  })

  it('khách lấy được file ảnh permitted + not_applicable', async () => {
    const doc = await makeAsset({ rights: 'permitted', subjectConsent: 'not_applicable' })
    const res = await anonGetFile(doc.filename as string)
    expect(res.status).toBe(200)
  })

  it('R5: staging cho khách tải file ảnh unknown, development vẫn chặn, find vẫn đóng', async () => {
    const saved = process.env.APP_ENV
    try {
      const doc = await makeAsset({ subjectConsent: 'not_applicable' })
      expect(doc.rights).toBe('unknown')
      process.env.APP_ENV = 'development'
      expect([403, 404]).toContain((await anonGetFile(doc.filename as string)).status)
      process.env.APP_ENV = 'staging'
      expect((await anonGetFile(doc.filename as string)).status).toBe(200)
      await expect(payload.find({ collection: 'archive-assets', overrideAccess: false })).rejects.toThrow()
      process.env.APP_ENV = 'production'
      expect([403, 404]).toContain((await anonGetFile(doc.filename as string)).status)
    } finally {
      if (saved === undefined) delete process.env.APP_ENV
      else process.env.APP_ENV = saved
    }
  })

  it('ảnh permitted nhưng subjectConsent pending vẫn bị chặn', async () => {
    const doc = await makeAsset({ rights: 'permitted' })
    expect(doc.subjectConsent).toBe('pending')
    const res = await anonGetFile(doc.filename as string)
    expect([403, 404]).toContain(res.status)
  })

  it('khách không liệt kê được metadata ảnh qua find', async () => {
    await makeAsset({ rights: 'permitted', subjectConsent: 'given' })
    await makeAsset({})
    await expect(
      payload.find({ collection: 'archive-assets', overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('editor không sửa được trường của ảnh đã duyệt', async () => {
    const doc = await makeAsset({ rights: 'permitted', subjectConsent: 'not_applicable' })
    const editor = await makeUser(payload, 'editor')
    await expect(
      payload.update({
        collection: 'archive-assets',
        id: doc.id,
        data: { alt: 'Đổi alt' },
        user: editor,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    const after = await payload.findByID({ collection: 'archive-assets', id: doc.id })
    expect(after.alt).toBe('Ảnh thử')
  })

  it('editor không thay file của ảnh đã duyệt', async () => {
    const doc = await makeAsset({ rights: 'permitted', subjectConsent: 'not_applicable' })
    const editor = await makeUser(payload, 'editor')
    await expect(
      payload.update({
        collection: 'archive-assets',
        id: doc.id,
        data: {},
        filePath: fixture,
        user: editor,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    // Bị từ chối thì file gốc và các bản thu nhỏ vẫn còn nguyên.
    const dir = process.env.MEDIA_DIR as string
    expect(existsSync(path.join(dir, doc.filename as string))).toBe(true)
    for (const size of Object.values(doc.sizes ?? {})) {
      if (size?.filename) expect(existsSync(path.join(dir, size.filename))).toBe(true)
    }
  })

  it('editor vẫn sửa được ảnh chưa duyệt', async () => {
    const doc = await makeAsset({})
    const editor = await makeUser(payload, 'editor')
    const updated = await payload.update({
      collection: 'archive-assets',
      id: doc.id,
      data: { alt: 'Sửa được' },
      user: editor,
      overrideAccess: false,
    })
    expect(updated.alt).toBe('Sửa được')
  })

  it('reviewer sửa được ảnh đã duyệt', async () => {
    const doc = await makeAsset({ rights: 'permitted', subjectConsent: 'not_applicable' })
    const reviewer = await makeUser(payload, 'reviewer')
    const updated = await payload.update({
      collection: 'archive-assets',
      id: doc.id,
      data: { alt: 'Reviewer sửa' },
      user: reviewer,
      overrideAccess: false,
    })
    expect(updated.alt).toBe('Reviewer sửa')
  })

  it('file tải lên được đổi tên mờ, không giữ tên gốc', async () => {
    const withCode = await makeAsset({ code: 'TL-077' })
    expect(withCode.filename).toBe('TL-077.webp')
    const noCode = await makeAsset({})
    expect(noCode.filename).not.toContain('tiny')
    expect(noCode.filename).toMatch(/^[0-9a-f-]{36}\.webp$/)
  })

  it('thay file vẫn giữ tên mờ, không lộ tên gốc', async () => {
    const doc = await makeAsset({ code: 'TL-078' })
    const reviewer = await makeUser(payload, 'reviewer')
    const updated = await payload.update({
      collection: 'archive-assets',
      id: doc.id,
      data: {},
      filePath: fixture,
      user: reviewer,
      overrideAccess: false,
    })
    expect(updated.filename).not.toContain('tiny')
  })

  it('inArchive thiếu code thì lỗi validate', async () => {
    const err = await makeAsset({ inArchive: true }).catch((e) => e)
    expect(err.name).toBe('ValidationError')
    expect(err.status).toBe(400)
    expect(err.data.errors.map((e: { path: string }) => e.path).sort()).toEqual([
      'category',
      'code',
      'era',
    ])
    const ok = await makeAsset({ inArchive: true, code: 'TL-001', category: 'village', era: 'old' })
    expect(ok.code).toBe('TL-001')
  })

  it('editor không sửa rights', async () => {
    const doc = await makeAsset({})
    const editor = await makeUser(payload, 'editor')
    const updated = await payload.update({
      collection: 'archive-assets',
      id: doc.id,
      data: { rights: 'permitted', subjectConsent: 'given', alt: 'Đổi alt' },
      user: editor,
      overrideAccess: false,
    })
    expect(updated.alt).toBe('Đổi alt')
    expect(updated.rights).toBe('unknown')
    expect(updated.subjectConsent).toBe('pending')
  })

  it('editor tạo ảnh với rights/consent tự đặt thì bị đưa về mặc định', async () => {
    const editor = await makeUser(payload, 'editor')
    const doc = await payload.create({
      collection: 'archive-assets',
      data: {
        alt: 'x',
        rights: 'permitted',
        subjectConsent: 'given',
      } as RequiredDataFromCollectionSlug<'archive-assets'>,
      filePath: fixture,
      user: editor,
      overrideAccess: false,
    })
    const read = await payload.findByID({ collection: 'archive-assets', id: doc.id })
    expect(read.rights).toBe('unknown')
    expect(read.subjectConsent).toBe('pending')
  })

  it('khách không lấy được file kích thước phụ của ảnh không được phép', async () => {
    const big = path.join(mkdtempSync(path.join(tmpdir(), 'chieuhoi-big-')), 'big.webp')
    await sharp({
      create: { width: 1200, height: 800, channels: 3, background: { r: 90, g: 120, b: 60 } },
      noise: { type: 'gaussian', mean: 128, sigma: 30 },
    } as never)
      .webp()
      .toFile(big)
    const reviewer = await makeUser(payload, 'reviewer')
    const doc = await payload.create({
      collection: 'archive-assets',
      data: { alt: 'x' } as RequiredDataFromCollectionSlug<'archive-assets'>,
      filePath: big,
      user: reviewer,
      overrideAccess: false,
    })
    const thumb = doc.sizes?.thumb?.filename as string
    expect(thumb).toBeTruthy()
    expect(thumb).not.toBe(doc.filename)
    const res = await anonGetFile(thumb)
    expect([403, 404]).toContain(res.status)
  })
})

// @vitest-environment node
import { mkdtempSync } from 'fs'
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

  it('ảnh permitted nhưng subjectConsent pending vẫn bị chặn', async () => {
    const doc = await makeAsset({ rights: 'permitted' })
    expect(doc.subjectConsent).toBe('pending')
    const res = await anonGetFile(doc.filename as string)
    expect([403, 404]).toContain(res.status)
  })

  it('find của khách chỉ trả ảnh được phép', async () => {
    await makeAsset({ rights: 'permitted', subjectConsent: 'given' })
    await makeAsset({})
    const res = await payload.find({ collection: 'archive-assets', overrideAccess: false })
    expect(res.docs).toHaveLength(1)
    expect(res.docs[0].rights).toBe('permitted')
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

// @vitest-environment node
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { handleEndpoints, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { isAssetPubliclyAllowed } from '@/collections/ArchiveAssets'

import type { ArchiveAsset } from '@/payload-types'
import { getTestPayload, makeUser, resetDb } from './helpers'

const fixture = path.resolve(__dirname, '../fixtures/tiny.webp')
const mediaDir = mkdtempSync(path.join(tmpdir(), 'chieuhoi-media-'))
process.env.MEDIA_DIR = mediaDir

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
  afterAll(() => {
    rmSync(mediaDir, { recursive: true, force: true })
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
    await expect(makeAsset({ inArchive: true })).rejects.toThrow()
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
})

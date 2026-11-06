import { getPayload, type Payload } from 'payload'

import type { RouteKey } from '@/lib/routeKeys'
import type { User } from '@/payload-types'

/**
 * Trả về Payload trỏ vào DB test (DATABASE_URI_TEST), không bao giờ vào DB dev.
 * Ghi đè DATABASE_URI trước khi nạp payload.config.
 */
export async function getTestPayload(): Promise<Payload> {
  const testUri = process.env.DATABASE_URI_TEST
  if (!testUri) {
    throw new Error('DATABASE_URI_TEST chưa được đặt (xem .env.example).')
  }
  // Import động: payload.config đọc DATABASE_URI ngay khi được nạp.
  process.env.DATABASE_URI = testUri
  const { default: config } = await import('@/payload.config')
  const payloadConfig = await config
  return getPayload({ config: payloadConfig })
}

/** Xoá mọi document của mọi collection. */
export async function resetDb(payload: Payload): Promise<void> {
  for (const collection of payload.config.collections) {
    await payload.delete({
      collection: collection.slug,
      where: { id: { exists: true } },
      overrideAccess: true,
      context: { skipLastReviewerGuard: true, skipSourceRefGuard: true },
    })
  }
}

let userSeq = 0

/** Tạo user theo vai trò (bỏ qua access). */
export async function makeUser(payload: Payload, role: 'editor' | 'reviewer'): Promise<User> {
  userSeq += 1
  return payload.create({
    collection: 'users',
    data: {
      email: `${role}-${Date.now()}-${userSeq}@example.test`,
      password: 'Test-password-123',
      name: `Test ${role}`,
      role,
    },
    overrideAccess: true,
    context: { skipFirstUserBootstrap: true },
  }) as Promise<User>
}

const PAGE_CTX = { disableRevalidate: true, skipPageSourcesCheck: true }

async function anyReviewer(payload: Payload) {
  const { docs } = await payload.find({
    collection: 'users', where: { role: { equals: 'reviewer' } }, limit: 1, depth: 0, overrideAccess: true, sort: 'id',
  })
  return { ...(docs[0] ?? (await makeUser(payload, 'reviewer'))), collection: 'users' as const }
}

/**
 * Tạo hoặc sửa tài liệu `pages` của `slug` (bỏ qua access, bỏ kiểm nguồn của trang).
 * `publish` (mặc định): đăng bằng người duyệt; ngược lại chỉ lưu nháp, bản đã đăng giữ nguyên.
 */
export async function upsertPage(
  payload: Payload, slug: RouteKey, data: Record<string, unknown>, opts: { publish?: boolean } = {},
): Promise<number> {
  const publish = opts.publish ?? true
  const user = await anyReviewer(payload)
  const status = publish ? { _status: 'published' } : {}
  const { docs } = await payload.find({
    collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true,
  })
  if (docs[0]) {
    await payload.update({
      collection: 'pages', id: docs[0].id, data: { ...data, ...status }, draft: !publish,
      user, overrideAccess: true, context: PAGE_CTX,
    } as never)
    return docs[0].id
  }
  const created = await payload.create({
    collection: 'pages', data: { slug, ...data, ...status }, draft: !publish,
    user, overrideAccess: true, context: PAGE_CTX,
  } as never) as unknown as { id: number }
  return created.id
}

/** Bản đã đăng (hoặc nháp mới nhất khi `draft`) của trang `slug`, quan hệ ở dạng id. */
export async function readPage(payload: Payload, slug: RouteKey, draft = false): Promise<Record<string, unknown>> {
  const { docs } = await payload.find({
    collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0, draft, overrideAccess: true,
  })
  return (docs[0] as unknown as Record<string, unknown> | undefined) ?? {}
}

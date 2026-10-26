import { getPayload, type Payload } from 'payload'

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
    })
  }
}

/** Tạo user theo vai trò. Viết ở Task 3 (khi Users có trường roles). */
export async function makeUser(_payload: Payload, _role: 'editor' | 'reviewer'): Promise<User> {
  throw new Error('makeUser: implemented in Task 3')
}

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

import type { Payload } from 'payload'

import { isReviewerUser } from '@/access/roles'

export const PENDING_COLLECTIONS = ['stories', 'people', 'products', 'makers', 'craft-steps', 'timeline-events'] as const

export type PendingCount = { collection: string; label: string; count: number; href: string }

const pluralLabel = (payload: Payload, slug: string): string => {
  const plural = payload.collections[slug as (typeof PENDING_COLLECTIONS)[number]]?.config.labels.plural
  return typeof plural === 'string' ? plural : slug
}

/** Số bản ghi đang chờ duyệt mỗi collection (tính cả bản nháp chưa từng đăng). Chỉ người duyệt nhận kết quả. */
export async function countPending(payload: Payload, user: unknown): Promise<PendingCount[]> {
  if (!isReviewerUser(user)) return []
  return Promise.all(
    PENDING_COLLECTIONS.map(async (collection) => {
      const { totalDocs } = await payload.find({
        collection,
        draft: true,
        where: { workflow: { equals: 'in_review' } },
        limit: 1,
        depth: 0,
        overrideAccess: false,
        user: user as never,
      })
      return {
        collection,
        label: pluralLabel(payload, collection),
        count: totalDocs,
        href: `/admin/collections/${collection}?where[workflow][equals]=in_review`,
      }
    }),
  )
}

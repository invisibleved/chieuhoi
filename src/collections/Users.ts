import {
  APIError,
  Forbidden,
  ValidationError,
  type Access,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type CollectionConfig,
} from 'payload'

import { ADMIN_GROUPS, controlFieldAdmin, isReviewer, isReviewerUser, reviewerOnlyField } from '@/access/roles'

/** Không có đăng ký công khai: chỉ người duyệt tạo user, trừ user đầu tiên khi DB trống và ALLOW_FIRST_USER=true (R21). */
const canCreateUser: Access = async ({ req }) => {
  if (isReviewer({ req })) return true
  if (req.user) return false
  if (process.env.ALLOW_FIRST_USER !== 'true') return false
  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
  })
  return totalDocs === 0
}

const readOwnOrReviewer: Access = ({ req }) => {
  if (!req.user) return false
  if (isReviewerUser(req.user)) return true
  return { id: { equals: req.user.id } }
}

/** User đầu tiên (bootstrap) luôn là reviewer và chỉ được tạo khi ALLOW_FIRST_USER=true. */
const firstUserIsReviewer: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data
  // Seed/test có thể tắt bootstrap khi chủ động chỉ định vai trò.
  if (req.context?.skipFirstUserBootstrap) return data
  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
  })
  if (totalDocs === 0) {
    // Chặn cả đường /api/users/first-register (Payload gọi create với overrideAccess).
    if (process.env.ALLOW_FIRST_USER !== 'true') throw new Forbidden(req.t)
    return { ...data, role: 'reviewer' }
  }
  return data
}

const LAST_REVIEWER = 'Phải còn ít nhất một người duyệt.'

const countReviewers = async (req: Parameters<CollectionBeforeDeleteHook>[0]['req']) => {
  const { totalDocs } = await req.payload.count({
    collection: 'users',
    where: { role: { equals: 'reviewer' } },
    overrideAccess: true,
    req,
  })
  return totalDocs
}

/** R9: không để hệ thống hết người duyệt (race giữa hai người duyệt xoá nhau được chấp nhận). */
const keepOneReviewerOnDemote: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  if (operation !== 'update') return data
  if (originalDoc?.role === 'reviewer' && data?.role === 'editor' && (await countReviewers(req)) <= 1) {
    throw new ValidationError({
      collection: 'users',
      errors: [{ message: LAST_REVIEWER, path: 'role' }],
    })
  }
  return data
}

const keepOneReviewerOnDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  // Test dọn DB cần xoá sạch, kể cả người duyệt cuối.
  if (req.context?.skipLastReviewerGuard) return
  const doc = await req.payload.findByID({
    collection: 'users',
    id,
    depth: 0,
    overrideAccess: true,
    req,
  })
  if (doc.role === 'reviewer' && (await countReviewers(req)) <= 1) {
    throw new APIError(LAST_REVIEWER, 400)
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Người dùng', plural: 'Người dùng' },
  admin: {
    group: ADMIN_GROUPS.admin,
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    create: canCreateUser,
    delete: isReviewer,
    read: readOwnOrReviewer,
    update: readOwnOrReviewer,
  },
  hooks: {
    beforeChange: [firstUserIsReviewer, keepOneReviewerOnDemote],
    beforeDelete: [keepOneReviewerOnDelete],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Họ và tên' },
    {
      name: 'role',
      type: 'select',
      label: 'Vai trò',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Biên tập viên', value: 'editor' },
        { label: 'Người duyệt', value: 'reviewer' },
      ],
      access: {
        create: reviewerOnlyField,
        update: reviewerOnlyField,
      },
      admin: controlFieldAdmin(),
    },
  ],
}

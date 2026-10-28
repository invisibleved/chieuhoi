import {
  APIError,
  Forbidden,
  ValidationError,
  type Access,
  type CollectionBeforeChangeHook,
  type CollectionBeforeOperationHook,
  type CollectionConfig,
  type PayloadRequest,
  type Where,
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

type GuardArgs = { data?: { role?: unknown }; id?: number | string; where?: Where }

const countReviewers = async (req: PayloadRequest, where?: Where) => {
  const { totalDocs } = await req.payload.count({
    collection: 'users',
    where: where ? { and: [{ role: { equals: 'reviewer' } }, where] } : { role: { equals: 'reviewer' } },
    overrideAccess: true,
    req,
  })
  return totalDocs
}

/**
 * R9: không để hệ thống hết người duyệt (race giữa hai người duyệt xoá nhau được chấp nhận).
 * Kiểm ở beforeOperation, một lần cho cả thao tác: Payload chạy hook từng bản ghi song song
 * trong một transaction, nên xoá/hạ hàng loạt sẽ thấy cùng một số đếm ở mọi bản ghi.
 */
const keepOneReviewer: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  if (operation !== 'delete' && operation !== 'update') return args
  // Lối tắt chỉ dành cho test (resetDb) qua local API: dọn DB cần xoá sạch, kể cả người duyệt cuối.
  if (req.context?.skipLastReviewerGuard) return args
  const { data, id, where } = args as GuardArgs
  // Hạ vai trò = vai trò mới không còn là người duyệt.
  if (operation === 'update' && (data?.role === undefined || data.role === 'reviewer')) return args
  const target: Where | undefined = id !== undefined ? { id: { equals: id } } : where
  if (!target) return args

  const { docs } = await req.payload.find({
    collection: 'users',
    where: target,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  const targetIds = docs.map((d) => d.id)
  if (targetIds.length === 0) return args
  const affected = await countReviewers(req, { id: { in: targetIds } })
  if (affected === 0 || affected < (await countReviewers(req))) return args

  if (operation === 'delete') throw new APIError(LAST_REVIEWER, 400)
  throw new ValidationError({
    collection: 'users',
    errors: [{ message: LAST_REVIEWER, path: 'role' }],
  })
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
    beforeChange: [firstUserIsReviewer],
    beforeOperation: [keepOneReviewer],
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

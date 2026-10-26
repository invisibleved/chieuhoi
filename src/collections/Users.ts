import type { Access, CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isReviewer, isReviewerUser, reviewerOnlyField } from '@/access/roles'

/** Không có đăng ký công khai: chỉ người duyệt tạo user, trừ user đầu tiên khi DB trống. */
const canCreateUser: Access = async ({ req }) => {
  if (isReviewer({ req })) return true
  if (req.user) return false
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

/** User đầu tiên (bootstrap) luôn là reviewer, kể cả khi trường role bị access chặn. */
const firstUserIsReviewer: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data
  // Seed/test có thể tắt bootstrap khi chủ động chỉ định vai trò.
  if (req.context?.skipFirstUserBootstrap) return data
  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
  })
  if (totalDocs === 0) return { ...data, role: 'reviewer' }
  return data
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
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
    },
  ],
}

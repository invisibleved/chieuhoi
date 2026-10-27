import { randomUUID } from 'crypto'
import path from 'path'
import { ValidationError, type Access, type CollectionConfig, type Where } from 'payload'
import { fileURLToPath } from 'url'

import { isAssetPubliclyAllowed, publicAssetQuery } from '@/access/assetRules'
import { isLoggedIn, isReviewer, isReviewerUser, reviewerOnlyField } from '@/access/roles'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export { isAssetPubliclyAllowed }

/** Nguồn duy nhất của nhãn chủ đề và thời kỳ ảnh tư liệu. */
export const ARCHIVE_CATEGORY_OPTIONS = [
  { label: 'Làng quê', value: 'village' },
  { label: 'Nghề dệt', value: 'weaving' },
  { label: 'Con người', value: 'people' },
  { label: 'Sản phẩm', value: 'products' },
  { label: 'Ký ức', value: 'memory' },
  { label: 'Tư liệu lịch sử', value: 'history' },
]
export const ARCHIVE_ERA_OPTIONS = [
  { label: 'Xưa', value: 'old' },
  { label: 'Nay', value: 'now' },
]

// R19: khách chỉ được tải file (isReadingStaticFile), không liệt kê/đọc metadata qua REST.
const readAccess: Access = ({ req, isReadingStaticFile }) => {
  if (req.user) return true
  return isReadingStaticFile ? publicAssetQuery : false
}

// R20: ảnh đã duyệt công khai chỉ người duyệt được sửa (kể cả thay file). Kiểm tra ở access
// để Payload từ chối trước khi xoá file cũ khi thay file.
const notYetPublic: Where = {
  or: [
    { rights: { not_equals: 'permitted' } },
    { subjectConsent: { not_in: ['not_applicable', 'given'] } },
    { subjectConsent: { exists: false } },
  ],
}

const updateAccess: Access = ({ req }) => {
  if (!req.user) return false
  if (isReviewerUser(req.user)) return true
  return notYetPublic
}

const webp = { formatOptions: { format: 'webp' as const } }

export const ArchiveAssets: CollectionConfig = {
  slug: 'archive-assets',
  labels: { singular: 'Tư liệu ảnh', plural: 'Kho tư liệu ảnh' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['code', 'title', 'category', 'rights', 'subjectConsent'],
  },
  access: { read: readAccess, create: isLoggedIn, update: updateAccess, delete: isReviewer },
  upload: {
    staticDir: process.env.MEDIA_DIR || path.resolve(dirname, '../../media'),
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumb', width: 480, withoutEnlargement: true, ...webp },
      { name: 'card', width: 960, withoutEnlargement: true, ...webp },
      { name: 'wide', width: 1600, withoutEnlargement: true, ...webp },
      { name: 'full', width: 2400, withoutEnlargement: true, ...webp },
    ],
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      label: 'Mã tư liệu',
      unique: true,
      admin: { description: 'Ví dụ: TL-001' },
    },
    { name: 'title', type: 'text', label: 'Tiêu đề', localized: true },
    { name: 'description', type: 'textarea', label: 'Mô tả', localized: true },
    { name: 'alt', type: 'text', label: 'Văn bản thay thế', required: true, localized: true },
    {
      name: 'category',
      type: 'select',
      label: 'Chủ đề',
      options: ARCHIVE_CATEGORY_OPTIONS,
    },
    {
      name: 'era',
      type: 'select',
      label: 'Thời kỳ',
      options: ARCHIVE_ERA_OPTIONS,
    },
    { name: 'takenAt', type: 'text', label: 'Thời điểm chụp' },
    { name: 'relatedLabel', type: 'text', label: 'Nhãn liên quan' },
    { name: 'relatedHref', type: 'text', label: 'Liên kết liên quan' },
    { name: 'photographer', type: 'text', label: 'Người chụp' },
    { name: 'owner', type: 'text', label: 'Chủ sở hữu' },
    { name: 'source', type: 'text', label: 'Nguồn' },
    {
      name: 'rights',
      type: 'select',
      label: 'Quyền sử dụng',
      defaultValue: 'unknown',
      required: true,
      options: [
        { label: 'Chưa rõ', value: 'unknown' },
        { label: 'Được phép', value: 'permitted' },
        { label: 'Hạn chế', value: 'restricted' },
      ],
      access: { create: reviewerOnlyField, update: reviewerOnlyField },
    },
    {
      name: 'subjectConsent',
      type: 'select',
      label: 'Đồng ý của người trong ảnh',
      defaultValue: 'pending',
      required: true,
      options: [
        { label: 'Không áp dụng', value: 'not_applicable' },
        { label: 'Đang chờ', value: 'pending' },
        { label: 'Đã đồng ý', value: 'given' },
      ],
      access: { create: reviewerOnlyField, update: reviewerOnlyField },
    },
    {
      name: 'sourceFile',
      type: 'text',
      label: 'Tên file tham chiếu gốc',
      admin: { readOnly: true, description: 'Chỉ seed ghi; dùng làm khoá tự nhiên, không công khai.' },
      access: { create: () => false, update: () => false, read: reviewerOnlyField },
    },
    { name: 'inArchive', type: 'checkbox', label: 'Thuộc kho tư liệu', defaultValue: false },
  ],
  hooks: {
    // R24: tên file công khai là mã tư liệu hoặc UUID, không bao giờ là tên file gốc (cả khi thay file).
    beforeOperation: [
      ({ args, operation }) => {
        if (operation !== 'create' && operation !== 'update') return
        const req = (args as { req?: { file?: { name: string } } }).req
        const data = (args as { data?: { code?: string } }).data
        if (!req?.file) return
        const ext = path.extname(req.file.name).toLowerCase()
        const safeCode = (data?.code ?? '').replace(/[^A-Za-z0-9_-]/g, '')
        req.file.name = `${safeCode || randomUUID()}${ext}`
      },
    ],
    beforeValidate: [
      ({ data, originalDoc }) => {
        const merged = { ...originalDoc, ...data }
        if (merged.inArchive) {
          const missing = ['code', 'category', 'era'].filter((f) => !merged[f])
          if (missing.length) {
            throw new ValidationError({
              collection: 'archive-assets',
              errors: missing.map((path) => ({
                message: 'Bắt buộc khi ảnh thuộc kho tư liệu.',
                path,
              })),
            })
          }
        }
        return data
      },
    ],
  },
}

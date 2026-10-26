import path from 'path'
import { ValidationError, type Access, type CollectionConfig, type Where } from 'payload'
import { fileURLToPath } from 'url'

import { isLoggedIn, isReviewer, reviewerOnlyField } from '@/access/roles'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** Luật công khai duy nhất của ảnh: được phép dùng và không còn chờ đồng ý. */
export function isAssetPubliclyAllowed(doc: { rights: string; subjectConsent: string }): boolean {
  return doc.rights === 'permitted' && doc.subjectConsent !== 'pending'
}

/** Cùng luật với isAssetPubliclyAllowed, viết dạng truy vấn cho khách. */
const publicAssetQuery: Where = {
  and: [{ rights: { equals: 'permitted' } }, { subjectConsent: { not_equals: 'pending' } }],
}

const readAccess: Access = ({ req }) => (req.user ? true : publicAssetQuery)

const webp = { formatOptions: { format: 'webp' as const } }

export const ArchiveAssets: CollectionConfig = {
  slug: 'archive-assets',
  labels: { singular: 'Tư liệu ảnh', plural: 'Kho tư liệu ảnh' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['code', 'title', 'category', 'rights', 'subjectConsent'],
  },
  access: { read: readAccess, create: isLoggedIn, update: isLoggedIn, delete: isReviewer },
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
      options: [
        { label: 'Làng quê', value: 'village' },
        { label: 'Nghề dệt', value: 'weaving' },
        { label: 'Con người', value: 'people' },
        { label: 'Sản phẩm', value: 'products' },
        { label: 'Ký ức', value: 'memory' },
        { label: 'Tư liệu lịch sử', value: 'history' },
      ],
    },
    {
      name: 'era',
      type: 'select',
      label: 'Thời kỳ',
      options: [
        { label: 'Xưa', value: 'old' },
        { label: 'Nay', value: 'now' },
      ],
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
    { name: 'inArchive', type: 'checkbox', label: 'Thuộc kho tư liệu', defaultValue: false },
  ],
  hooks: {
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

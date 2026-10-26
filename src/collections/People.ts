import type { CollectionConfig } from 'payload'

import { reviewerOnlyField } from '@/access/roles'
import { contentCollectionDefaults, workflowField } from '@/access/publishing'

import { restrictedEditor } from './restrictedEditor'

/** Chữ thường, bỏ dấu, khoảng trắng và ký tự lạ thành '-'. */
const slugify = (v: string) =>
  v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const control = { create: reviewerOnlyField, update: reviewerOnlyField }

export const People: CollectionConfig = {
  slug: 'people',
  labels: { singular: 'Con người', plural: 'Con người' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'category', 'workflow'] },
  ...contentCollectionDefaults,
  fields: [
    workflowField(),
    {
      name: 'slug',
      type: 'text',
      label: 'Đường dẫn',
      required: true,
      unique: true,
      // R24: slug lộ ra URL công khai nên không được chứa tên (khi chưa có đồng ý dùng tên).
      validate: (value: string | null | undefined, { siblingData }: { siblingData: unknown }) => {
        if (!value) return 'Bắt buộc.'
        const name = (siblingData as { name?: unknown } | undefined)?.name
        const n = typeof name === 'string' ? slugify(name) : ''
        if (n && slugify(value).includes(n)) return 'Đường dẫn không được chứa tên người.'
        return true
      },
    },
    { name: 'name', type: 'text', label: 'Tên', localized: true },
    {
      name: 'category',
      type: 'select',
      label: 'Nhóm',
      options: [
        { label: 'Nghệ nhân', value: 'artisan' },
        { label: 'Gia đình làm nghề', value: 'craft-family' },
        { label: 'Người giữ nghề', value: 'craft-keeper' },
        { label: 'Thế hệ trẻ', value: 'young-generation' },
        { label: 'Những người gắn bó với làng', value: 'village-bound' },
      ],
    },
    { name: 'role', type: 'text', label: 'Vai trò', localized: true },
    { name: 'note', type: 'text', label: 'Ghi chú', localized: true },
    { name: 'yearsInCraft', type: 'text', label: 'Số năm theo nghề' },
    { name: 'portrait', type: 'relationship', relationTo: 'archive-assets', label: 'Ảnh chân dung' },
    { name: 'story', type: 'richText', label: 'Câu chuyện', localized: true, editor: restrictedEditor() },
    { name: 'quote', type: 'textarea', label: 'Trích dẫn', localized: true },
    { name: 'quoteSource', type: 'relationship', relationTo: 'sources', label: 'Nguồn trích dẫn' },
    {
      name: 'consent',
      type: 'group',
      label: 'Đồng ý công khai',
      fields: [
        { name: 'name', type: 'checkbox', label: 'Tên', defaultValue: false, access: control },
        { name: 'photo', type: 'checkbox', label: 'Ảnh', defaultValue: false, access: control },
        { name: 'quote', type: 'checkbox', label: 'Trích dẫn', defaultValue: false, access: control },
      ],
    },
    {
      name: 'reviewedBySubject',
      type: 'checkbox',
      label: 'Nhân vật đã xem lại',
      defaultValue: false,
      access: control,
    },
  ],
}

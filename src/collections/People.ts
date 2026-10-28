import { BlocksFeature } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { ADMIN_GROUPS, controlFieldAdmin, reviewerOnlyField } from '@/access/roles'
import { contentCollectionDefaults, workflowField } from '@/access/publishing'
import { slugify } from '@/lib/slugify'

import { citeInlineBlock, restrictedEditor } from './restrictedEditor'

/** Nguồn duy nhất của nhãn nhóm; lớp content map value -> label từ đây. */
export const PERSON_CATEGORY_OPTIONS = [
  { label: 'Nghệ nhân', value: 'artisan' },
  { label: 'Gia đình làm nghề', value: 'craft-family' },
  { label: 'Người giữ nghề', value: 'craft-keeper' },
  { label: 'Thế hệ trẻ', value: 'young-generation' },
  { label: 'Những người gắn bó với làng', value: 'village-bound' },
]

const control = { create: reviewerOnlyField, update: reviewerOnlyField }
const controlAdmin = controlFieldAdmin()

export const People: CollectionConfig = {
  slug: 'people',
  labels: { singular: 'Con người', plural: 'Con người' },
  admin: {
    group: ADMIN_GROUPS.content,
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'workflow'],
  },
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
      options: PERSON_CATEGORY_OPTIONS,
    },
    { name: 'role', type: 'text', label: 'Vai trò', localized: true },
    { name: 'note', type: 'text', label: 'Ghi chú', localized: true },
    { name: 'intro', type: 'textarea', label: 'Câu giới thiệu', localized: true },
    { name: 'yearsInCraft', type: 'text', label: 'Số năm theo nghề' },
    { name: 'hamlet', type: 'text', label: 'Xóm, thôn' },
    { name: 'recordedBy', type: 'text', label: 'Người ghi lại' },
    {
      name: 'recordedAt',
      type: 'text',
      label: 'Ngày ghi lại (YYYY-MM-DD)',
      validate: (value: string | null | undefined) =>
        !value || /^\d{4}-\d{2}-\d{2}$/.test(value) ? true : 'Ngày ghi lại phải có dạng YYYY-MM-DD.',
    },
    { name: 'portrait', type: 'relationship', relationTo: 'archive-assets', label: 'Ảnh chân dung' },
    {
      name: 'story',
      type: 'richText',
      label: 'Câu chuyện',
      localized: true,
      // Chỉ cho chú thích nguồn (cite); không có khối ảnh trong câu chuyện chân dung.
      editor: restrictedEditor([BlocksFeature({ inlineBlocks: [citeInlineBlock()] })]),
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Phóng sự ảnh',
      maxRows: 6,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'archive-assets', required: true, label: 'Ảnh' },
        { name: 'caption', type: 'text', label: 'Chú thích', localized: true },
      ],
    },
    { name: 'relatedStep', type: 'relationship', relationTo: 'craft-steps', label: 'Công đoạn liên quan' },
    { name: 'relatedProduct', type: 'relationship', relationTo: 'products', label: 'Hiện vật liên quan' },
    { name: 'quote', type: 'textarea', label: 'Trích dẫn', localized: true },
    { name: 'quoteSource', type: 'relationship', relationTo: 'sources', label: 'Nguồn trích dẫn' },
    {
      name: 'consent',
      type: 'group',
      label: 'Đồng ý công khai',
      fields: [
        { name: 'name', type: 'checkbox', label: 'Tên', defaultValue: false, access: control, admin: controlAdmin },
        { name: 'photo', type: 'checkbox', label: 'Ảnh', defaultValue: false, access: control, admin: controlAdmin },
        { name: 'quote', type: 'checkbox', label: 'Trích dẫn', defaultValue: false, access: control, admin: controlAdmin },
      ],
    },
    {
      name: 'reviewedBySubject',
      type: 'checkbox',
      label: 'Nhân vật đã xem lại',
      defaultValue: false,
      access: control,
      admin: controlAdmin,
    },
  ],
}

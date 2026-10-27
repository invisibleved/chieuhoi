import type { CollectionConfig } from 'payload'

import { reviewerOnlyField } from '@/access/roles'
import { contentCollectionDefaults, workflowField } from '@/access/publishing'

/** Nguồn duy nhất của nhãn nhóm sản phẩm. */
export const PRODUCT_GROUP_OPTIONS = [
  { label: 'Chiếu cói truyền thống', value: 'traditional' },
  { label: 'Chiếu đương đại', value: 'contemporary' },
]

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Sản phẩm', plural: 'Sản phẩm' },
  admin: { useAsTitle: 'name', defaultColumns: ['code', 'name', 'group', 'workflow'] },
  ...contentCollectionDefaults,
  fields: [
    workflowField(),
    { name: 'slug', type: 'text', label: 'Đường dẫn', required: true, unique: true },
    {
      name: 'code',
      type: 'text',
      label: 'Mã hiện vật',
      localized: true,
      admin: { description: 'Ví dụ: HIỆN VẬT 01' },
    },
    { name: 'name', type: 'text', label: 'Tên', localized: true },
    {
      name: 'group',
      type: 'select',
      label: 'Nhóm',
      options: PRODUCT_GROUP_OPTIONS,
    },
    { name: 'summary', type: 'textarea', label: 'Tóm tắt', localized: true },
    { name: 'images', type: 'relationship', relationTo: 'archive-assets', hasMany: true, label: 'Ảnh' },
    { name: 'material', type: 'text', label: 'Chất liệu', localized: true },
    { name: 'technique', type: 'text', label: 'Kỹ thuật', localized: true },
    { name: 'size', type: 'text', label: 'Kích thước', localized: true },
    { name: 'care', type: 'textarea', label: 'Bảo quản', localized: true },
    {
      name: 'annotations',
      type: 'array',
      label: 'Chú thích',
      fields: [
        { name: 'n', type: 'number', label: 'Số' },
        { name: 'title', type: 'text', label: 'Tiêu đề', localized: true },
        { name: 'x', type: 'number', label: 'X (%)', min: 0, max: 100 },
        { name: 'y', type: 'number', label: 'Y (%)', min: 0, max: 100 },
        { name: 'body', type: 'textarea', label: 'Nội dung', localized: true },
        { name: 'source', type: 'relationship', relationTo: 'sources', label: 'Nguồn' },
      ],
    },
    {
      name: 'typeConfirmed',
      type: 'checkbox',
      label: 'Đã xác nhận loại hình',
      defaultValue: false,
      access: { create: reviewerOnlyField, update: reviewerOnlyField },
    },
    { name: 'maker', type: 'relationship', relationTo: 'makers', label: 'Cơ sở dệt' },
  ],
}

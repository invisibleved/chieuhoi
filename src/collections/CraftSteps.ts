import type { CollectionConfig } from 'payload'

import { ADMIN_GROUPS, controlFieldAdmin, reviewerOnlyField } from '@/access/roles'
import { contentCollectionDefaults, workflowField, previewFor } from '@/access/publishing'

export const CraftSteps: CollectionConfig = {
  slug: 'craft-steps',
  labels: { singular: 'Công đoạn', plural: 'Công đoạn làm nghề' },
  admin: {
    preview: previewFor('craft-steps'),
    group: ADMIN_GROUPS.content,
    useAsTitle: 'title',
    defaultColumns: ['n', 'title', 'workflow'],
  },
  ...contentCollectionDefaults,
  fields: [
    workflowField(),
    { name: 'n', type: 'number', label: 'Thứ tự', required: true, unique: true, min: 1, max: 7 },
    { name: 'title', type: 'text', label: 'Tên công đoạn', localized: true },
    { name: 'shortTitle', type: 'text', label: 'Tên ngắn (mobile)', localized: true },
    { name: 'subtitle', type: 'text', label: 'Phụ đề', localized: true },
    { name: 'body', type: 'textarea', label: 'Nội dung', localized: true },
    { name: 'tools', type: 'text', label: 'Dụng cụ', localized: true },
    { name: 'toRecord', type: 'text', label: 'Cần ghi chép thêm', localized: true },
    { name: 'image', type: 'relationship', relationTo: 'archive-assets', label: 'Ảnh' },
    { name: 'shotNeeded', type: 'text', label: 'Ảnh cần chụp', localized: true },
    { name: 'focusX', type: 'number', label: 'Tiêu điểm X (%)', min: 0, max: 100 },
    { name: 'focusY', type: 'number', label: 'Tiêu điểm Y (%)', min: 0, max: 100 },
    {
      name: 'verifiedBy',
      type: 'text',
      label: 'Người xác minh',
      access: { create: reviewerOnlyField, update: reviewerOnlyField },
      admin: controlFieldAdmin(),
    },
  ],
}

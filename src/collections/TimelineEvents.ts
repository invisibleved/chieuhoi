import type { CollectionConfig } from 'payload'

import { contentCollectionDefaults, workflowField, previewFor } from '@/access/publishing'
import { ADMIN_GROUPS, controlFieldAdmin, reviewerOnlyField } from '@/access/roles'

export const TimelineEvents: CollectionConfig = {
  slug: 'timeline-events',
  labels: { singular: 'Mốc thời gian', plural: 'Dòng thời gian' },
  admin: {
    preview: previewFor('timeline-events'),
    group: ADMIN_GROUPS.content,
    useAsTitle: 'title',
    defaultColumns: ['label', 'title', 'order', 'workflow'],
  },
  ...contentCollectionDefaults,
  fields: [
    {
      name: 'label',
      type: 'text',
      label: 'Mốc',
      required: true,
      admin: { description: 'Chuỗi tự do: "1457", "Thời Lê", "[?]"' },
    },
    { name: 'title', type: 'text', label: 'Tiêu đề', localized: true, required: true },
    { name: 'body', type: 'textarea', label: 'Nội dung', localized: true },
    { name: 'order', type: 'number', label: 'Thứ tự', required: true },
    {
      name: 'confidence',
      type: 'select',
      label: 'Độ tin cậy',
      defaultValue: 'pending',
      options: [
        { label: 'Báo chí', value: 'press' },
        { label: 'Truyền miệng', value: 'oral' },
        { label: 'Chờ xác minh', value: 'pending' },
      ],
      access: { create: reviewerOnlyField, update: reviewerOnlyField },
      admin: controlFieldAdmin(),
    },
    { name: 'sources', type: 'relationship', relationTo: 'sources', hasMany: true, label: 'Nguồn' },
    workflowField(),
  ],
}

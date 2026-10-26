import type { CollectionConfig } from 'payload'

import { contentCollectionDefaults, workflowField } from '@/access/publishing'
import { reviewerOnlyField } from '@/access/roles'

export const TimelineEvents: CollectionConfig = {
  slug: 'timeline-events',
  labels: { singular: 'Mốc thời gian', plural: 'Dòng thời gian' },
  admin: { useAsTitle: 'title', defaultColumns: ['label', 'title', 'order', 'workflow'] },
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
    },
    { name: 'sources', type: 'relationship', relationTo: 'sources', hasMany: true, label: 'Nguồn' },
    workflowField(),
  ],
}

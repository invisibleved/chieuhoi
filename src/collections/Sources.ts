import type { CollectionConfig } from 'payload'

import { isLoggedIn, isReviewer } from '@/access/roles'

export const Sources: CollectionConfig = {
  slug: 'sources',
  labels: { singular: 'Nguồn', plural: 'Nguồn' },
  admin: { useAsTitle: 'title', defaultColumns: ['sourceId', 'title', 'publisher', 'date'] },
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isReviewer },
  fields: [
    {
      name: 'sourceId',
      type: 'text',
      label: 'Mã nguồn',
      required: true,
      unique: true,
      admin: { description: 'Ví dụ: vietnamplus-2026' },
    },
    { name: 'publisher', type: 'text', label: 'Đơn vị xuất bản' },
    { name: 'title', type: 'text', label: 'Tiêu đề', required: true },
    { name: 'url', type: 'text', label: 'Đường dẫn' },
    { name: 'date', type: 'text', label: 'Ngày', admin: { description: 'Dạng YYYY-MM-DD' } },
  ],
}

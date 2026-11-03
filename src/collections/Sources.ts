import type { CollectionConfig, TextFieldSingleValidation } from 'payload'

import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { blockCitedSourceDelete } from '@/hooks/sourceRefs'
import { ADMIN_GROUPS, isLoggedIn, isReviewer } from '@/access/roles'

const URL_MESSAGE = 'Chỉ nhận đường dẫn http:// hoặc https://.'
const DATE_MESSAGE = 'Ngày phải có dạng YYYY-MM-DD.'

export const validateHttpUrl: TextFieldSingleValidation = (value) => {
  if (value === undefined || value === null || value === '') return true
  return /^https?:\/\//i.test(value) ? true : URL_MESSAGE
}

export const validateIsoDate: TextFieldSingleValidation = (value) => {
  if (value === undefined || value === null || value === '') return true
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!m) return DATE_MESSAGE
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(Date.UTC(y, mo - 1, d))
  const real = date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d
  return real ? true : DATE_MESSAGE
}

export const Sources: CollectionConfig = {
  slug: 'sources',
  labels: { singular: 'Nguồn', plural: 'Nguồn' },
  admin: {
    group: ADMIN_GROUPS.archive,
    useAsTitle: 'title',
    defaultColumns: ['sourceId', 'title', 'publisher', 'date'],
  },
  access: { read: isLoggedIn, create: isLoggedIn, update: isReviewer, delete: isReviewer },
  hooks: {
    beforeDelete: [blockCitedSourceDelete],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
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
    { name: 'url', type: 'text', label: 'Đường dẫn', validate: validateHttpUrl },
    {
      name: 'date',
      type: 'text',
      label: 'Ngày',
      validate: validateIsoDate,
      admin: { description: 'Dạng YYYY-MM-DD. Để trống nếu chưa rõ.' },
    },
  ],
}

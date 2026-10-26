import type { CollectionConfig } from 'payload'

import { reviewerOnlyField } from '@/access/roles'
import { contentCollectionDefaults, workflowField } from '@/access/publishing'

const control = { create: reviewerOnlyField, update: reviewerOnlyField }

export const Makers: CollectionConfig = {
  slug: 'makers',
  labels: { singular: 'Cơ sở dệt', plural: 'Cơ sở dệt' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'verified', 'publicConsent'] },
  ...contentCollectionDefaults,
  fields: [
    workflowField(),
    { name: 'name', type: 'text', label: 'Tên', localized: true },
    { name: 'contact', type: 'textarea', label: 'Liên hệ' },
    { name: 'verified', type: 'checkbox', label: 'Đã xác minh', defaultValue: false, access: control },
    {
      name: 'publicConsent',
      type: 'checkbox',
      label: 'Đồng ý công khai',
      defaultValue: false,
      access: control,
    },
  ],
}

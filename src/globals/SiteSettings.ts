import type { GlobalConfig } from 'payload'

import { guardPublish, recordDraftArg } from '@/access/publishing'
import { isLoggedIn } from '@/access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Thông tin site',
  versions: { drafts: true },
  access: { read: isLoggedIn, update: isLoggedIn },
  hooks: { beforeOperation: [recordDraftArg], beforeChange: [guardPublish] },
  fields: [
    { name: 'tagline', type: 'text', label: 'Khẩu hiệu', localized: true },
    { name: 'description', type: 'textarea', label: 'Mô tả site', localized: true },
    { name: 'address', type: 'text', label: 'Địa chỉ', localized: true },
    { name: 'addressNote', type: 'text', label: 'Ghi chú địa chỉ', localized: true },
    { name: 'email', type: 'email', label: 'Email' },
    { name: 'phone', type: 'text', label: 'Điện thoại' },
    { name: 'visitInfo', type: 'textarea', label: 'Thông tin tham quan', localized: true },
    { name: 'copyright', type: 'text', label: 'Bản quyền', localized: true },
  ],
}

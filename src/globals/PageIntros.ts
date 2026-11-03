import type { Field, GlobalConfig } from 'payload'

import { guardPublish, recordDraftArg, previewFor } from '@/access/publishing'
import { revalidateGlobalAfterChange } from '@/hooks/revalidate'
import { ADMIN_GROUPS, isLoggedIn } from '@/access/roles'
import { ROUTE_KEYS, ROUTE_LABELS, type RouteKey } from '@/collections/pages/routeKeys'
import { craftFactsFields, villageFactsFields } from './pageFacts'
import { PAGE_MEDIA_SLOTS, PAGE_MEDIA_SLOT_LABELS, isPageMediaRoute } from './pageMedia'

export { ROUTE_KEYS }
export type { RouteKey }

const pageMediaField = (key: keyof typeof PAGE_MEDIA_SLOTS): Field => ({
  name: 'media',
  type: 'array',
  label: 'Ảnh của trang',
  maxRows: PAGE_MEDIA_SLOTS[key].length,
  validate: (rows: unknown) => {
    const slots = ((rows as { slot?: string }[] | null | undefined) ?? []).map((r) => r?.slot)
    return new Set(slots).size === slots.length ? true : 'Mỗi ô ảnh chỉ được dùng một lần.'
  },
  fields: [
    {
      name: 'slot',
      type: 'select',
      label: 'Ô ảnh',
      required: true,
      options: PAGE_MEDIA_SLOTS[key].map((v) => ({ value: v, label: PAGE_MEDIA_SLOT_LABELS[v] })),
    },
    { name: 'image', type: 'upload', relationTo: 'archive-assets', label: 'Ảnh' },
    { name: 'caption', type: 'text', label: 'Chú thích', localized: true },
  ],
})

const routeGroup = (key: RouteKey): Field => ({
  name: key,
  type: 'group',
  label: ROUTE_LABELS[key],
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Dòng nhỏ phía trên', localized: true },
    { name: 'title', type: 'textarea', label: 'Tiêu đề (giữ ngắt dòng)', localized: true },
    { name: 'lead', type: 'textarea', label: 'Đoạn dẫn', localized: true },
    ...(key === 'home'
      ? ([
          { name: 'heroTitle', type: 'textarea', label: 'Tiêu đề hero (giữ ngắt dòng)', localized: true },
          { name: 'heroImage', type: 'upload', relationTo: 'archive-assets', label: 'Ảnh hero' },
          { name: 'heroInset', type: 'upload', relationTo: 'archive-assets', label: 'Ảnh nhỏ cạnh hero' },
          { name: 'heroCaption', type: 'text', label: 'Chú thích ảnh hero', localized: true },
          {
            name: 'villageImages', type: 'array', label: 'Ảnh mục Làng Hới', maxRows: 2,
            fields: [
              { name: 'image', type: 'upload', relationTo: 'archive-assets', label: 'Ảnh' },
              { name: 'caption', type: 'text', label: 'Chú thích', localized: true },
            ],
          },
        ] as Field[])
      : []),
    ...(isPageMediaRoute(key) ? [pageMediaField(key)] : []),
    ...(key === 'lang-hoi' ? villageFactsFields() : []),
    ...(key === 'nghe-det-chieu' ? craftFactsFields() : []),
  ],
})

export const PageIntros: GlobalConfig = {
  slug: 'page-intros',
  label: 'Phần mở đầu trang',
  admin: { group: ADMIN_GROUPS.pages, preview: previewFor('page-intros') },
  versions: { drafts: true },
  access: { read: isLoggedIn, update: isLoggedIn },
  hooks: {
    beforeOperation: [recordDraftArg], beforeChange: [guardPublish],
    afterChange: [revalidateGlobalAfterChange],
  },
  fields: ROUTE_KEYS.map(routeGroup),
}
